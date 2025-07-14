-- Migration: Add Albums and Categories Tables for Photo Organization
-- Date: 2025-07-14
-- Description: This migration creates albums and categories tables for better photo organization
-- Author: System

-- ============================================================================
-- STEP 1: CREATE CATEGORIES TABLE
-- ============================================================================

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  cover_photo_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_cover_photo_id_fkey_20250714 FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id) ON DELETE SET NULL
);

-- Add comment for categories table
COMMENT ON TABLE public.categories IS 'Photo categories for organizing albums and photos by theme or style';

-- ============================================================================
-- STEP 2: CREATE ALBUMS TABLE
-- ============================================================================

-- Create albums table if it doesn't exist
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
  CONSTRAINT albums_cover_photo_id_fkey_20250714 FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id) ON DELETE SET NULL,
  CONSTRAINT albums_user_id_fkey_20250714 FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT albums_category_id_fkey_20250714 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

-- Add comment for albums table
COMMENT ON TABLE public.albums IS 'Photo albums for organizing photos by theme, event, or collection';

-- ============================================================================
-- STEP 3: ADD ALBUM_ID COLUMN TO PHOTOS TABLE
-- ============================================================================

-- Add album_id column to photos table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' AND column_name = 'album_id'
    ) THEN
        ALTER TABLE public.photos
        ADD COLUMN album_id uuid,
        ADD CONSTRAINT photos_album_id_fkey_20250714 FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added album_id column to photos table';
    ELSE
        RAISE NOTICE 'album_id column already exists in photos table';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: ADD TIMESTAMP TRIGGERS
-- ============================================================================

-- Add trigger for albums table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_albums_updated_at_20250714' 
        AND event_object_table = 'albums'
    ) THEN
        CREATE TRIGGER update_albums_updated_at_20250714 
        BEFORE UPDATE ON public.albums 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_20250714();
        RAISE NOTICE 'Created timestamp trigger for albums table';
    ELSE
        RAISE NOTICE 'Timestamp trigger for albums table already exists';
    END IF;
END $$;

-- Add trigger for categories table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_categories_updated_at_20250714' 
        AND event_object_table = 'categories'
    ) THEN
        CREATE TRIGGER update_categories_updated_at_20250714 
        BEFORE UPDATE ON public.categories 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_20250714();
        RAISE NOTICE 'Created timestamp trigger for categories table';
    ELSE
        RAISE NOTICE 'Timestamp trigger for categories table already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: ADD PERFORMANCE INDEXES
-- ============================================================================

-- Add indexes for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_albums_user_id_20250714' 
        AND tablename = 'albums'
    ) THEN
        CREATE INDEX idx_albums_user_id_20250714 ON public.albums(user_id);
        RAISE NOTICE 'Created index idx_albums_user_id_20250714 on albums(user_id)';
    ELSE
        RAISE NOTICE 'Index idx_albums_user_id_20250714 already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_albums_category_id_20250714' 
        AND tablename = 'albums'
    ) THEN
        CREATE INDEX idx_albums_category_id_20250714 ON public.albums(category_id);
        RAISE NOTICE 'Created index idx_albums_category_id_20250714 on albums(category_id)';
    ELSE
        RAISE NOTICE 'Index idx_albums_category_id_20250714 already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_albums_featured_20250714' 
        AND tablename = 'albums'
    ) THEN
        CREATE INDEX idx_albums_featured_20250714 ON public.albums(is_featured, created_at DESC);
        RAISE NOTICE 'Created index idx_albums_featured_20250714 on albums(is_featured, created_at DESC)';
    ELSE
        RAISE NOTICE 'Index idx_albums_featured_20250714 already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_album_id_20250714' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_album_id_20250714 ON public.photos(album_id);
        RAISE NOTICE 'Created index idx_photos_album_id_20250714 on photos(album_id)';
    ELSE
        RAISE NOTICE 'Index idx_photos_album_id_20250714 already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_categories_name_20250714' 
        AND tablename = 'categories'
    ) THEN
        CREATE INDEX idx_categories_name_20250714 ON public.categories(name);
        RAISE NOTICE 'Created index idx_categories_name_20250714 on categories(name)';
    ELSE
        RAISE NOTICE 'Index idx_categories_name_20250714 already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 6: INSERT DEFAULT CATEGORIES
-- ============================================================================

-- Insert default categories if they don't exist
INSERT INTO public.categories (name, description) VALUES 
  ('Nature', 'Beautiful landscapes, wildlife, and natural scenery photography'),
  ('Portrait', 'People and portrait photography, including studio and candid shots'),
  ('Street', 'Urban and street photography capturing city life and culture'),
  ('Architecture', 'Buildings, structures, and architectural photography'),
  ('Travel', 'Travel and adventure photography from around the world'),
  ('Food', 'Culinary and food photography, including dishes and ingredients'),
  ('Abstract', 'Abstract and artistic photography with creative compositions'),
  ('Black & White', 'Monochrome photography with dramatic contrasts'),
  ('Macro', 'Close-up and macro photography of small subjects'),
  ('Night', 'Night and low-light photography including cityscapes and astrophotography'),
  ('Sports', 'Sports and action photography capturing movement and energy'),
  ('Wedding', 'Wedding and event photography for special occasions'),
  ('Fashion', 'Fashion and style photography including clothing and accessories'),
  ('Documentary', 'Documentary and photojournalism capturing real moments'),
  ('Fine Art', 'Fine art photography with artistic and creative expression')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 7: ADD COLUMN COMMENTS AND DOCUMENTATION
-- ============================================================================

-- Add comments for categories table columns
COMMENT ON COLUMN public.categories.id IS 'Unique identifier for the category';
COMMENT ON COLUMN public.categories.name IS 'Unique category name for organizing photos';
COMMENT ON COLUMN public.categories.description IS 'Detailed description of the category';
COMMENT ON COLUMN public.categories.cover_photo_id IS 'Featured photo for the category display';
COMMENT ON COLUMN public.categories.created_at IS 'Timestamp when the category was created';
COMMENT ON COLUMN public.categories.updated_at IS 'Timestamp when the category was last updated';

-- Add comments for albums table columns
COMMENT ON COLUMN public.albums.id IS 'Unique identifier for the album';
COMMENT ON COLUMN public.albums.title IS 'Album title for display and organization';
COMMENT ON COLUMN public.albums.description IS 'Detailed description of the album content';
COMMENT ON COLUMN public.albums.cover_photo_id IS 'Featured photo for the album cover display';
COMMENT ON COLUMN public.albums.user_id IS 'User who created and owns the album';
COMMENT ON COLUMN public.albums.category_id IS 'Category this album belongs to for organization';
COMMENT ON COLUMN public.albums.is_featured IS 'Whether this album is featured in the gallery';
COMMENT ON COLUMN public.albums.created_at IS 'Timestamp when the album was created';
COMMENT ON COLUMN public.albums.updated_at IS 'Timestamp when the album was last updated';

-- Add comments for photos table album_id column
COMMENT ON COLUMN public.photos.album_id IS 'Album this photo belongs to for organization';

-- ============================================================================
-- STEP 8: ADD CONSTRAINT COMMENTS
-- ============================================================================

-- Add comments for foreign key constraints
COMMENT ON CONSTRAINT categories_cover_photo_id_fkey_20250714 ON public.categories IS 'Foreign key to photos table for category cover photo. Set to NULL if photo is deleted.';
COMMENT ON CONSTRAINT albums_cover_photo_id_fkey_20250714 ON public.albums IS 'Foreign key to photos table for album cover photo. Set to NULL if photo is deleted.';
COMMENT ON CONSTRAINT albums_user_id_fkey_20250714 ON public.albums IS 'Foreign key to profiles table for album owner. Cascade delete when user is deleted.';
COMMENT ON CONSTRAINT albums_category_id_fkey_20250714 ON public.albums IS 'Foreign key to categories table for album category. Set to NULL if category is deleted.';
COMMENT ON CONSTRAINT photos_album_id_fkey_20250714 ON public.photos IS 'Foreign key to albums table for photo organization. Set to NULL if album is deleted.';

-- ============================================================================
-- STEP 9: VERIFY CREATION AND SUMMARY
-- ============================================================================

-- Verify tables were created successfully
DO $$
DECLARE
    categories_exist boolean;
    albums_exist boolean;
    photos_album_id_exist boolean;
    categories_count integer;
    timestamp_triggers integer;
    indexes_count integer;
BEGIN
    -- Check if tables exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'categories'
    ) INTO categories_exist;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'albums'
    ) INTO albums_exist;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' AND column_name = 'album_id'
    ) INTO photos_album_id_exist;
    
    -- Count categories
    SELECT COUNT(*) INTO categories_count FROM public.categories;
    
    -- Count timestamp triggers
    SELECT COUNT(*) INTO timestamp_triggers
    FROM information_schema.triggers 
    WHERE trigger_name LIKE '%updated_at_20250714' 
    AND event_object_table IN ('albums', 'categories');
    
    -- Count indexes
    SELECT COUNT(*) INTO indexes_count
    FROM pg_indexes 
    WHERE indexname LIKE '%20250714' 
    AND tablename IN ('albums', 'categories', 'photos');
    
    RAISE NOTICE 'Migration 20250714221404_add_albums_categories.sql completed successfully';
    RAISE NOTICE 'Summary Report:';
    RAISE NOTICE '  - Categories table: %', CASE WHEN categories_exist THEN '✅ Created' ELSE '❌ Failed' END;
    RAISE NOTICE '  - Albums table: %', CASE WHEN albums_exist THEN '✅ Created' ELSE '❌ Failed' END;
    RAISE NOTICE '  - Photos album_id column: %', CASE WHEN photos_album_id_exist THEN '✅ Added' ELSE '❌ Failed' END;
    RAISE NOTICE '  - Default categories: %', categories_count;
    RAISE NOTICE '  - Timestamp triggers: %', timestamp_triggers;
    RAISE NOTICE '  - Performance indexes: %', indexes_count;
END $$; 