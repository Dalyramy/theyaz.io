-- This migration is being removed to fix account creation issues
-- The webhook was conflicting with the existing database trigger
-- Account creation is now handled by the database trigger in 20240324010000_add_profiles.sql

-- Remove the webhook function and trigger
DROP TRIGGER IF EXISTS auth_new_user_webhook ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_webhook(); 