-- Test script for full schema (app + blog)

-- 1. Blog system: create a user
INSERT INTO public.users (username, email, password_hash)
VALUES ('bloguser', 'bloguser@example.com', 'hashedpassword')
ON CONFLICT (username) DO NOTHING;

-- 2. Blog system: create a post
INSERT INTO public.posts (title, content, author_id)
SELECT 'First Blog Post', 'This is the content.', id FROM public.users WHERE username = 'bloguser';

-- 3. Blog system: create a comment
INSERT INTO public.comments_blog (post_id, user_id, content)
SELECT p.id, u.id, 'Nice post!'
FROM public.posts p, public.users u
WHERE p.title = 'First Blog Post' AND u.username = 'bloguser';

-- 4. App system: create a Supabase auth user and profile (simulate with a known UUID)
-- You must have a user in auth.users with this UUID for full FK integrity
-- For test, we'll use a dummy UUID
INSERT INTO public.profiles (id, username, full_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'appuser', 'App User')
ON CONFLICT (id) DO NOTHING;

-- 5. App system: create a category
INSERT INTO public.categories (name, description)
VALUES ('Nature', 'Nature photos')
ON CONFLICT (name) DO NOTHING;

-- 6. App system: create a photo
INSERT INTO public.photos (title, caption, image_url, image_path, user_id)
VALUES ('Test Photo', 'A test photo', 'https://example.com/test.jpg', '/test/path', '00000000-0000-0000-0000-000000000001');

-- 7. App system: create an album
INSERT INTO public.albums (title, description, user_id, category_id)
SELECT 'My Album', 'Album description', '00000000-0000-0000-0000-000000000001', id FROM public.categories WHERE name = 'Nature';

-- 8. App system: assign photo to album
UPDATE public.photos SET album_id = (SELECT id FROM public.albums WHERE title = 'My Album') WHERE title = 'Test Photo';

-- 9. App system: create a comment on the photo
INSERT INTO public.comments (photo_id, user_id, content)
SELECT p.id, '00000000-0000-0000-0000-000000000001', 'Great photo!'
FROM public.photos p WHERE p.title = 'Test Photo';

-- 10. App system: like the photo
INSERT INTO public.likes (photo_id, user_id)
SELECT id, '00000000-0000-0000-0000-000000000001' FROM public.photos WHERE title = 'Test Photo';

-- 11. App system: like the comment
INSERT INTO public.comment_likes (comment_id, user_id)
SELECT c.id, '00000000-0000-0000-0000-000000000001'
FROM public.comments c JOIN public.photos p ON c.photo_id = p.id
WHERE p.title = 'Test Photo' AND c.content = 'Great photo!';

-- 12. App system: create a message
INSERT INTO public.messages (sender_id, recipient_id, content)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Hello!');

-- 13. App system: create a notification
INSERT INTO public.notifications (recipient_id, sender_id, type, data)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'like', '{"photo_id": "dummy"}');

-- 14. Query all data for verification
SELECT 'Blog Users' as section, * FROM public.users;
SELECT 'Blog Posts' as section, * FROM public.posts;
SELECT 'Blog Comments' as section, * FROM public.comments_blog;
SELECT 'App Profiles' as section, * FROM public.profiles;
SELECT 'App Categories' as section, * FROM public.categories;
SELECT 'App Photos' as section, * FROM public.photos;
SELECT 'App Albums' as section, * FROM public.albums;
SELECT 'App Comments' as section, * FROM public.comments;
SELECT 'App Likes' as section, * FROM public.likes;
SELECT 'App Comment Likes' as section, * FROM public.comment_likes;
SELECT 'App Messages' as section, * FROM public.messages;
SELECT 'App Notifications' as section, * FROM public.notifications; 