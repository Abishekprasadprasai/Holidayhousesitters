-- Allow authenticated users to view verified and paid profiles for the map feature
CREATE POLICY "Authenticated users can view verified profiles for map"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_verified = true 
  AND is_paid = true
);
