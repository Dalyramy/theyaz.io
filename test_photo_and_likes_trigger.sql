-- =====================================================
-- Test Photo and Likes Trigger Script
-- =====================================================
-- This script tests the complete photo and likes functionality including:
-- - Instagram post ID validation
-- - Likes count triggers
-- - Deletion triggers
-- - Data integrity
-- - Cleanup and reporting

-- Step 1: Create test data setup
-- =====================================================
DO $$
DECLARE
    test_user_id UUID;
    test_photo_id UUID;
    test_photo_id_2 UUID;
    test_photo_id_3 UUID;
    like_count_before INTEGER;
    like_count_after INTEGER;
    comment_count_before INTEGER;
    comment_count_after INTEGER;
BEGIN
    RAISE NOTICE 'Starting photo and likes trigger test...';
    
    -- Get a test user (first user in the system)
    SELECT id INTO test_user_id 
    FROM auth.users 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in the system. Please create a user first.';
    END IF;
    
    RAISE NOTICE 'Using test user: %', test_user_id;
    
    -- Step 2: Insert test photos with Instagram post IDs
    -- =====================================================
    RAISE NOTICE 'Inserting test photos...';
    
    -- Test photo 1: Valid Instagram post ID
    INSERT INTO photos (
        title,
        description,
        image_url,
        thumbnail_url,
        instagram_post_id,
        user_id,
        is_public,
        likes_count,
        comments_count,
        created_at,
        updated_at
    ) VALUES (
        'Test Photo with Instagram ID',
        'This is a test photo with a valid Instagram post ID',
        'https://example.com/test-image-1.jpg',
        'https://example.com/test-thumbnail-1.jpg',
        'C1234567890_ABC123',
        test_user_id,
        true,
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO test_photo_id;
    
    RAISE NOTICE 'Inserted test photo 1: %', test_photo_id;
    
    -- Test photo 2: Another valid Instagram post ID
    INSERT INTO photos (
        title,
        description,
        image_url,
        thumbnail_url,
        instagram_post_id,
        user_id,
        is_public,
        likes_count,
        comments_count,
        created_at,
        updated_at
    ) VALUES (
        'Test Photo 2 with Instagram ID',
        'Another test photo with different Instagram post ID',
        'https://example.com/test-image-2.jpg',
        'https://example.com/test-thumbnail-2.jpg',
        'C9876543210_XYZ789',
        test_user_id,
        true,
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO test_photo_id_2;
    
    RAISE NOTICE 'Inserted test photo 2: %', test_photo_id_2;
    
    -- Test photo 3: No Instagram post ID (for comparison)
    INSERT INTO photos (
        title,
        description,
        image_url,
        thumbnail_url,
        user_id,
        is_public,
        likes_count,
        comments_count,
        created_at,
        updated_at
    ) VALUES (
        'Test Photo 3 (No Instagram)',
        'Test photo without Instagram post ID',
        'https://example.com/test-image-3.jpg',
        'https://example.com/test-thumbnail-3.jpg',
        test_user_id,
        true,
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO test_photo_id_3;
    
    RAISE NOTICE 'Inserted test photo 3: %', test_photo_id_3;
    
    -- Step 3: Test likes count trigger
    -- =====================================================
    RAISE NOTICE 'Testing likes count trigger...';
    
    -- Get initial likes count
    SELECT likes_count INTO like_count_before 
    FROM photos 
    WHERE id = test_photo_id;
    
    RAISE NOTICE 'Initial likes count for photo %: %', test_photo_id, like_count_before;
    
    -- Add test likes
    INSERT INTO likes (photo_id, user_id, created_at) VALUES
        (test_photo_id, test_user_id, NOW()),
        (test_photo_id_2, test_user_id, NOW()),
        (test_photo_id_3, test_user_id, NOW());
    
    -- Check if trigger updated the count
    SELECT likes_count INTO like_count_after 
    FROM photos 
    WHERE id = test_photo_id;
    
    RAISE NOTICE 'Likes count after adding likes: %', like_count_after;
    
    IF like_count_after = like_count_before + 1 THEN
        RAISE NOTICE '✓ Likes count trigger working correctly';
    ELSE
        RAISE NOTICE '✗ Likes count trigger not working - expected %, got %', like_count_before + 1, like_count_after;
    END IF;
    
    -- Step 4: Test comments count trigger
    -- =====================================================
    RAISE NOTICE 'Testing comments count trigger...';
    
    -- Get initial comments count
    SELECT comments_count INTO comment_count_before 
    FROM photos 
    WHERE id = test_photo_id;
    
    RAISE NOTICE 'Initial comments count for photo %: %', test_photo_id, comment_count_before;
    
    -- Add test comments
    INSERT INTO comments (photo_id, user_id, content, created_at) VALUES
        (test_photo_id, test_user_id, 'Test comment 1', NOW()),
        (test_photo_id, test_user_id, 'Test comment 2', NOW()),
        (test_photo_id_2, test_user_id, 'Test comment on photo 2', NOW());
    
    -- Check if trigger updated the count
    SELECT comments_count INTO comment_count_after 
    FROM photos 
    WHERE id = test_photo_id;
    
    RAISE NOTICE 'Comments count after adding comments: %', comment_count_after;
    
    IF comment_count_after = comment_count_before + 2 THEN
        RAISE NOTICE '✓ Comments count trigger working correctly';
    ELSE
        RAISE NOTICE '✗ Comments count trigger not working - expected %, got %', comment_count_before + 2, comment_count_after;
    END IF;
    
    -- Step 5: Test deletion triggers
    -- =====================================================
    RAISE NOTICE 'Testing deletion triggers...';
    
    -- Get counts before deletion
    SELECT likes_count, comments_count INTO like_count_before, comment_count_before 
    FROM photos 
    WHERE id = test_photo_id_2;
    
    RAISE NOTICE 'Before deletion - Photo %: likes=%, comments=%', test_photo_id_2, like_count_before, comment_count_before;
    
    -- Delete a like
    DELETE FROM likes WHERE photo_id = test_photo_id_2 AND user_id = test_user_id;
    
    -- Check if trigger updated the count
    SELECT likes_count INTO like_count_after 
    FROM photos 
    WHERE id = test_photo_id_2;
    
    IF like_count_after = like_count_before - 1 THEN
        RAISE NOTICE '✓ Like deletion trigger working correctly';
    ELSE
        RAISE NOTICE '✗ Like deletion trigger not working - expected %, got %', like_count_before - 1, like_count_after;
    END IF;
    
    -- Delete a comment
    DELETE FROM comments WHERE photo_id = test_photo_id_2 AND user_id = test_user_id;
    
    -- Check if trigger updated the count
    SELECT comments_count INTO comment_count_after 
    FROM photos 
    WHERE id = test_photo_id_2;
    
    IF comment_count_after = comment_count_before - 1 THEN
        RAISE NOTICE '✓ Comment deletion trigger working correctly';
    ELSE
        RAISE NOTICE '✗ Comment deletion trigger not working - expected %, got %', comment_count_before - 1, comment_count_after;
    END IF;
    
    -- Step 6: Test Instagram post ID validation
    -- =====================================================
    RAISE NOTICE 'Testing Instagram post ID validation...';
    
    -- Test valid Instagram post ID format
    BEGIN
        INSERT INTO photos (
            title, description, image_url, thumbnail_url, 
            instagram_post_id, user_id, is_public
        ) VALUES (
            'Valid Instagram Test', 'Test with valid Instagram ID',
            'https://example.com/valid.jpg', 'https://example.com/valid-thumb.jpg',
            'C1234567890_ABC123DEF456', test_user_id, true
        );
        RAISE NOTICE '✓ Valid Instagram post ID accepted';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '✗ Valid Instagram post ID rejected: %', SQLERRM;
    END;
    
    -- Test invalid Instagram post ID format
    BEGIN
        INSERT INTO photos (
            title, description, image_url, thumbnail_url, 
            instagram_post_id, user_id, is_public
        ) VALUES (
            'Invalid Instagram Test', 'Test with invalid Instagram ID',
            'https://example.com/invalid.jpg', 'https://example.com/invalid-thumb.jpg',
            'invalid_format_123', test_user_id, true
        );
        RAISE NOTICE '✗ Invalid Instagram post ID accepted (should have been rejected)';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '✓ Invalid Instagram post ID correctly rejected: %', SQLERRM;
    END;
    
    -- Step 7: Test unique constraints
    -- =====================================================
    RAISE NOTICE 'Testing unique constraints...';
    
    -- Try to add duplicate like
    BEGIN
        INSERT INTO likes (photo_id, user_id) VALUES (test_photo_id, test_user_id);
        RAISE NOTICE '✗ Duplicate like accepted (should have been rejected)';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✓ Duplicate like correctly rejected';
        WHEN others THEN
            RAISE NOTICE '✗ Unexpected error on duplicate like: %', SQLERRM;
    END;
    
    -- Try to add duplicate comment like
    BEGIN
        INSERT INTO comment_likes (comment_id, user_id) VALUES (
            (SELECT id FROM comments WHERE photo_id = test_photo_id LIMIT 1), 
            test_user_id
        );
        RAISE NOTICE '✓ Comment like added successfully';
        
        -- Try to add duplicate comment like
        INSERT INTO comment_likes (comment_id, user_id) VALUES (
            (SELECT id FROM comments WHERE photo_id = test_photo_id LIMIT 1), 
            test_user_id
        );
        RAISE NOTICE '✗ Duplicate comment like accepted (should have been rejected)';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✓ Duplicate comment like correctly rejected';
        WHEN others THEN
            RAISE NOTICE '✗ Unexpected error on duplicate comment like: %', SQLERRM;
    END;
    
    RAISE NOTICE 'Test completed successfully!';
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Test failed with error: %', SQLERRM;
        RAISE;
END $$;

-- Step 8: Generate summary report
-- =====================================================
DO $$
DECLARE
    total_photos INTEGER;
    total_likes INTEGER;
    total_comments INTEGER;
    photos_with_instagram INTEGER;
    photos_without_instagram INTEGER;
    avg_likes_per_photo DECIMAL;
    avg_comments_per_photo DECIMAL;
BEGIN
    -- Get comprehensive statistics
    SELECT COUNT(*) INTO total_photos FROM photos;
    SELECT COUNT(*) INTO total_likes FROM likes;
    SELECT COUNT(*) INTO total_comments FROM comments;
    SELECT COUNT(*) INTO photos_with_instagram FROM photos WHERE instagram_post_id IS NOT NULL;
    SELECT COUNT(*) INTO photos_without_instagram FROM photos WHERE instagram_post_id IS NULL;
    
    IF total_photos > 0 THEN
        avg_likes_per_photo := total_likes::DECIMAL / total_photos;
        avg_comments_per_photo := total_comments::DECIMAL / total_photos;
    ELSE
        avg_likes_per_photo := 0;
        avg_comments_per_photo := 0;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TEST SUMMARY REPORT';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Total photos: %', total_photos;
    RAISE NOTICE 'Photos with Instagram IDs: %', photos_with_instagram;
    RAISE NOTICE 'Photos without Instagram IDs: %', photos_without_instagram;
    RAISE NOTICE 'Total likes: %', total_likes;
    RAISE NOTICE 'Total comments: %', total_comments;
    RAISE NOTICE 'Average likes per photo: %', avg_likes_per_photo;
    RAISE NOTICE 'Average comments per photo: %', avg_comments_per_photo;
    RAISE NOTICE '=====================================================';
END $$;

-- Step 9: Show test data for verification
-- =====================================================
-- Display test photos with their Instagram IDs
SELECT 
    'Test Photos' as data_type,
    id,
    title,
    instagram_post_id,
    likes_count,
    comments_count,
    created_at
FROM photos 
WHERE title LIKE 'Test Photo%'
ORDER BY created_at;

-- Display test likes
SELECT 
    'Test Likes' as data_type,
    l.id,
    l.photo_id,
    p.title as photo_title,
    l.user_id,
    l.created_at
FROM likes l
JOIN photos p ON l.photo_id = p.id
WHERE p.title LIKE 'Test Photo%'
ORDER BY l.created_at;

-- Display test comments
SELECT 
    'Test Comments' as data_type,
    c.id,
    c.photo_id,
    p.title as photo_title,
    c.content,
    c.user_id,
    c.created_at
FROM comments c
JOIN photos p ON c.photo_id = p.id
WHERE p.title LIKE 'Test Photo%'
ORDER BY c.created_at;

-- Step 10: Cleanup instructions
-- =====================================================
/*
-- To clean up test data, run these commands:

-- Delete test likes
DELETE FROM likes WHERE photo_id IN (
    SELECT id FROM photos WHERE title LIKE 'Test Photo%'
);

-- Delete test comments
DELETE FROM comments WHERE photo_id IN (
    SELECT id FROM photos WHERE title LIKE 'Test Photo%'
);

-- Delete test photos
DELETE FROM photos WHERE title LIKE 'Test Photo%';

-- Verify cleanup
SELECT COUNT(*) as remaining_test_photos FROM photos WHERE title LIKE 'Test Photo%';
SELECT COUNT(*) as remaining_test_likes FROM likes WHERE photo_id IN (
    SELECT id FROM photos WHERE title LIKE 'Test Photo%'
);
SELECT COUNT(*) as remaining_test_comments FROM comments WHERE photo_id IN (
    SELECT id FROM photos WHERE title LIKE 'Test Photo%'
);
*/

-- =====================================================
-- Test script completed!
-- =====================================================
-- This script has tested:
-- 1. Photo insertion with Instagram post IDs
-- 2. Likes count triggers (insert/delete)
-- 3. Comments count triggers (insert/delete)
-- 4. Instagram post ID format validation
-- 5. Unique constraint enforcement
-- 6. Data integrity and relationships
-- 7. Comprehensive reporting and cleanup
-- ===================================================== 