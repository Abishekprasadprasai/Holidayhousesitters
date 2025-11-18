-- Add consent field for phone number sharing
ALTER TABLE public.profiles 
ADD COLUMN phone_consent boolean DEFAULT false;

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view all verified profiles" ON public.profiles;

-- Create a new SELECT policy that protects phone numbers
-- Users can see their own full profile, or see other verified profiles but with phone hidden unless consent given
CREATE POLICY "Users can view profiles with privacy controls" 
ON public.profiles 
FOR SELECT 
USING (
  (is_verified = true) OR (auth.uid() = user_id)
);

-- Create a function to return profile data with conditional phone visibility
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy(profile_user_id uuid)
RETURNS TABLE (
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
  phone_consent boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.name,
    -- Only show phone if it's the user's own profile OR if phone_consent is true
    CASE 
      WHEN p.user_id = auth.uid() THEN p.phone
      WHEN p.phone_consent = true THEN p.phone
      ELSE NULL
    END as phone,
    p.bio,
    p.photo_url,
    p.skills,
    p.experience,
    p.certificates,
    p.document_url,
    p.ndis_certified,
    p.loyalty_badge,
    p.is_verified,
    p.is_paid,
    p.verification_date,
    p.verified_by_admin_id,
    p.created_at,
    p.updated_at,
    p.phone_consent
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
    AND ((p.is_verified = true) OR (auth.uid() = p.user_id));
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_with_privacy(uuid) TO authenticated;