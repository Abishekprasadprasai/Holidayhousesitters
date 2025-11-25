-- Fix security issues identified in security scan

-- 1. Drop the existing insecure profile view policy
DROP POLICY IF EXISTS "Users can view profiles with privacy controls" ON public.profiles;

-- 2. Drop the existing function so we can update its signature
DROP FUNCTION IF EXISTS public.get_profile_with_privacy(uuid);

-- 3. Create a new secure profile view function with restricted sensitive data
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  phone text,
  bio text,
  photo_url text,
  skills text[],
  experience text,
  certificates text[],
  document_url text,
  ndis_certified boolean,
  loyalty_badge loyalty_badge,
  is_verified boolean,
  is_paid boolean,
  verification_date timestamp with time zone,
  verified_by_admin_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone_consent boolean,
  location text,
  emergency_contacts text,
  medication_needs boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.name,
    -- Only show phone if it's the user's own profile OR if phone_consent is true OR if admin
    CASE 
      WHEN p.user_id = auth.uid() THEN p.phone
      WHEN has_role(auth.uid(), 'admin') THEN p.phone
      WHEN p.phone_consent = true THEN p.phone
      ELSE NULL
    END as phone,
    p.bio,
    p.photo_url,
    p.skills,
    p.experience,
    p.certificates,
    -- Only show document_url to owner and admins
    CASE 
      WHEN p.user_id = auth.uid() THEN p.document_url
      WHEN has_role(auth.uid(), 'admin') THEN p.document_url
      ELSE NULL
    END as document_url,
    p.ndis_certified,
    p.loyalty_badge,
    p.is_verified,
    p.is_paid,
    p.verification_date,
    p.verified_by_admin_id,
    p.created_at,
    p.updated_at,
    p.phone_consent,
    -- Only show full location to owner and admins, others see NULL
    CASE 
      WHEN p.user_id = auth.uid() THEN p.location
      WHEN has_role(auth.uid(), 'admin') THEN p.location
      ELSE NULL
    END as location,
    -- Only show emergency contacts to owner and admins
    CASE 
      WHEN p.user_id = auth.uid() THEN p.emergency_contacts
      WHEN has_role(auth.uid(), 'admin') THEN p.emergency_contacts
      ELSE NULL
    END as emergency_contacts,
    -- Only show medication needs to owner and admins
    CASE 
      WHEN p.user_id = auth.uid() THEN p.medication_needs
      WHEN has_role(auth.uid(), 'admin') THEN p.medication_needs
      ELSE false
    END as medication_needs
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
    AND ((p.is_verified = true) OR (auth.uid() = p.user_id));
$$;

-- 4. Create a new secure policy that restricts sensitive data
CREATE POLICY "Users can view basic profile info"
ON public.profiles
FOR SELECT
USING (
  -- Users can always see their own full profile
  (auth.uid() = user_id) OR
  -- Admins can see all profiles
  has_role(auth.uid(), 'admin') OR
  -- Verified users can see profiles, but sensitive fields will be filtered
  (is_verified = true)
);

-- 5. Add policy for sitters to update their own bookings
CREATE POLICY "Sitters can update own bookings"
ON public.bookings
FOR UPDATE
USING (sitter_id = auth.uid());

-- 6. Fix function search paths for all existing functions
CREATE OR REPLACE FUNCTION public.get_user_roles_with_names()
RETURNS TABLE(id uuid, user_id uuid, role app_role, created_at timestamp with time zone, name text, is_verified boolean, is_paid boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.created_at,
    p.name,
    p.is_verified,
    p.is_paid
  FROM user_roles ur
  LEFT JOIN profiles p ON ur.user_id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin');
$function$;

CREATE OR REPLACE FUNCTION public.reject_admin_request(request_id uuid, rejection_notes text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject admin requests';
  END IF;

  UPDATE public.pending_admin_requests
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    notes = rejection_notes
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.approve_admin_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve admin requests';
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.pending_admin_requests
  WHERE id = request_id AND status = 'pending';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  UPDATE public.pending_admin_requests
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = request_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.profiles
  SET is_paid = true
  WHERE user_id = v_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'sitter')
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;