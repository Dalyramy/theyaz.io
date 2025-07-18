-- Add test users for admin panel testing
-- This script adds some test users with admin privileges

-- First, let's add some test users to auth.users (this would normally be done through signup)
-- For testing purposes, we'll insert directly into auth.users and profiles tables

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

-- Verify the users were added
SELECT 
  id,
  username,
  full_name,
  is_admin,
  created_at
FROM public.profiles 
ORDER BY created_at DESC; 