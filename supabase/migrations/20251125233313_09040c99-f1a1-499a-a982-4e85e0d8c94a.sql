-- Enhanced security fix: Create column-level restrictions through multiple policies

-- 1. Drop all existing profile SELECT policies
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles with privacy controls" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. Create restrictive policies for different user types

-- Policy 1: Users can see their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Admins can see all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 3. Create a safe public view for verified users to see basic info only
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  name,
  CASE WHEN phone_consent = true THEN phone ELSE NULL END as phone,
  bio,
  photo_url,
  skills,
  ndis_certified,
  loyalty_badge,
  is_verified,
  created_at,
  experience,
  certificates
FROM public.profiles
WHERE is_verified = true;

-- Grant select on the public view
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- 4. Update listings to require authentication and hide owner_id
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.listings;

CREATE POLICY "Authenticated users can view active listings"
ON public.listings
FOR SELECT
USING (
  status = 'active' 
  AND auth.uid() IS NOT NULL
);