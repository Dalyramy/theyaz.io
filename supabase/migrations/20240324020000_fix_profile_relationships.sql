-- First, save existing profile data
CREATE TEMP TABLE temp_profiles AS
SELECT 
    p1.id,
    COALESCE(p1.username, p2.username) as username,
    COALESCE(p1.avatar_url, p2.avatar_url) as avatar_url,
    p2.full_name,
    p2.bio,
    COALESCE(p1.updated_at, p2.updated_at) as updated_at
FROM profiles p1
FULL OUTER JOIN public.profiles p2 ON p1.id = p2.id;

-- Drop the old profiles table from the first migration
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate the profiles table with merged fields
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Restore the saved profile data
INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, updated_at)
SELECT id, username, full_name, avatar_url, bio, updated_at
FROM temp_profiles;

DROP TABLE temp_profiles;

-- Drop and recreate the photos table to ensure proper relationships
CREATE TABLE IF NOT EXISTS public.photos_temp AS SELECT * FROM public.photos;

DROP TABLE IF EXISTS public.photos CASCADE;

CREATE TABLE public.photos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    caption text,
    image_url text NOT NULL,
    image_path text NOT NULL,
    tags text[] DEFAULT '{}',
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert missing profiles for users in photos_temp
INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, updated_at)
SELECT DISTINCT pt.user_id, pt.user_id::text, NULL, NULL, NULL, NOW()
FROM public.photos_temp pt
LEFT JOIN public.profiles p ON pt.user_id = p.id
WHERE p.id IS NULL;

-- Restore photos data
INSERT INTO public.photos (
    id,
    title,
    caption,
    image_url,
    image_path,
    tags,
    likes_count,
    comments_count,
    user_id,
    profile_id,
    created_at,
    updated_at
)
SELECT 
    id,
    title,
    caption,
    image_url,
    image_path,
    tags,
    likes_count,
    comments_count,
    user_id,
    user_id as profile_id,
    created_at,
    updated_at
FROM public.photos_temp;

DROP TABLE public.photos_temp;

-- Enable RLS on photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Recreate photos policies
DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;
CREATE POLICY "Anyone can view photos"
    ON public.photos FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create photos" ON public.photos;
CREATE POLICY "Users can create photos"
    ON public.photos FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own photos" ON public.photos;
CREATE POLICY "Users can update own photos"
    ON public.photos FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own photos" ON public.photos;
CREATE POLICY "Users can delete own photos"
    ON public.photos FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Recreate the profile policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Update the handle_new_user function to include all fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        username, 
        full_name,
        avatar_url,
        bio
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id),
        NEW.raw_user_meta_data->>'bio'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles(updated_at); 