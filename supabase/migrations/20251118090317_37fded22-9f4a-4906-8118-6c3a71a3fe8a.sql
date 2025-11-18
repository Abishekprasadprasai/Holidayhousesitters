-- Create a view that joins user_roles with profiles to show names
CREATE OR REPLACE VIEW user_roles_with_names AS
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  p.name,
  p.is_verified,
  p.is_paid
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id;

-- Grant select permission on the view
GRANT SELECT ON user_roles_with_names TO authenticated;
GRANT SELECT ON user_roles_with_names TO anon;