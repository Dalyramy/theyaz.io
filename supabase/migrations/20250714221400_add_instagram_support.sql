-- Migration: Add Instagram Support to Photos Table
-- Date: 2025-07-14
-- Description: This migration adds Instagram post ID support to enable Instagram photo integration
-- Author: System

-- Add instagram_post_id column to photos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'photos' 
        AND column_name = 'instagram_post_id'
    ) THEN
        ALTER TABLE public.photos ADD COLUMN instagram_post_id text;
        RAISE NOTICE 'Added instagram_post_id column to photos table';
    ELSE
        RAISE NOTICE 'instagram_post_id column already exists in photos table';
    END IF;
END $$;

-- Add index for efficient Instagram post queries if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_instagram_post_id_20250714' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_instagram_post_id_20250714 ON public.photos(instagram_post_id);
        RAISE NOTICE 'Created index idx_photos_instagram_post_id_20250714 on photos(instagram_post_id)';
    ELSE
        RAISE NOTICE 'Index idx_photos_instagram_post_id_20250714 already exists';
    END IF;
END $$;

-- Add partial index for non-null Instagram post IDs for better performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_instagram_not_null_20250714' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_instagram_not_null_20250714 ON public.photos(instagram_post_id, created_at DESC) 
        WHERE instagram_post_id IS NOT NULL;
        RAISE NOTICE 'Created partial index idx_photos_instagram_not_null_20250714 for non-null Instagram post IDs';
    ELSE
        RAISE NOTICE 'Partial index idx_photos_instagram_not_null_20250714 already exists';
    END IF;
END $$;

-- Add comment explaining the new column
COMMENT ON COLUMN public.photos.instagram_post_id IS 'Stores Instagram post ID for photos sourced from Instagram. Used for embedding Instagram posts in the gallery and tracking imported content.';

-- Add comment explaining the indexes
COMMENT ON INDEX idx_photos_instagram_post_id_20250714 IS 'Index for efficient Instagram post ID lookups and filtering';
COMMENT ON INDEX idx_photos_instagram_not_null_20250714 IS 'Partial index for efficient queries on photos with Instagram post IDs, ordered by creation date';

-- Add validation constraint for Instagram post ID format (optional)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_instagram_post_id_format_20250714' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        ADD CONSTRAINT check_instagram_post_id_format_20250714 
        CHECK (instagram_post_id IS NULL OR instagram_post_id ~ '^[A-Za-z0-9_-]+$');
        RAISE NOTICE 'Added Instagram post ID format validation constraint';
    ELSE
        RAISE NOTICE 'Instagram post ID format validation constraint already exists';
    END IF;
END $$;

-- Add comment for the validation constraint
COMMENT ON CONSTRAINT check_instagram_post_id_format_20250714 ON public.photos IS 'Ensures Instagram post IDs follow the expected alphanumeric format with underscores and hyphens';

-- Create a function to validate Instagram post ID format
CREATE OR REPLACE FUNCTION validate_instagram_post_id(post_id text)
RETURNS boolean AS $$
BEGIN
    -- Return true if post_id is null (optional field)
    IF post_id IS NULL THEN
        RETURN true;
    END IF;
    
    -- Check if post_id matches Instagram format (alphanumeric, underscores, hyphens)
    IF post_id ~ '^[A-Za-z0-9_-]+$' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the validation function
COMMENT ON FUNCTION validate_instagram_post_id(text) IS 'Validates Instagram post ID format. Returns true for valid format or null values.';

-- Log the migration completion with detailed information
DO $$
DECLARE
    column_exists boolean;
    index_exists boolean;
    partial_index_exists boolean;
    constraint_exists boolean;
BEGIN
    -- Check what was actually created
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'photos' 
        AND column_name = 'instagram_post_id'
    ) INTO column_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_instagram_post_id_20250714' 
        AND tablename = 'photos'
    ) INTO index_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_instagram_not_null_20250714' 
        AND tablename = 'photos'
    ) INTO partial_index_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_instagram_post_id_format_20250714' 
        AND table_name = 'photos'
    ) INTO constraint_exists;
    
    RAISE NOTICE 'Migration 20250714221400_add_instagram_support.sql completed successfully';
    RAISE NOTICE 'Instagram support added to photos table:';
    RAISE NOTICE '  - Column: %', CASE WHEN column_exists THEN '✅ Added' ELSE '❌ Failed' END;
    RAISE NOTICE '  - Index: %', CASE WHEN index_exists THEN '✅ Created' ELSE '❌ Failed' END;
    RAISE NOTICE '  - Partial Index: %', CASE WHEN partial_index_exists THEN '✅ Created' ELSE '❌ Failed' END;
    RAISE NOTICE '  - Validation: %', CASE WHEN constraint_exists THEN '✅ Added' ELSE '❌ Failed' END;
END $$; 