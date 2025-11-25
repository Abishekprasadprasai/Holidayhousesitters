-- Fix security definer view issue

-- Drop and recreate the view with SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS
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