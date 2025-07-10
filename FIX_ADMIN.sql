-- FIX: Create Admin User
-- Copy and paste this into Supabase Studio > SQL Editor

-- Step 1: Create a user (if you don't have one)
-- Go to Authentication > Users and create a user manually, then copy the ID

-- Step 2: Make them admin (replace 'YOUR_USER_ID' with actual user ID)
UPDATE public.profiles 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID';

-- Step 3: Assign admin role (optional but recommended)
INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT 'YOUR_USER_ID', r.id, 'YOUR_USER_ID'
FROM public.roles r 
WHERE r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 4: Verify it worked
SELECT 
    p.id,
    p.email,
    p.is_admin,
    r.name as role_name
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE p.is_admin = true; 