-- Migration: Add Albums and Categories Tables
-- This migration creates albums and categories tables for better photo organization

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  cover_photo_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_cover_photo_id_fkey FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id) ON DELETE SET NULL
);

-- Create albums table
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
  CONSTRAINT albums_cover_photo_id_fkey FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id) ON DELETE SET NULL,
  CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT albums_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

-- Add album_id column to photos table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' AND column_name = 'album_id'
    ) THEN
        ALTER TABLE public.photos
        ADD COLUMN album_id uuid,
        ADD CONSTRAINT photos_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add triggers for updated_at timestamps
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_albums_updated_at' 
        AND event_object_table = 'albums'
    ) THEN
        CREATE TRIGGER update_albums_updated_at 
        BEFORE UPDATE ON public.albums 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_categories_updated_at' 
        AND event_object_table = 'categories'
    ) THEN
        CREATE TRIGGER update_categories_updated_at 
        BEFORE UPDATE ON public.categories 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- Add indexes for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_albums_user_id' 
        AND tablename = 'albums'
    ) THEN
        CREATE INDEX idx_albums_user_id ON public.albums(user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_albums_category_id' 
        AND tablename = 'albums'
    ) THEN
        CREATE INDEX idx_albums_category_id ON public.albums(category_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_album_id' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_album_id ON public.photos(album_id);
    END IF;
END $$;

-- Insert some default categories
INSERT INTO public.categories (name, description) VALUES 
  ('Nature', 'Beautiful landscapes and wildlife photography'),
  ('Portrait', 'People and portrait photography'),
  ('Street', 'Urban and street photography'),
  ('Architecture', 'Buildings and architectural photography'),
  ('Travel', 'Travel and adventure photography'),
  ('Food', 'Culinary and food photography'),
  ('Abstract', 'Abstract and artistic photography'),
  ('Black & White', 'Monochrome photography')
ON CONFLICT (name) DO NOTHING; 