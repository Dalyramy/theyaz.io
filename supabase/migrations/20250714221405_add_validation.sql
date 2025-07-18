-- Migration: Add CHECK constraints for data validation
-- Description: Adds comprehensive validation constraints to ensure data integrity
-- Date: 2025-07-14
-- Author: System

-- Enable logging for debugging
DO $$
BEGIN
    RAISE NOTICE 'Starting validation constraints migration...';
END $$;

-- =============================================================================
-- PHOTOS TABLE VALIDATION
-- =============================================================================

-- Add CHECK constraints for photos table
ALTER TABLE photos 
ADD CONSTRAINT photos_image_url_not_empty 
CHECK (image_url IS NOT NULL AND LENGTH(TRIM(image_url)) > 0);

ALTER TABLE photos 
ADD CONSTRAINT photos_image_path_not_empty 
CHECK (image_path IS NOT NULL AND LENGTH(TRIM(image_path)) > 0);

ALTER TABLE photos 
ADD CONSTRAINT photos_likes_count_non_negative 
CHECK (likes_count IS NULL OR likes_count >= 0);

ALTER TABLE photos 
ADD CONSTRAINT photos_comments_count_non_negative 
CHECK (comments_count IS NULL OR comments_count >= 0);

-- Instagram post ID format validation (if not null, must be valid format)
ALTER TABLE photos 
ADD CONSTRAINT photos_instagram_post_id_format 
CHECK (
    instagram_post_id IS NULL OR 
    (
        LENGTH(TRIM(instagram_post_id)) > 0 AND
        instagram_post_id ~ '^[0-9]+$'
    )
);

-- URL format validation for image_url
ALTER TABLE photos 
ADD CONSTRAINT photos_image_url_format 
CHECK (
    image_url ~ '^https?://[^\s/$.?#].[^\s]*$' OR
    image_url ~ '^data:image/[^;]+;base64,'
);

-- URL format validation for thumbnail_url (if not null)
ALTER TABLE photos 
ADD CONSTRAINT photos_thumbnail_url_format 
CHECK (
    thumbnail_url IS NULL OR
    thumbnail_url ~ '^https?://[^\s/$.?#].[^\s]*$' OR
    thumbnail_url ~ '^data:image/[^;]+;base64,'
);

DO $$
BEGIN
    RAISE NOTICE 'Added validation constraints to photos table';
END $$;

-- =============================================================================
-- COMMENTS TABLE VALIDATION
-- =============================================================================

-- Add CHECK constraints for comments table
ALTER TABLE comments 
ADD CONSTRAINT comments_content_not_empty 
CHECK (content IS NOT NULL AND LENGTH(TRIM(content)) > 0);

ALTER TABLE comments 
ADD CONSTRAINT comments_likes_non_negative 
CHECK (likes IS NULL OR likes >= 0);

DO $$
BEGIN
    RAISE NOTICE 'Added validation constraints to comments table';
END $$;

-- =============================================================================
-- ALBUMS TABLE VALIDATION
-- =============================================================================

-- Add CHECK constraints for albums table
ALTER TABLE albums 
ADD CONSTRAINT albums_title_not_empty 
CHECK (title IS NOT NULL AND LENGTH(TRIM(title)) > 0);

DO $$
BEGIN
    RAISE NOTICE 'Added validation constraints to albums table';
END $$;

-- =============================================================================
-- CATEGORIES TABLE VALIDATION
-- =============================================================================

-- Add CHECK constraints for categories table
ALTER TABLE categories 
ADD CONSTRAINT categories_name_not_empty 
CHECK (name IS NOT NULL AND LENGTH(TRIM(name)) > 0);

DO $$
BEGIN
    RAISE NOTICE 'Added validation constraints to categories table';
END $$;

-- =============================================================================
-- MESSAGES TABLE VALIDATION
-- =============================================================================

-- Add CHECK constraints for messages table
ALTER TABLE messages 
ADD CONSTRAINT messages_content_not_empty 
CHECK (content IS NOT NULL AND LENGTH(TRIM(content)) > 0);

DO $$
BEGIN
    RAISE NOTICE 'Added validation constraints to messages table';
END $$;

-- =============================================================================
-- NOTIFICATIONS TABLE VALIDATION
-- =============================================================================

-- Add CHECK constraints for notifications table
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_not_empty 
CHECK (type IS NOT NULL AND LENGTH(TRIM(type)) > 0);

DO $$
BEGIN
    RAISE NOTICE 'Added validation constraints to notifications table';
END $$;

-- =============================================================================
-- POSTS TABLE VALIDATION (Additional validation)
-- =============================================================================

-- Add CHECK constraints for posts table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') THEN
        ALTER TABLE posts 
        ADD CONSTRAINT posts_title_not_empty 
        CHECK (title IS NOT NULL AND LENGTH(TRIM(title)) > 0);

        ALTER TABLE posts 
        ADD CONSTRAINT posts_content_not_empty 
        CHECK (content IS NOT NULL AND LENGTH(TRIM(content)) > 0);

        -- Check if comments_count column exists before adding constraint
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
            ALTER TABLE posts 
            ADD CONSTRAINT posts_comments_count_non_negative 
            CHECK (comments_count IS NULL OR comments_count >= 0);
        END IF;

        RAISE NOTICE 'Added validation constraints to posts table';
    ELSE
        RAISE NOTICE 'Posts table does not exist, skipping posts validation';
    END IF;
END $$;

-- =============================================================================
-- POST_COMMENTS TABLE VALIDATION (Additional validation)
-- =============================================================================

-- Add CHECK constraints for post_comments table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_comments' AND table_schema = 'public') THEN
        ALTER TABLE post_comments 
        ADD CONSTRAINT post_comments_content_not_empty 
        CHECK (content IS NOT NULL AND LENGTH(TRIM(content)) > 0);

        RAISE NOTICE 'Added validation constraints to post_comments table';
    ELSE
        RAISE NOTICE 'Post_comments table does not exist, skipping post_comments validation';
    END IF;
END $$;

-- =============================================================================
-- PROFILES TABLE VALIDATION (Additional validation)
-- =============================================================================

-- Add CHECK constraints for profiles table
ALTER TABLE profiles 
ADD CONSTRAINT profiles_username_format 
CHECK (
    username IS NULL OR 
    (LENGTH(TRIM(username)) > 0 AND username ~ '^[a-zA-Z0-9_]+$')
);

-- URL format validation for avatar_url (if not null)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_avatar_url_format 
CHECK (
    avatar_url IS NULL OR
    avatar_url ~ '^https?://[^\s/$.?#].[^\s]*$' OR
    avatar_url ~ '^data:image/[^;]+;base64,'
);

DO $$
BEGIN
    RAISE NOTICE 'Added validation constraints to profiles table';
END $$;

-- =============================================================================
-- USERS TABLE VALIDATION (Additional validation)
-- =============================================================================

-- Add CHECK constraints for users table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_email_format 
        CHECK (
            email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        );

        ALTER TABLE users 
        ADD CONSTRAINT users_username_format 
        CHECK (
            username ~ '^[a-zA-Z0-9_]+$' AND LENGTH(username) >= 3
        );

        ALTER TABLE users 
        ADD CONSTRAINT users_password_hash_not_empty 
        CHECK (password_hash IS NOT NULL AND LENGTH(TRIM(password_hash)) > 0);

        RAISE NOTICE 'Added validation constraints to users table';
    ELSE
        RAISE NOTICE 'Users table does not exist, skipping users validation';
    END IF;
END $$;

-- =============================================================================
-- VERIFICATION AND TESTING
-- =============================================================================

-- Verify all constraints were added successfully
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    -- Count constraints on photos table
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'photos' 
    AND constraint_type = 'CHECK'
    AND table_schema = 'public';
    
    RAISE NOTICE 'Photos table has % CHECK constraints', constraint_count;
    
    -- Count constraints on comments table
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'comments' 
    AND constraint_type = 'CHECK'
    AND table_schema = 'public';
    
    RAISE NOTICE 'Comments table has % CHECK constraints', constraint_count;
    
    -- Count constraints on albums table
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'albums' 
    AND constraint_type = 'CHECK'
    AND table_schema = 'public';
    
    RAISE NOTICE 'Albums table has % CHECK constraints', constraint_count;
    
    -- Count constraints on categories table
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'categories' 
    AND constraint_type = 'CHECK'
    AND table_schema = 'public';
    
    RAISE NOTICE 'Categories table has % CHECK constraints', constraint_count;
    
    -- Count constraints on messages table
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'messages' 
    AND constraint_type = 'CHECK'
    AND table_schema = 'public';
    
    RAISE NOTICE 'Messages table has % CHECK constraints', constraint_count;
    
    -- Count constraints on notifications table
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'notifications' 
    AND constraint_type = 'CHECK'
    AND table_schema = 'public';
    
    RAISE NOTICE 'Notifications table has % CHECK constraints', constraint_count;
END $$;

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================

COMMENT ON CONSTRAINT photos_image_url_not_empty ON photos IS 'Ensures image_url is not null or empty';
COMMENT ON CONSTRAINT photos_image_path_not_empty ON photos IS 'Ensures image_path is not null or empty';
COMMENT ON CONSTRAINT photos_likes_count_non_negative ON photos IS 'Ensures likes_count is non-negative';
COMMENT ON CONSTRAINT photos_comments_count_non_negative ON photos IS 'Ensures comments_count is non-negative';
COMMENT ON CONSTRAINT photos_instagram_post_id_format ON photos IS 'Ensures Instagram post ID is numeric if provided';
COMMENT ON CONSTRAINT photos_image_url_format ON photos IS 'Ensures image_url is a valid URL or base64 data';
COMMENT ON CONSTRAINT photos_thumbnail_url_format ON photos IS 'Ensures thumbnail_url is a valid URL or base64 data if provided';

COMMENT ON CONSTRAINT comments_content_not_empty ON comments IS 'Ensures comment content is not null or empty';
COMMENT ON CONSTRAINT comments_likes_non_negative ON comments IS 'Ensures comment likes count is non-negative';

COMMENT ON CONSTRAINT albums_title_not_empty ON albums IS 'Ensures album title is not null or empty';

COMMENT ON CONSTRAINT categories_name_not_empty ON categories IS 'Ensures category name is not null or empty';

COMMENT ON CONSTRAINT messages_content_not_empty ON messages IS 'Ensures message content is not null or empty';

COMMENT ON CONSTRAINT notifications_type_not_empty ON notifications IS 'Ensures notification type is not null or empty';

-- Add comments for posts constraints (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'posts_title_not_empty' AND table_name = 'posts') THEN
        EXECUTE 'COMMENT ON CONSTRAINT posts_title_not_empty ON posts IS ''Ensures post title is not null or empty''';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'posts_content_not_empty' AND table_name = 'posts') THEN
        EXECUTE 'COMMENT ON CONSTRAINT posts_content_not_empty ON posts IS ''Ensures post content is not null or empty''';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'posts_comments_count_non_negative' AND table_name = 'posts') THEN
        EXECUTE 'COMMENT ON CONSTRAINT posts_comments_count_non_negative ON posts IS ''Ensures post comments count is non-negative''';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'post_comments_content_not_empty' AND table_name = 'post_comments') THEN
        EXECUTE 'COMMENT ON CONSTRAINT post_comments_content_not_empty ON post_comments IS ''Ensures post comment content is not null or empty''';
    END IF;
END $$;

COMMENT ON CONSTRAINT profiles_username_format ON profiles IS 'Ensures username contains only alphanumeric characters and underscores';
COMMENT ON CONSTRAINT profiles_avatar_url_format ON profiles IS 'Ensures avatar_url is a valid URL or base64 data if provided';

COMMENT ON CONSTRAINT users_email_format ON users IS 'Ensures email is in valid format';
COMMENT ON CONSTRAINT users_username_format ON users IS 'Ensures username contains only alphanumeric characters and underscores with minimum length 3';
COMMENT ON CONSTRAINT users_password_hash_not_empty ON users IS 'Ensures password_hash is not null or empty';

-- =============================================================================
-- MIGRATION COMPLETION
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Validation constraints migration completed successfully!';
    RAISE NOTICE 'Added constraints for:';
    RAISE NOTICE '- Photos: image_url, image_path, likes_count, comments_count, Instagram format, URL format';
    RAISE NOTICE '- Comments: content, likes';
    RAISE NOTICE '- Albums: title';
    RAISE NOTICE '- Categories: name';
    RAISE NOTICE '- Messages: content';
    RAISE NOTICE '- Notifications: type';
    RAISE NOTICE '- Posts: title, content, comments_count';
    RAISE NOTICE '- Post Comments: content';
    RAISE NOTICE '- Profiles: username format, avatar_url format';
    RAISE NOTICE '- Users: email format, username format, password_hash';
END $$; 