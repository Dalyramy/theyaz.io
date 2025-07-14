-- Production test setup script for Instagram integration
-- This script will create a test photo with Instagram support in production

-- First, let's check if we have any users in production
SELECT COUNT(*) as user_count FROM auth.users;

-- Get a user ID for testing (replace with an actual user ID from your production)
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Get the first user ID from auth.users
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    -- Create a profile if it doesn't exist
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (user_id, 'testuser', 'Test User')
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert a test photo with Instagram post ID
    INSERT INTO public.photos (
        id, title, image_url, image_path, user_id, instagram_post_id, 
        created_at, updated_at, likes_count, comments_count, caption, tags
    ) VALUES (
        gen_random_uuid(),
        'Production Instagram Test',
        'https://www.instagram.com/p/C7QwQk1J8kA/media/?size=l',
        '/photos/instagram_C7QwQk1J8kA.jpg',
        user_id,
        'C7QwQk1J8kA',
        now(),
        now(),
        0,
        0,
        'A beautiful Instagram post showcasing amazing photography.',
        ARRAY['instagram', 'social', 'photography']
    );
    
    RAISE NOTICE 'Production test photo created with user_id: %', user_id;
END $$;

-- Verify the photo was created
SELECT id, title, instagram_post_id, image_url FROM public.photos WHERE instagram_post_id IS NOT NULL; 