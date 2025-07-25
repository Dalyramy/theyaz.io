-- Script to promote a user to admin
-- Replace 'user_email@example.com' with the actual email of the user you want to promote

-- Method 1: Promote by email (recommended)
UPDATE public.profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'user_email@example.com'
);

-- Method 2: Promote by user ID (if you know the user's UUID)
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE id = 'user-uuid-here';

-- Method 3: Promote the first user (useful for initial setup)
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1);

-- Verify the change
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.is_admin,
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true; 