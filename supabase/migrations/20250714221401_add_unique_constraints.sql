-- Migration: Add Unique Constraints to Prevent Duplicate Likes and Comment Likes
-- Date: 2025-07-14
-- Description: This migration adds unique constraints to prevent duplicate likes and comment likes, with cleanup of existing duplicates
-- Author: System

-- ============================================================================
-- STEP 1: CLEAN UP EXISTING DUPLICATE LIKES
-- ============================================================================

-- Clean up duplicate likes, keeping only the most recent like for each photo-user combination
DO $$
DECLARE
    duplicate_count integer;
BEGIN
    -- Count duplicates before cleanup
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT photo_id, user_id, COUNT(*) as cnt
        FROM public.likes
        WHERE photo_id IS NOT NULL AND user_id IS NOT NULL
        GROUP BY photo_id, user_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate likes to clean up', duplicate_count;
        
        -- Delete duplicates, keeping only the most recent like
        DELETE FROM public.likes WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY photo_id, user_id ORDER BY created_at DESC) as rn
                FROM public.likes
                WHERE photo_id IS NOT NULL AND user_id IS NOT NULL
            ) t WHERE rn > 1
        );
        
        RAISE NOTICE 'Cleaned up % duplicate likes', duplicate_count;
    ELSE
        RAISE NOTICE 'No duplicate likes found';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: CLEAN UP EXISTING DUPLICATE COMMENT LIKES
-- ============================================================================

-- Clean up duplicate comment likes, keeping only the most recent like for each comment-user combination
DO $$
DECLARE
    duplicate_count integer;
BEGIN
    -- Count duplicates before cleanup
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT comment_id, user_id, COUNT(*) as cnt
        FROM public.comment_likes
        WHERE comment_id IS NOT NULL AND user_id IS NOT NULL
        GROUP BY comment_id, user_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate comment likes to clean up', duplicate_count;
        
        -- Delete duplicates, keeping only the most recent like
        DELETE FROM public.comment_likes WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY comment_id, user_id ORDER BY created_at DESC) as rn
                FROM public.comment_likes
                WHERE comment_id IS NOT NULL AND user_id IS NOT NULL
            ) t WHERE rn > 1
        );
        
        RAISE NOTICE 'Cleaned up % duplicate comment likes', duplicate_count;
    ELSE
        RAISE NOTICE 'No duplicate comment likes found';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: ADD UNIQUE CONSTRAINT TO LIKES TABLE
-- ============================================================================

-- Add unique constraint to likes table to prevent duplicate photo likes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_photo_like_20250714' 
        AND table_name = 'likes'
    ) THEN
        ALTER TABLE public.likes
        ADD CONSTRAINT unique_photo_like_20250714 UNIQUE (photo_id, user_id);
        RAISE NOTICE 'Added unique constraint unique_photo_like_20250714 to likes table';
    ELSE
        RAISE NOTICE 'Unique constraint unique_photo_like_20250714 already exists on likes table';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: ADD UNIQUE CONSTRAINT TO COMMENT_LIKES TABLE
-- ============================================================================

-- Add unique constraint to comment_likes table to prevent duplicate comment likes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_comment_like_20250714' 
        AND table_name = 'comment_likes'
    ) THEN
        ALTER TABLE public.comment_likes
        ADD CONSTRAINT unique_comment_like_20250714 UNIQUE (comment_id, user_id);
        RAISE NOTICE 'Added unique constraint unique_comment_like_20250714 to comment_likes table';
    ELSE
        RAISE NOTICE 'Unique constraint unique_comment_like_20250714 already exists on comment_likes table';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: VERIFY CLEANUP AND CONSTRAINTS
-- ============================================================================

-- Verify no duplicates remain in likes table
DO $$
DECLARE
    remaining_duplicates integer;
BEGIN
    SELECT COUNT(*) INTO remaining_duplicates
    FROM (
        SELECT photo_id, user_id, COUNT(*) as cnt
        FROM public.likes
        WHERE photo_id IS NOT NULL AND user_id IS NOT NULL
        GROUP BY photo_id, user_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF remaining_duplicates = 0 THEN
        RAISE NOTICE '✅ Likes table cleanup verified - no duplicates remain';
    ELSE
        RAISE WARNING '❌ Likes table still has % duplicate combinations', remaining_duplicates;
    END IF;
END $$;

-- Verify no duplicates remain in comment_likes table
DO $$
DECLARE
    remaining_duplicates integer;
BEGIN
    SELECT COUNT(*) INTO remaining_duplicates
    FROM (
        SELECT comment_id, user_id, COUNT(*) as cnt
        FROM public.comment_likes
        WHERE comment_id IS NOT NULL AND user_id IS NOT NULL
        GROUP BY comment_id, user_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF remaining_duplicates = 0 THEN
        RAISE NOTICE '✅ Comment likes table cleanup verified - no duplicates remain';
    ELSE
        RAISE WARNING '❌ Comment likes table still has % duplicate combinations', remaining_duplicates;
    END IF;
END $$;

-- ============================================================================
-- STEP 6: ADD DOCUMENTATION AND COMMENTS
-- ============================================================================

-- Add comments explaining the constraints
COMMENT ON CONSTRAINT unique_photo_like_20250714 ON public.likes IS 'Prevents users from liking the same photo multiple times. Ensures data integrity and prevents duplicate likes.';

COMMENT ON CONSTRAINT unique_comment_like_20250714 ON public.comment_likes IS 'Prevents users from liking the same comment multiple times. Ensures data integrity and prevents duplicate comment likes.';

-- ============================================================================
-- STEP 7: UPDATE RELATED COUNTS (if triggers are not working)
-- ============================================================================

-- Update photo likes counts to reflect cleaned data
UPDATE public.photos 
SET likes_count = (
    SELECT COUNT(*) 
    FROM public.likes 
    WHERE likes.photo_id = photos.id
)
WHERE id IN (
    SELECT DISTINCT photo_id 
    FROM public.likes 
    WHERE photo_id IS NOT NULL
);

-- Update comment likes counts to reflect cleaned data
UPDATE public.comments 
SET likes = (
    SELECT COUNT(*) 
    FROM public.comment_likes 
    WHERE comment_likes.comment_id = comments.id
)
WHERE id IN (
    SELECT DISTINCT comment_id 
    FROM public.comment_likes 
    WHERE comment_id IS NOT NULL
);

-- ============================================================================
-- STEP 8: FINAL VERIFICATION AND SUMMARY
-- ============================================================================

-- Generate summary report
DO $$
DECLARE
    likes_count integer;
    comment_likes_count integer;
    photos_with_likes integer;
    comments_with_likes integer;
    likes_constraint_exists boolean;
    comment_likes_constraint_exists boolean;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO likes_count FROM public.likes;
    SELECT COUNT(*) INTO comment_likes_count FROM public.comment_likes;
    SELECT COUNT(*) INTO photos_with_likes FROM public.photos WHERE public.photos.likes_count > 0;
    SELECT COUNT(*) INTO comments_with_likes FROM public.comments WHERE public.comments.likes > 0;
    
    -- Check if constraints exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_photo_like_20250714' 
        AND table_name = 'likes'
    ) INTO likes_constraint_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_comment_like_20250714' 
        AND table_name = 'comment_likes'
    ) INTO comment_likes_constraint_exists;
    
    RAISE NOTICE 'Migration 20250714221401_add_unique_constraints.sql completed successfully';
    RAISE NOTICE 'Summary Report:';
    RAISE NOTICE '  - Total likes: %', likes_count;
    RAISE NOTICE '  - Total comment likes: %', comment_likes_count;
    RAISE NOTICE '  - Photos with likes: %', photos_with_likes;
    RAISE NOTICE '  - Comments with likes: %', comments_with_likes;
    RAISE NOTICE '  - Likes constraint: %', CASE WHEN likes_constraint_exists THEN '✅ Added' ELSE '❌ Failed' END;
    RAISE NOTICE '  - Comment likes constraint: %', CASE WHEN comment_likes_constraint_exists THEN '✅ Added' ELSE '❌ Failed' END;
END $$; 