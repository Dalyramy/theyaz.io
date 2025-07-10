-- CLEAN BACKEND MIGRATION: Unified user/profile creation and RBAC
-- This migration removes all old/duplicate triggers and functions, and leaves only the correct logic for new user onboarding.

-- 1. Drop all old/duplicate triggers and functions for user/profile creation
DROP TRIGGER IF EXISTS auth_new_user_webhook ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_webhook();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Clean up the profiles table schema (id, username, full_name, avatar_url, bio, is_admin, updated_at, created_at)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 3. Ensure only the latest handle_new_user function and trigger is present
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id, username, full_name, avatar_url, bio, is_admin, updated_at, created_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id),
        NEW.raw_user_meta_data->>'bio',
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Assign default 'viewer' role if not already assigned
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, r.id
    FROM public.roles r
    WHERE r.name = 'viewer'
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = NEW.id AND ur.role_id = r.id
      );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 4. Clean up RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles(updated_at);

-- 6. Comments: This migration is idempotent and safe to run multiple times. It will not delete user data.
-- You now have a single, clean backend for user onboarding and RBAC. 