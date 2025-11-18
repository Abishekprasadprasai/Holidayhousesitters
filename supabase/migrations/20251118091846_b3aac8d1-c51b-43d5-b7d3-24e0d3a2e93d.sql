-- Drop the existing view
DROP VIEW IF EXISTS user_roles_with_names;

-- Create a security definer function that only admins can use
CREATE OR REPLACE FUNCTION public.get_user_roles_with_names()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role app_role,
  created_at timestamp with time zone,
  name text,
  is_verified boolean,
  is_paid boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;