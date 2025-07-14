-- Migration: Add Unique Constraints
-- This migration adds unique constraints to prevent duplicate likes and comment likes

-- Add unique constraint to likes table to prevent duplicate photo likes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_photo_like' 
        AND table_name = 'likes'
    ) THEN
        ALTER TABLE public.likes
        ADD CONSTRAINT unique_photo_like UNIQUE (photo_id, user_id);
    END IF;
END $$;

-- Add unique constraint to comment_likes table to prevent duplicate comment likes
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
END $$;

-- Clean up any existing duplicate likes before adding constraints
-- This will keep only the most recent like for each photo-user combination
DELETE FROM public.likes WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY photo_id, user_id ORDER BY created_at DESC) AS rn
        FROM public.likes
    ) t WHERE rn > 1
);

-- Clean up any existing duplicate comment likes
DELETE FROM public.comment_likes WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY comment_id, user_id ORDER BY created_at DESC) AS rn
        FROM public.comment_likes
    ) t WHERE rn > 1
); 