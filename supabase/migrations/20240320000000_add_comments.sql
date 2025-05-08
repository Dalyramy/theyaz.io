-- Create photos table if not exists
CREATE TABLE IF NOT EXISTS public.photos (
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

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create comments table if not exists
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id uuid REFERENCES public.photos(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    likes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create likes table if not exists
CREATE TABLE IF NOT EXISTS public.likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id uuid REFERENCES public.photos(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(photo_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photos
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

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- RLS Policies for comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments"
    ON public.comments FOR SELECT
    USING (true);

-- RLS Policies for likes
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
CREATE POLICY "Anyone can view likes"
    ON public.likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create likes" ON public.likes;
CREATE POLICY "Authenticated users can create likes"
    ON public.likes FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
CREATE POLICY "Users can delete own likes"
    ON public.likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_photos_updated_at ON public.photos;
CREATE TRIGGER handle_photos_updated_at
    BEFORE UPDATE ON public.photos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_comments_updated_at ON public.comments;
CREATE TRIGGER handle_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update likes count
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.photos
        SET likes_count = likes_count + 1
        WHERE id = NEW.photo_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.photos
        SET likes_count = likes_count - 1
        WHERE id = OLD.photo_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for likes count
DROP TRIGGER IF EXISTS handle_likes_count_insert ON public.likes;
CREATE TRIGGER handle_likes_count_insert
    AFTER INSERT ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_likes_count();

DROP TRIGGER IF EXISTS handle_likes_count_delete ON public.likes;
CREATE TRIGGER handle_likes_count_delete
    AFTER DELETE ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_likes_count();

-- Create function to update comments count
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.photos
        SET comments_count = comments_count + 1
        WHERE id = NEW.photo_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.photos
        SET comments_count = comments_count - 1
        WHERE id = OLD.photo_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for comments count
DROP TRIGGER IF EXISTS handle_comments_count_insert ON public.comments;
CREATE TRIGGER handle_comments_count_insert
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comments_count();

DROP TRIGGER IF EXISTS handle_comments_count_delete ON public.comments;
CREATE TRIGGER handle_comments_count_delete
    AFTER DELETE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comments_count();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS photos_user_id_idx ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS photos_profile_id_idx ON public.photos(profile_id);
CREATE INDEX IF NOT EXISTS photos_created_at_idx ON public.photos(created_at);
CREATE INDEX IF NOT EXISTS photos_tags_idx ON public.photos USING GIN(tags);
CREATE INDEX IF NOT EXISTS comments_photo_id_idx ON public.comments(photo_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at);
CREATE INDEX IF NOT EXISTS likes_photo_id_idx ON public.likes(photo_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);

-- Create function to set profile_id on photo creation
CREATE OR REPLACE FUNCTION public.set_photo_profile_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_id := NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for setting profile_id
DROP TRIGGER IF EXISTS handle_photo_profile_id ON public.photos;
CREATE TRIGGER handle_photo_profile_id
    BEFORE INSERT ON public.photos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_photo_profile_id(); 