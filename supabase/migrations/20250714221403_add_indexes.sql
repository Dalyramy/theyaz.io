-- Migration: Add Performance Indexes for Better Query Performance
-- Date: 2025-07-14
-- Description: This migration adds indexes to improve query performance for social features and user data
-- Author: System

-- Add indexes for photos table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_user_id_20250714' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_user_id_20250714 ON public.photos(user_id);
        RAISE NOTICE 'Created index idx_photos_user_id_20250714 on photos(user_id)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_instagram_post_id_20250714' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_instagram_post_id_20250714 ON public.photos(instagram_post_id);
        RAISE NOTICE 'Created index idx_photos_instagram_post_id_20250714 on photos(instagram_post_id)';
    END IF;
END $$;

-- Add indexes for comments table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_photo_id_20250714' 
        AND tablename = 'comments'
    ) THEN
        CREATE INDEX idx_comments_photo_id_20250714 ON public.comments(photo_id);
        RAISE NOTICE 'Created index idx_comments_photo_id_20250714 on comments(photo_id)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_user_id_20250714' 
        AND tablename = 'comments'
    ) THEN
        CREATE INDEX idx_comments_user_id_20250714 ON public.comments(user_id);
        RAISE NOTICE 'Created index idx_comments_user_id_20250714 on comments(user_id)';
    END IF;
END $$;

-- Add indexes for likes table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_likes_photo_id_20250714' 
        AND tablename = 'likes'
    ) THEN
        CREATE INDEX idx_likes_photo_id_20250714 ON public.likes(photo_id);
        RAISE NOTICE 'Created index idx_likes_photo_id_20250714 on likes(photo_id)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_likes_user_id_20250714' 
        AND tablename = 'likes'
    ) THEN
        CREATE INDEX idx_likes_user_id_20250714 ON public.likes(user_id);
        RAISE NOTICE 'Created index idx_likes_user_id_20250714 on likes(user_id)';
    END IF;
END $$;

-- Add indexes for comment_likes table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comment_likes_comment_id_20250714' 
        AND tablename = 'comment_likes'
    ) THEN
        CREATE INDEX idx_comment_likes_comment_id_20250714 ON public.comment_likes(comment_id);
        RAISE NOTICE 'Created index idx_comment_likes_comment_id_20250714 on comment_likes(comment_id)';
    END IF;
END $$;

-- Add indexes for messages table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_messages_sender_id_20250714' 
        AND tablename = 'messages'
    ) THEN
        CREATE INDEX idx_messages_sender_id_20250714 ON public.messages(sender_id);
        RAISE NOTICE 'Created index idx_messages_sender_id_20250714 on messages(sender_id)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_messages_recipient_id_20250714' 
        AND tablename = 'messages'
    ) THEN
        CREATE INDEX idx_messages_recipient_id_20250714 ON public.messages(recipient_id);
        RAISE NOTICE 'Created index idx_messages_recipient_id_20250714 on messages(recipient_id)';
    END IF;
END $$;

-- Add indexes for notifications table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_notifications_recipient_id_20250714' 
        AND tablename = 'notifications'
    ) THEN
        CREATE INDEX idx_notifications_recipient_id_20250714 ON public.notifications(recipient_id);
        RAISE NOTICE 'Created index idx_notifications_recipient_id_20250714 on notifications(recipient_id)';
    END IF;
END $$;

-- Add composite indexes for better performance on common queries
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_user_created_20250714' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_user_created_20250714 ON public.photos(user_id, created_at DESC);
        RAISE NOTICE 'Created composite index idx_photos_user_created_20250714 on photos(user_id, created_at DESC)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_photo_created_20250714' 
        AND tablename = 'comments'
    ) THEN
        CREATE INDEX idx_comments_photo_created_20250714 ON public.comments(photo_id, created_at DESC);
        RAISE NOTICE 'Created composite index idx_comments_photo_created_20250714 on comments(photo_id, created_at DESC)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_messages_conversation_20250714' 
        AND tablename = 'messages'
    ) THEN
        CREATE INDEX idx_messages_conversation_20250714 ON public.messages(sender_id, recipient_id, created_at DESC);
        RAISE NOTICE 'Created composite index idx_messages_conversation_20250714 on messages(sender_id, recipient_id, created_at DESC)';
    END IF;
END $$;

-- Add partial indexes for better performance on filtered queries
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_notifications_unread_20250714' 
        AND tablename = 'notifications'
    ) THEN
        CREATE INDEX idx_notifications_unread_20250714 ON public.notifications(recipient_id, created_at DESC) 
        WHERE is_read = false;
        RAISE NOTICE 'Created partial index idx_notifications_unread_20250714 on notifications(recipient_id, created_at DESC) WHERE is_read = false';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_instagram_20250714' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_instagram_20250714 ON public.photos(instagram_post_id, created_at DESC) 
        WHERE instagram_post_id IS NOT NULL;
        RAISE NOTICE 'Created partial index idx_photos_instagram_20250714 on photos(instagram_post_id, created_at DESC) WHERE instagram_post_id IS NOT NULL';
    END IF;
END $$;

-- Add comments explaining the indexes
COMMENT ON INDEX idx_photos_user_id_20250714 IS 'Index for efficient user photo queries';
COMMENT ON INDEX idx_photos_instagram_post_id_20250714 IS 'Index for efficient Instagram post queries';
COMMENT ON INDEX idx_comments_photo_id_20250714 IS 'Index for efficient photo comment queries';
COMMENT ON INDEX idx_comments_user_id_20250714 IS 'Index for efficient user comment queries';
COMMENT ON INDEX idx_likes_photo_id_20250714 IS 'Index for efficient photo like queries';
COMMENT ON INDEX idx_likes_user_id_20250714 IS 'Index for efficient user like queries';
COMMENT ON INDEX idx_comment_likes_comment_id_20250714 IS 'Index for efficient comment like queries';
COMMENT ON INDEX idx_messages_sender_id_20250714 IS 'Index for efficient message sender queries';
COMMENT ON INDEX idx_messages_recipient_id_20250714 IS 'Index for efficient message recipient queries';
COMMENT ON INDEX idx_notifications_recipient_id_20250714 IS 'Index for efficient notification recipient queries';

-- Log the migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 20250714221403_add_indexes.sql completed successfully';
    RAISE NOTICE 'Performance indexes added for better query performance';
END $$; 