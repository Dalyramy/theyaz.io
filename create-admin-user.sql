-- Method 1: Using the is_admin field (simpler approach)
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from Supabase Auth

UPDATE public.profiles 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID_HERE';

-- Method 2: Using the RBAC system (more comprehensive)
-- First, get the admin role ID
SELECT id FROM public.roles WHERE name = 'admin';

-- Then assign the admin role to your user
-- Replace 'YOUR_USER_ID_HERE' and 'ADMIN_ROLE_ID_HERE' with actual values

INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT 'YOUR_USER_ID_HERE', 'ADMIN_ROLE_ID_HERE', 'YOUR_USER_ID_HERE'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'YOUR_USER_ID_HERE' AND role_id = 'ADMIN_ROLE_ID_HERE'
);

-- Method 3: One-step admin creation (combines both approaches)
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID

-- Step 1: Set is_admin flag
UPDATE public.profiles 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID_HERE';

-- Step 2: Get admin role ID and assign it
DO $$
DECLARE
    admin_role_id uuid;
    user_id uuid := 'YOUR_USER_ID_HERE';
BEGIN
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role_id, assigned_by)
    VALUES (user_id, admin_role_id, user_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Admin user created successfully!';
END $$; 