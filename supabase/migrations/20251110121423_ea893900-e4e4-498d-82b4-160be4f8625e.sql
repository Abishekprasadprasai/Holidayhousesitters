-- Create enum for user roles
CREATE TYPE app_role AS ENUM ('admin', 'homeowner', 'sitter');

-- Create enum for loyalty badges
CREATE TYPE loyalty_badge AS ENUM ('bronze', 'silver', 'gold');

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role app_role NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  photo_url TEXT,
  skills TEXT[],
  experience TEXT,
  certificates TEXT[],
  ndis_certified BOOLEAN DEFAULT FALSE,
  loyalty_badge loyalty_badge,
  is_verified BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pets JSONB,
  tasks TEXT[],
  requirements TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sitter_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status booking_status DEFAULT 'pending',
  messages_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create verification logs table
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT CHECK (method IN ('phone', 'in-person')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all verified profiles"
  ON public.profiles FOR SELECT
  USING (is_verified = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Listings policies
CREATE POLICY "Anyone can view active listings"
  ON public.listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Homeowners can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'homeowner'
      AND is_verified = TRUE
      AND is_paid = TRUE
    )
  );

CREATE POLICY "Owners can update own listings"
  ON public.listings FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete own listings"
  ON public.listings FOR DELETE
  USING (owner_id = auth.uid());

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    sitter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = bookings.listing_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Sitters can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    sitter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'sitter'
      AND is_verified = TRUE
      AND is_paid = TRUE
    )
  );

CREATE POLICY "Owners can update bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = bookings.listing_id
      AND owner_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages in their bookings"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = messages.booking_id
      AND (
        sitter_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.listings
          WHERE id = bookings.listing_id
          AND owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can send messages in their bookings"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = messages.booking_id
      AND (
        sitter_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.listings
          WHERE id = bookings.listing_id
          AND owner_id = auth.uid()
        )
      )
    )
  );

-- Verification logs policies (admin only)
CREATE POLICY "Only admins can view verification logs"
  ON public.verification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can create verification logs"
  ON public.verification_logs FOR INSERT
  WITH CHECK (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'sitter')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();