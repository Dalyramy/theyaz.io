-- Complete Fix for Admin Panel
-- Run this script in the Supabase SQL Editor to fix all admin panel issues

-- ============================================================================
-- STEP 1: ADD TEST USERS
-- ============================================================================

-- Test User 1: Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin1@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, is_admin, created_at) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin1',
  'Admin User One',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  is_admin = EXCLUDED.is_admin;

-- Test User 2: Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) 
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin2@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, is_admin, created_at) 
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin2',
  'Admin User Two',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  is_admin = EXCLUDED.is_admin;

-- Test User 3: Regular User
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) 
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'user1@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, is_admin, created_at) 
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'user1',
  'Regular User One',
  false,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  is_admin = EXCLUDED.is_admin;

-- Test User 4: Regular User
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) 
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'user2@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, full_name, is_admin, created_at) 
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'user2',
  'Regular User Two',
  false,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  is_admin = EXCLUDED.is_admin;

-- ============================================================================
-- STEP 2: FIX RLS POLICIES
-- ============================================================================

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Create comprehensive policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin policies for all operations
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================================================
-- STEP 3: VERIFY FIXES
-- ============================================================================

-- Check user count
SELECT 
  'Total Users' as metric,
  COUNT(*) as count
FROM public.profiles
UNION ALL
SELECT 
  'Admin Users' as metric,
  COUNT(*) as count
FROM public.profiles 
WHERE is_admin = true
UNION ALL
SELECT 
  'Regular Users' as metric,
  COUNT(*) as count
FROM public.profiles 
WHERE is_admin = false;

-- Check policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- Test admin access (this should return the admin users)
SELECT 
    id,
    username,
    full_name,
    is_admin,
    created_at
FROM public.profiles 
ORDER BY created_at DESC; 