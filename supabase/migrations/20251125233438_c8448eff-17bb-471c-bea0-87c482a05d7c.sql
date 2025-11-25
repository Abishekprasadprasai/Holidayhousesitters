-- Fix overly restrictive policies to allow proper app functionality

-- 1. Update listings policy to allow authenticated users to browse
DROP POLICY IF EXISTS "Authenticated users can view active listings" ON public.listings;

CREATE POLICY "Authenticated users can view active listings"
ON public.listings
FOR SELECT
USING (
  status = 'active' 
  AND auth.role() = 'authenticated'
);

-- 2. Add policy for users to view profiles when there's a booking relationship
CREATE POLICY "Users can view profiles through bookings"
ON public.profiles
FOR SELECT
USING (
  is_verified = true 
  AND (
    -- User can see profiles of homeowners they have bookings with
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN listings l ON l.id = b.listing_id
      WHERE b.sitter_id = auth.uid() AND l.owner_id = profiles.user_id
    )
    OR
    -- Homeowner can see profiles of sitters who have bookings on their listings
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN listings l ON l.id = b.listing_id
      WHERE l.owner_id = auth.uid() AND b.sitter_id = profiles.user_id
    )
  )
);

-- 3. Create a safe profile view function for browsing sitters
CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  bio text,
  photo_url text,
  skills text[],
  experience text,
  certificates text[],
  ndis_certified boolean,
  loyalty_badge loyalty_badge,
  is_verified boolean,
  average_rating numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.bio,
    p.photo_url,
    p.skills,
    p.experience,
    p.certificates,
    p.ndis_certified,
    p.loyalty_badge,
    p.is_verified,
    p.average_rating
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
    AND p.is_verified = true;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_safe_profile(uuid) TO authenticated;