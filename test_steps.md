# Database Changes Test Guide

Open Supabase Studio at: http://127.0.0.1:54323

## Step 1: Test Categories Table
1. Go to SQL Editor
2. Run this query:
```sql
-- Test 1: Insert categories
INSERT INTO public.categories (name, description) VALUES ('Nature', 'Nature photography');
INSERT INTO public.categories (name, description) VALUES ('Portrait', 'Portrait photography');
INSERT INTO public.categories (name, description) VALUES ('Street', 'Street photography');

-- Test 2: Try to insert duplicate (should fail)
INSERT INTO public.categories (name, description) VALUES ('Nature', 'Duplicate nature category');
```

**Expected Result:** The last insert should fail with "duplicate key value violates unique constraint"

## Step 2: Test Albums Table
```sql
-- Test 3: Create an album
INSERT INTO public.albums (title, description, category_id) 
SELECT 'My First Album', 'A test album', id FROM public.categories WHERE name = 'Nature' LIMIT 1;
```

**Expected Result:** Should insert successfully

## Step 3: Test Photos with Album
```sql
-- Test 4: Create a photo
INSERT INTO public.photos (title, caption, image_url, image_path, user_id) 
VALUES ('Test Photo', 'A test photo', 'https://example.com/test.jpg', '/test/path', '00000000-0000-0000-0000-000000000001');

-- Test 5: Update photo with album
UPDATE public.photos 
SET album_id = (SELECT id FROM public.albums WHERE title = 'My First Album' LIMIT 1)
WHERE title = 'Test Photo';
```

**Expected Result:** Both operations should succeed

## Step 4: Test Comment Likes
```sql
-- Test 6: Create a comment
INSERT INTO public.comments (photo_id, user_id, content) 
SELECT id, '00000000-0000-0000-0000-000000000001', 'Test comment' 
FROM public.photos WHERE title = 'Test Photo' LIMIT 1;

-- Test 7: Like the comment
INSERT INTO public.comment_likes (comment_id, user_id) 
SELECT c.id, '00000000-0000-0000-0000-000000000001'
FROM public.comments c 
JOIN public.photos p ON c.photo_id = p.id 
WHERE p.title = 'Test Photo' AND c.content = 'Test comment' LIMIT 1;

-- Test 8: Try to like the same comment again (should fail)
INSERT INTO public.comment_likes (comment_id, user_id) 
SELECT c.id, '00000000-0000-0000-0000-000000000001'
FROM public.comments c 
JOIN public.photos p ON c.photo_id = p.id 
WHERE p.title = 'Test Photo' AND c.content = 'Test comment' LIMIT 1;
```

**Expected Result:** First two should succeed, third should fail with unique constraint error

## Step 5: Test Photo Likes
```sql
-- Test 9: Like the photo
INSERT INTO public.likes (photo_id, user_id) 
SELECT id, '00000000-0000-0000-0000-000000000001' 
FROM public.photos WHERE title = 'Test Photo' LIMIT 1;

-- Test 10: Try to like the same photo again (should fail)
INSERT INTO public.likes (photo_id, user_id) 
SELECT id, '00000000-0000-0000-0000-000000000001' 
FROM public.photos WHERE title = 'Test Photo' LIMIT 1;
```

**Expected Result:** First should succeed, second should fail

## Step 6: Test Trigger Functions
```sql
-- Test 11: Check if counts are updated correctly
SELECT 'Photo likes count:' as info, likes_count FROM public.photos WHERE title = 'Test Photo';
SELECT 'Comment likes count:' as info, likes FROM public.comments WHERE content = 'Test comment';

-- Test 12: Add another comment to test comment count
INSERT INTO public.comments (photo_id, user_id, content) 
SELECT id, '00000000-0000-0000-0000-000000000002', 'Second test comment' 
FROM public.photos WHERE title = 'Test Photo' LIMIT 1;

-- Test 13: Check updated comment count
SELECT 'Photo comments count:' as info, comments_count FROM public.photos WHERE title = 'Test Photo';
```

**Expected Result:** Counts should be accurate (1 like, 1 comment like, 2 comments)

## Step 7: Test Data Integrity
```sql
-- Test 14: Verify all constraints are working
SELECT 'Categories count:' as info, COUNT(*) FROM public.categories;
SELECT 'Albums count:' as info, COUNT(*) FROM public.albums;
SELECT 'Photos count:' as info, COUNT(*) FROM public.photos;
SELECT 'Comments count:' as info, COUNT(*) FROM public.comments;
SELECT 'Comment likes count:' as info, COUNT(*) FROM public.comment_likes;
SELECT 'Photo likes count:' as info, COUNT(*) FROM public.likes;
```

**Expected Result:** Should show accurate counts

## Step 8: Test Cascade Deletes
```sql
-- Test 15: Delete a photo and verify related data is cleaned up
DELETE FROM public.photos WHERE title = 'Test Photo';

-- Test 16: Verify cascade deletes worked
SELECT 'Photos after delete:' as info, COUNT(*) FROM public.photos WHERE title = 'Test Photo';
SELECT 'Comments after photo delete:' as info, COUNT(*) FROM public.comments;
SELECT 'Likes after photo delete:' as info, COUNT(*) FROM public.likes;
SELECT 'Comment likes after photo delete:' as info, COUNT(*) FROM public.comment_likes;
```

**Expected Result:** All should return 0 (cascade delete worked)

## Success Criteria ✅

If all tests pass, your database changes are working correctly:

- ✅ Unique constraints prevent duplicate likes
- ✅ Categories have unique names
- ✅ Albums and categories work together
- ✅ Photos can be assigned to albums
- ✅ Trigger functions update counts correctly
- ✅ Cascade deletes clean up related data
- ✅ Foreign key relationships work properly

## What to Test Next

1. **Test your app locally** - Start your development server and test the UI
2. **Test with real user data** - Create some test users and photos
3. **Test edge cases** - Try unusual scenarios
4. **Performance test** - Test with larger datasets

## If Tests Fail

If any test fails, check:
1. Migration files are in correct order
2. All constraints were applied correctly
3. Trigger functions are working
4. Database was reset properly

Let me know if you encounter any issues! 