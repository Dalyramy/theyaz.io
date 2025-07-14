-- Safely create categories and albums tables in the correct order

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    cover_photo_id uuid REFERENCES public.photos(id) ON DELETE SET NULL
);

-- 2. Create albums table (references categories)
CREATE TABLE IF NOT EXISTS public.albums (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    cover_photo_id uuid REFERENCES public.photos(id) ON DELETE SET NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Add album_id to photos
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL;

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS albums_user_id_idx ON public.albums(user_id);
CREATE INDEX IF NOT EXISTS albums_category_id_idx ON public.albums(category_id);
CREATE INDEX IF NOT EXISTS photos_album_id_idx ON public.photos(album_id); 