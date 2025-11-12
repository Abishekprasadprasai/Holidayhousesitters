-- CRITICAL SECURITY FIX: Move roles to separate table to prevent privilege escalation

-- Create app_role enum (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'homeowner', 'sitter');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to safely check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Only admins can insert roles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Drop existing policies that depend on profiles.role column
DROP POLICY IF EXISTS "Homeowners can create listings" ON public.listings;
DROP POLICY IF EXISTS "Sitters can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Only admins can create verification logs" ON public.verification_logs;
DROP POLICY IF EXISTS "Only admins can view verification logs" ON public.verification_logs;

-- Now safe to drop the role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Recreate policies using has_role() function

-- Listings policies
CREATE POLICY "Homeowners can create listings"
ON public.listings
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'homeowner') AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND is_verified = true
      AND is_paid = true
  )
);

-- Bookings policies
CREATE POLICY "Sitters can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (
  sitter_id = auth.uid() AND
  public.has_role(auth.uid(), 'sitter') AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND is_verified = true
      AND is_paid = true
  )
);

-- Verification logs policies
CREATE POLICY "Only admins can create verification logs"
ON public.verification_logs
FOR INSERT
WITH CHECK (
  admin_id = auth.uid() AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can view verification logs"
ON public.verification_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update the handle_new_user function to insert into user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User')
  );
  
  -- Insert role into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'sitter')
  );
  
  RETURN NEW;
END;
$$;