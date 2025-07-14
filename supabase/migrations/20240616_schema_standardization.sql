-- Schema standardization migration
-- This migration standardizes foreign key references and adds missing constraints

-- 1. Standardize User References for App Tables (keep auth.users references)
-- These tables should reference auth.users, not public.users (which is for blog system)

-- Update albums to reference auth.users (already correct, but ensure it exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'albums_user_id_fkey' 
        AND table_name = 'albums'
    ) THEN
        ALTER TABLE public.albums
        ADD CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Update comment_likes to reference auth.users (already correct)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comment_likes_user_id_fkey' 
        AND table_name = 'comment_likes'
    ) THEN
        ALTER TABLE public.comment_likes
        ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Update comments to reference auth.users instead of profiles
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_profiles_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE public.comments
        DROP CONSTRAINT comments_user_id_profiles_id_fkey;
    END IF;
    
    -- Add new constraint to auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Update likes to reference auth.users (already correct)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'likes_user_id_fkey' 
        AND table_name = 'likes'
    ) THEN
        ALTER TABLE public.likes
        ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Update messages to reference auth.users (already correct)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_sender_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE public.messages
        ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_recipient_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE public.messages
        ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Update notifications to reference auth.users (already correct)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_recipient_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE public.notifications
        ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_sender_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE public.notifications
        ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Update profiles to reference auth.users (already correct)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Add Foreign Key for photos.user_id to auth.users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'photos_user_id_fkey' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        ADD CONSTRAINT photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- 3. Prevent Duplicate Likes (already exist in previous migration, but ensure they're there)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_comment_like' 
        AND table_name = 'comment_likes'
    ) THEN
        ALTER TABLE public.comment_likes
        ADD CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_photo_like' 
        AND table_name = 'likes'
    ) THEN
        ALTER TABLE public.likes
        ADD CONSTRAINT unique_photo_like UNIQUE (photo_id, user_id);
    END IF;
END $$;

-- 4. Add comments_count to posts Table (blog system)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE public.posts
        ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 5. Synchronize Count Fields with Triggers (already exist in previous migration)
-- The triggers are already created in the previous migration, so we don't need to recreate them

-- 6. Add Data Validation Constraints
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
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_image_path_not_empty' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        ADD CONSTRAINT check_image_path_not_empty CHECK (image_path <> '');
    END IF;
END $$;

-- 7. Add Indexes for Performance
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_user_id'
    ) THEN
        CREATE INDEX idx_photos_user_id ON public.photos(user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_photo_id'
    ) THEN
        CREATE INDEX idx_comments_photo_id ON public.comments(photo_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_blog_post_id'
    ) THEN
        CREATE INDEX idx_comments_blog_post_id ON public.comments_blog(post_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_blog_user_id'
    ) THEN
        CREATE INDEX idx_comments_blog_user_id ON public.comments_blog(user_id);
    END IF;
END $$;

-- 8. Rename comments_blog to post_comments for Clarity (blog system only)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'comments_blog'
    ) THEN
        -- Rename the table
        ALTER TABLE public.comments_blog RENAME TO post_comments;
        
        -- Rename the primary key constraint
        ALTER TABLE public.post_comments
        RENAME CONSTRAINT comments_blog_pkey TO post_comments_pkey;
        
        -- Rename foreign key constraints
        ALTER TABLE public.post_comments
        RENAME CONSTRAINT comments_blog_post_id_fkey TO post_comments_post_id_fkey;
        
        ALTER TABLE public.post_comments
        RENAME CONSTRAINT comments_blog_user_id_fkey TO post_comments_user_id_fkey;
        
        -- Rename indexes
        ALTER INDEX IF EXISTS idx_comments_blog_post_id RENAME TO idx_post_comments_post_id;
        ALTER INDEX IF EXISTS idx_comments_blog_user_id RENAME TO idx_post_comments_user_id;
    END IF;
END $$;

-- 9. Update existing data to ensure counts are accurate
UPDATE public.comments 
SET likes = (
    SELECT COUNT(*) 
    FROM public.comment_likes 
    WHERE comment_likes.comment_id = comments.id
)
WHERE likes IS NULL OR likes = 0;

UPDATE public.photos 
SET likes_count = (
    SELECT COUNT(*) 
    FROM public.likes 
    WHERE likes.photo_id = photos.id
)
WHERE likes_count IS NULL OR likes_count = 0;

UPDATE public.photos 
SET comments_count = (
    SELECT COUNT(*) 
    FROM public.comments 
    WHERE comments.photo_id = photos.id
)
WHERE comments_count IS NULL OR comments_count = 0;

-- Update blog posts comments count
UPDATE public.posts 
SET comments_count = (
    SELECT COUNT(*) 
    FROM public.post_comments 
    WHERE post_comments.post_id = posts.id
)
WHERE comments_count IS NULL OR comments_count = 0; 