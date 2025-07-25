-- Debug script to check user admin status
-- Run this in Supabase SQL Editor

-- Check if mimi user exists in auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'mimi@live.ca';

-- Check if mimi user exists in profiles
SELECT 
    id,
    username,
    full_name,
    is_admin,
    created_at
FROM public.profiles 
WHERE username = 'mimi' OR email = 'mimi@live.ca';

-- Check all admin users
SELECT 
    id,
    username,
    full_name,
    is_admin,
    created_at
FROM public.profiles 
WHERE is_admin = true
ORDER BY created_at DESC; 