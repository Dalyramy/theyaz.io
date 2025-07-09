-- Categories table (without circular reference)
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Albums table
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

-- Add album_id to photos
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL;

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create categories" ON public.categories;
CREATE POLICY "Authenticated users can create categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update categories" ON public.categories;
CREATE POLICY "Users can update categories"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS albums_user_id_idx ON public.albums(user_id);
CREATE INDEX IF NOT EXISTS albums_category_id_idx ON public.albums(category_id);
CREATE INDEX IF NOT EXISTS photos_album_id_idx ON public.photos(album_id);
CREATE INDEX IF NOT EXISTS categories_name_idx ON public.categories(name); 