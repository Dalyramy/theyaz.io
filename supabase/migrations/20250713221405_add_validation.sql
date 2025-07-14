-- Migration: Add Validation Constraints
-- This migration adds CHECK constraints to ensure data integrity

-- Add validation constraints to photos table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_image_url_not_empty' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        ADD CONSTRAINT check_image_url_not_empty CHECK (image_url <> '');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_image_path_not_empty' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        ADD CONSTRAINT check_image_path_not_empty CHECK (image_path <> '');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_likes_count_non_negative' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        ADD CONSTRAINT check_likes_count_non_negative CHECK (likes_count >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_comments_count_non_negative' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        ADD CONSTRAINT check_comments_count_non_negative CHECK (comments_count >= 0);
    END IF;
END $$;

-- Add validation constraints to comments table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_likes_non_negative' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE public.comments
        ADD CONSTRAINT check_likes_non_negative CHECK (likes >= 0);
    END IF;
END $$;

-- Add validation constraints to albums table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_album_title_not_empty' 
        AND table_name = 'albums'
    ) THEN
        ALTER TABLE public.albums
        ADD CONSTRAINT check_album_title_not_empty CHECK (title <> '');
    END IF;
END $$;

-- Add validation constraints to categories table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_category_name_not_empty' 
        AND table_name = 'categories'
    ) THEN
        ALTER TABLE public.categories
        ADD CONSTRAINT check_category_name_not_empty CHECK (name <> '');
    END IF;
END $$;

-- Add validation for Instagram post ID format (optional)
-- This ensures Instagram post IDs follow the expected format
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_instagram_post_id_format' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        ADD CONSTRAINT check_instagram_post_id_format 
        CHECK (instagram_post_id IS NULL OR instagram_post_id ~ '^[A-Za-z0-9_-]+$');
    END IF;
END $$; 