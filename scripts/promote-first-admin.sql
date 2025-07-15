-- Script to promote the first user to admin
-- This is useful for initial setup when you need to create the first admin

-- Method 1: Promote the first user by creation date
UPDATE public.profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Method 2: Promote by specific email (uncomment and replace with your email)
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE id IN (
--   SELECT id FROM auth.users 
--   WHERE email = 'your-email@example.com'
-- );

-- Verify the change
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.is_admin,
  u.email,
  u.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true
ORDER BY u.created_at ASC; 