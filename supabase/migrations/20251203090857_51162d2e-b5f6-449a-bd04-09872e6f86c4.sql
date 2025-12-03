-- Drop the existing policy that requires is_paid for sitters
DROP POLICY IF EXISTS "Sitters can create bookings" ON public.bookings;

-- Create new policy that only requires verification for sitters (no payment needed)
CREATE POLICY "Sitters can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  (sitter_id = auth.uid()) 
  AND has_role(auth.uid(), 'sitter'::app_role) 
  AND (EXISTS ( 
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_verified = true
  ))
);