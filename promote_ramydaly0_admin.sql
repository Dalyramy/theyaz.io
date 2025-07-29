-- Script to promote ramydaly0 to admin
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- First, let's check the current user
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.is_admin,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.username = 'ramydaly0';

-- Temporarily disable RLS to allow the update
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Update the user to admin
UPDATE public.profiles 
SET is_admin = true, updated_at = NOW()
WHERE username = 'ramydaly0';

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.is_admin,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.username = 'ramydaly0';

-- Check all admin users
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.is_admin,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.is_admin = true
ORDER BY p.created_at ASC; 