-- USERS TABLE (for custom user data, not Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text UNIQUE NOT NULL,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- PROFILES TABLE (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    bio text,
    is_admin boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    cover_photo_id uuid
    -- CONSTRAINT categories_cover_photo_id_fkey FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id)
);

-- ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.albums (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    user_id uuid,
    category_id uuid,
    cover_photo_id uuid,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now())
    -- CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    -- CONSTRAINT albums_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
    -- CONSTRAINT albums_cover_photo_id_fkey FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id)
);

-- PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    caption text,
    image_url text NOT NULL,
    image_path text NOT NULL,
    tags text[] DEFAULT '{}',
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    user_id uuid,
    album_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now()),
    thumbnail_url text,
    CONSTRAINT photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT photos_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id)
);

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id uuid,
    user_id uuid,
    content text NOT NULL,
    likes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now()),
    CONSTRAINT comments_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id),
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    CONSTRAINT likes_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id),
    CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- COMMENT LIKES TABLE
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id),
    CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Add foreign keys after all tables are created
ALTER TABLE public.categories ADD CONSTRAINT categories_cover_photo_id_fkey FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id);
ALTER TABLE public.albums ADD CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE public.albums ADD CONSTRAINT albums_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
ALTER TABLE public.albums ADD CONSTRAINT albums_cover_photo_id_fkey FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id);