-- =====================================================
-- Check and Remove Duplicate Likes
-- =====================================================
-- This script identifies and removes duplicate likes from the likes table,
-- keeping the oldest like for each photo_id + user_id combination.
-- It also updates the likes_count in the photos table and adds a unique constraint.

-- Step 1: Check for duplicate likes
-- =====================================================
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Count total duplicates
    SELECT COUNT(*) - COUNT(DISTINCT photo_id, user_id)
    INTO duplicate_count
    FROM likes;
    
    RAISE NOTICE 'Found % duplicate likes to remove', duplicate_count;
    
    -- Show detailed breakdown of duplicates
    RAISE NOTICE 'Duplicate breakdown:';
    FOR dup IN 
        SELECT photo_id, user_id, COUNT(*) as count
        FROM likes
        GROUP BY photo_id, user_id
        HAVING COUNT(*) > 1
        ORDER BY count DESC
    LOOP
        RAISE NOTICE 'Photo %: User % has % likes', dup.photo_id, dup.user_id, dup.count;
    END LOOP;
END $$;

-- Step 2: Preview what will be deleted (SAFE - READ ONLY)
-- =====================================================
-- This shows the duplicates that will be removed
WITH duplicates AS (
    SELECT 
        photo_id,
        user_id,
        id,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY photo_id, user_id 
            ORDER BY created_at ASC
        ) as rn
    FROM likes
)
SELECT 
    'Will DELETE' as action,
    photo_id,
    user_id,
    id as like_id,
    created_at
FROM duplicates 
WHERE rn > 1
ORDER BY photo_id, user_id, created_at;

-- Step 3: Remove duplicate likes (keeping the oldest)
-- =====================================================
-- Delete duplicates while keeping the oldest like for each photo_id + user_id combination
WITH duplicates AS (
    SELECT 
        id,
        photo_id,
        user_id,
        ROW_NUMBER() OVER (
            PARTITION BY photo_id, user_id 
            ORDER BY created_at ASC
        ) as rn
    FROM likes
)
DELETE FROM likes 
WHERE id IN (
    SELECT id 
    FROM duplicates 
    WHERE rn > 1
);

-- Step 4: Verify cleanup
-- =====================================================
DO $$
DECLARE
    remaining_duplicates INTEGER;
    total_likes INTEGER;
BEGIN
    -- Check if any duplicates remain
    SELECT COUNT(*) - COUNT(DISTINCT photo_id, user_id)
    INTO remaining_duplicates
    FROM likes;
    
    -- Get total likes count
    SELECT COUNT(*) INTO total_likes FROM likes;
    
    RAISE NOTICE 'Cleanup verification:';
    RAISE NOTICE '- Remaining duplicates: %', remaining_duplicates;
    RAISE NOTICE '- Total likes after cleanup: %', total_likes;
    
    IF remaining_duplicates > 0 THEN
        RAISE EXCEPTION 'Cleanup failed - duplicates still exist';
    ELSE
        RAISE NOTICE 'Cleanup successful - no duplicates remain';
    END IF;
END $$;

-- Step 5: Update likes_count in photos table
-- =====================================================
-- Recalculate likes_count for all photos
UPDATE photos 
SET likes_count = (
    SELECT COUNT(*) 
    FROM likes 
    WHERE likes.photo_id = photos.id
);

-- Step 6: Add unique constraint (if it doesn't exist)
-- =====================================================
-- Check if unique constraint already exists
DO $$
BEGIN
    -- Try to add the unique constraint
    ALTER TABLE likes 
    ADD CONSTRAINT likes_photo_user_unique 
    UNIQUE (photo_id, user_id);
    
    RAISE NOTICE 'Unique constraint added successfully';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Unique constraint already exists';
    WHEN others THEN
        RAISE EXCEPTION 'Failed to add unique constraint: %', SQLERRM;
END $$;

-- Step 7: Final verification and summary
-- =====================================================
DO $$
DECLARE
    total_photos INTEGER;
    total_likes INTEGER;
    photos_with_likes INTEGER;
    avg_likes_per_photo DECIMAL;
BEGIN
    -- Get final statistics
    SELECT COUNT(*) INTO total_photos FROM photos;
    SELECT COUNT(*) INTO total_likes FROM likes;
    SELECT COUNT(DISTINCT photo_id) INTO photos_with_likes FROM likes;
    
    IF photos_with_likes > 0 THEN
        avg_likes_per_photo := total_likes::DECIMAL / photos_with_likes;
    ELSE
        avg_likes_per_photo := 0;
    END IF;
    
    RAISE NOTICE 'Final Summary:';
    RAISE NOTICE '- Total photos: %', total_photos;
    RAISE NOTICE '- Total likes: %', total_likes;
    RAISE NOTICE '- Photos with likes: %', photos_with_likes;
    RAISE NOTICE '- Average likes per photo: %', avg_likes_per_photo;
    
    -- Verify constraint exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'likes_photo_user_unique'
        AND table_name = 'likes'
    ) THEN
        RAISE NOTICE '- Unique constraint: EXISTS';
    ELSE
        RAISE NOTICE '- Unique constraint: MISSING';
    END IF;
END $$;

-- Step 8: Sample verification queries
-- =====================================================
-- These queries can be run to verify the cleanup

-- Check for any remaining duplicates
SELECT 'Remaining duplicates check' as check_type, COUNT(*) - COUNT(DISTINCT photo_id, user_id) as duplicates
FROM likes;

-- Show photos with most likes
SELECT 'Top liked photos' as check_type, p.id, p.title, p.likes_count, COUNT(l.id) as actual_likes
FROM photos p
LEFT JOIN likes l ON p.id = l.photo_id
GROUP BY p.id, p.title, p.likes_count
HAVING p.likes_count > 0
ORDER BY p.likes_count DESC
LIMIT 5;

-- Show users who like the most photos
SELECT 'Top likers' as check_type, u.email, COUNT(l.id) as likes_given
FROM likes l
JOIN auth.users u ON l.user_id = u.id
GROUP BY u.id, u.email
ORDER BY likes_given DESC
LIMIT 5;

-- =====================================================
-- Script completed successfully!
-- =====================================================
-- This script has:
-- 1. Identified and reported duplicate likes
-- 2. Removed duplicates while keeping the oldest like
-- 3. Verified the cleanup was successful
-- 4. Updated likes_count in the photos table
-- 5. Added a unique constraint to prevent future duplicates
-- 6. Provided verification queries for ongoing monitoring
-- ===================================================== 