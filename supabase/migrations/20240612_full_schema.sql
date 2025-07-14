-- Full schema migration with separate user systems (app: auth.users, blog: public.users)

-- 1. Blog users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 2. Blog posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  content text NOT NULL,
  author_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);

-- 3. Blog comments table
CREATE TABLE IF NOT EXISTS public.comments_blog (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comments_blog_pkey PRIMARY KEY (id),
  CONSTRAINT comments_blog_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT comments_blog_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 4. App profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  username text UNIQUE CHECK (char_length(username) >= 3),
  full_name text,
  avatar_url text,
  bio text,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_admin boolean DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 5. App categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  cover_photo_id uuid,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 6. App photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  caption text,
  image_url text NOT NULL,
  image_path text NOT NULL,
  tags text[] DEFAULT '{}'::text[],
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  user_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  album_id uuid,
  thumbnail_url text,
  CONSTRAINT photos_pkey PRIMARY KEY (id)
);

-- 7. App albums table (references photos, categories, auth.users)
CREATE TABLE IF NOT EXISTS public.albums (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_photo_id uuid,
  user_id uuid,
  category_id uuid,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT albums_pkey PRIMARY KEY (id),
  CONSTRAINT albums_cover_photo_id_fkey FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id),
  CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT albums_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

-- 8. App comments table (references photos, profiles)
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  photo_id uuid,
  user_id uuid,
  content text NOT NULL,
  likes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id),
  CONSTRAINT comments_user_id_profiles_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- 9. App comment_likes table (references comments, auth.users)
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comment_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comment_likes_pkey PRIMARY KEY (id),
  CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id),
  CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 10. App likes table (references photos, auth.users)
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  photo_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 11. App messages table (references auth.users)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid,
  recipient_id uuid,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id),
  CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id)
);

-- 12. App notifications table (references auth.users)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipient_id uuid,
  sender_id uuid,
  type text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id),
  CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id)
);

-- 13. Add FKs to photos (album_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'photos_album_id_fkey' AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos ADD CONSTRAINT photos_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id);
    END IF;
END $$;
-- 14. Ensure cover_photo_id column exists in categories before adding FK
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS cover_photo_id uuid;

-- 14. Add FKs to categories (cover_photo_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'categories_cover_photo_id_fkey' AND table_name = 'categories'
    ) THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_cover_photo_id_fkey FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id);
    END IF;
END $$; 