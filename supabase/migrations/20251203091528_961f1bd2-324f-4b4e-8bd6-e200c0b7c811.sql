-- Create a security definer function to check if user is verified (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_user_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_verified FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Drop the existing policy
DROP POLICY IF EXISTS "Sitters can create bookings" ON public.bookings;

-- Create new policy using the security definer function
CREATE POLICY "Sitters can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  sitter_id = auth.uid() 
  AND has_role(auth.uid(), 'sitter'::app_role) 
  AND is_user_verified(auth.uid())
);