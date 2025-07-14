-- Migration: Add Performance Indexes
-- This migration adds indexes to improve query performance for Instagram and social features

-- Add indexes for photos table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_user_id' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_user_id ON public.photos(user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_instagram_post_id' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_instagram_post_id ON public.photos(instagram_post_id);
    END IF;
END $$;

-- Add indexes for comments table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_photo_id' 
        AND tablename = 'comments'
    ) THEN
        CREATE INDEX idx_comments_photo_id ON public.comments(photo_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_user_id' 
        AND tablename = 'comments'
    ) THEN
        CREATE INDEX idx_comments_user_id ON public.comments(user_id);
    END IF;
END $$;

-- Add indexes for likes table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_likes_photo_id' 
        AND tablename = 'likes'
    ) THEN
        CREATE INDEX idx_likes_photo_id ON public.likes(photo_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_likes_user_id' 
        AND tablename = 'likes'
    ) THEN
        CREATE INDEX idx_likes_user_id ON public.likes(user_id);
    END IF;
END $$;

-- Add indexes for comment_likes table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comment_likes_comment_id' 
        AND tablename = 'comment_likes'
    ) THEN
        CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);
    END IF;
END $$;

-- Add indexes for messages table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_messages_sender_id' 
        AND tablename = 'messages'
    ) THEN
        CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_messages_recipient_id' 
        AND tablename = 'messages'
    ) THEN
        CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
    END IF;
END $$;

-- Add indexes for notifications table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_notifications_recipient_id' 
        AND tablename = 'notifications'
    ) THEN
        CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
    END IF;
END $$;

-- Add composite indexes for better performance on common queries
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_photos_user_created' 
        AND tablename = 'photos'
    ) THEN
        CREATE INDEX idx_photos_user_created ON public.photos(user_id, created_at DESC);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_comments_photo_created' 
        AND tablename = 'comments'
    ) THEN
        CREATE INDEX idx_comments_photo_created ON public.comments(photo_id, created_at DESC);
    END IF;
END $$; 