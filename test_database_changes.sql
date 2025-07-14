-- Test script for database changes
-- This will test all the improvements we made to the database

-- 1. Test Categories Table and Unique Constraint
PRINT '=== Testing Categories Table ===';
INSERT INTO public.categories (name, description) VALUES ('Nature', 'Nature photography');
INSERT INTO public.categories (name, description) VALUES ('Portrait', 'Portrait photography');
INSERT INTO public.categories (name, description) VALUES ('Street', 'Street photography');

-- This should fail due to unique constraint
INSERT INTO public.categories (name, description) VALUES ('Nature', 'Duplicate nature category');
-- Expected: ERROR: duplicate key value violates unique constraint "unique_category_name"

-- 2. Test Albums Table
PRINT '=== Testing Albums Table ===';
INSERT INTO public.albums (title, description, category_id) 
SELECT 'My First Album', 'A test album', id FROM public.categories WHERE name = 'Nature' LIMIT 1;

-- 3. Test Photos with Album
PRINT '=== Testing Photos with Album ===';
INSERT INTO public.photos (title, caption, image_url, image_path, user_id) 
VALUES ('Test Photo', 'A test photo', 'https://example.com/test.jpg', '/test/path', '00000000-0000-0000-0000-000000000001');

-- Update photo with album
UPDATE public.photos 
SET album_id = (SELECT id FROM public.albums WHERE title = 'My First Album' LIMIT 1)
WHERE title = 'Test Photo';

-- 4. Test Comment Likes and Unique Constraint
PRINT '=== Testing Comment Likes ===';
-- Insert a comment first
INSERT INTO public.comments (photo_id, user_id, content) 
SELECT id, '00000000-0000-0000-0000-000000000001', 'Test comment' 
FROM public.photos WHERE title = 'Test Photo' LIMIT 1;

-- Like the comment
INSERT INTO public.comment_likes (comment_id, user_id) 
SELECT c.id, '00000000-0000-0000-0000-000000000001'
FROM public.comments c 
JOIN public.photos p ON c.photo_id = p.id 
WHERE p.title = 'Test Photo' AND c.content = 'Test comment' LIMIT 1;

-- Try to like the same comment again (should fail)
INSERT INTO public.comment_likes (comment_id, user_id) 
SELECT c.id, '00000000-0000-0000-0000-000000000001'
FROM public.comments c 
JOIN public.photos p ON c.photo_id = p.id 
WHERE p.title = 'Test Photo' AND c.content = 'Test comment' LIMIT 1;
-- Expected: ERROR: duplicate key value violates unique constraint "unique_comment_like"

-- 5. Test Photo Likes and Unique Constraint
PRINT '=== Testing Photo Likes ===';
-- Like the photo
INSERT INTO public.likes (photo_id, user_id) 
SELECT id, '00000000-0000-0000-0000-000000000001' 
FROM public.photos WHERE title = 'Test Photo' LIMIT 1;

-- Try to like the same photo again (should fail)
INSERT INTO public.likes (photo_id, user_id) 
SELECT id, '00000000-0000-0000-0000-000000000001' 
FROM public.photos WHERE title = 'Test Photo' LIMIT 1;
-- Expected: ERROR: duplicate key value violates unique constraint "unique_photo_like"

-- 6. Test Trigger Functions - Count Updates
PRINT '=== Testing Trigger Functions ===';
-- Check if counts are updated correctly
SELECT 'Photo likes count:' as info, likes_count FROM public.photos WHERE title = 'Test Photo';
SELECT 'Comment likes count:' as info, likes FROM public.comments WHERE content = 'Test comment';

-- Add another comment to test comment count
INSERT INTO public.comments (photo_id, user_id, content) 
SELECT id, '00000000-0000-0000-0000-000000000002', 'Second test comment' 
FROM public.photos WHERE title = 'Test Photo' LIMIT 1;

-- Check updated comment count
SELECT 'Photo comments count:' as info, comments_count FROM public.photos WHERE title = 'Test Photo';

-- 7. Test Data Integrity
PRINT '=== Testing Data Integrity ===';
-- Verify all constraints are working
SELECT 'Categories count:' as info, COUNT(*) FROM public.categories;
SELECT 'Albums count:' as info, COUNT(*) FROM public.albums;
SELECT 'Photos count:' as info, COUNT(*) FROM public.photos;
SELECT 'Comments count:' as info, COUNT(*) FROM public.comments;
SELECT 'Comment likes count:' as info, COUNT(*) FROM public.comment_likes;
SELECT 'Photo likes count:' as info, COUNT(*) FROM public.likes;

-- 8. Test Cascade Deletes
PRINT '=== Testing Cascade Deletes ===';
-- Delete a photo and verify related data is cleaned up
DELETE FROM public.photos WHERE title = 'Test Photo';

-- Verify cascade deletes worked
SELECT 'Photos after delete:' as info, COUNT(*) FROM public.photos WHERE title = 'Test Photo';
SELECT 'Comments after photo delete:' as info, COUNT(*) FROM public.comments;
SELECT 'Likes after photo delete:' as info, COUNT(*) FROM public.likes;
SELECT 'Comment likes after photo delete:' as info, COUNT(*) FROM public.comment_likes;

PRINT '=== All Tests Completed ==='; 