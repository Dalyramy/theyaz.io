-- Migration: Add Triggers for Timestamps and Count Synchronization
-- Date: 2025-07-14
-- Description: This migration adds triggers to automatically update timestamps and synchronize counts
-- Author: System

-- ============================================================================
-- STEP 1: CREATE TIMESTAMP UPDATE FUNCTION
-- ============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_20250714()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the timestamp function
COMMENT ON FUNCTION update_updated_at_20250714() IS 'Automatically updates the updated_at timestamp to current UTC time when a row is updated';

-- ============================================================================
-- STEP 2: ADD TIMESTAMP TRIGGERS
-- ============================================================================

-- Add trigger for photos table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_photos_updated_at_20250714' 
        AND event_object_table = 'photos'
    ) THEN
        CREATE TRIGGER update_photos_updated_at_20250714 
        BEFORE UPDATE ON public.photos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_20250714();
        RAISE NOTICE 'Created timestamp trigger for photos table';
    ELSE
        RAISE NOTICE 'Timestamp trigger for photos table already exists';
    END IF;
END $$;

-- Add trigger for comments table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_comments_updated_at_20250714' 
        AND event_object_table = 'comments'
    ) THEN
        CREATE TRIGGER update_comments_updated_at_20250714 
        BEFORE UPDATE ON public.comments 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_20250714();
        RAISE NOTICE 'Created timestamp trigger for comments table';
    ELSE
        RAISE NOTICE 'Timestamp trigger for comments table already exists';
    END IF;
END $$;

-- Add trigger for profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_profiles_updated_at_20250714' 
        AND event_object_table = 'profiles'
    ) THEN
        CREATE TRIGGER update_profiles_updated_at_20250714 
        BEFORE UPDATE ON public.profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_20250714();
        RAISE NOTICE 'Created timestamp trigger for profiles table';
    ELSE
        RAISE NOTICE 'Timestamp trigger for profiles table already exists';
    END IF;
END $$;

-- Add trigger for messages table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_messages_updated_at_20250714' 
        AND event_object_table = 'messages'
    ) THEN
        CREATE TRIGGER update_messages_updated_at_20250714 
        BEFORE UPDATE ON public.messages 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_20250714();
        RAISE NOTICE 'Created timestamp trigger for messages table';
    ELSE
        RAISE NOTICE 'Timestamp trigger for messages table already exists';
    END IF;
END $$;

-- Add trigger for notifications table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_notifications_updated_at_20250714' 
        AND event_object_table = 'notifications'
    ) THEN
        CREATE TRIGGER update_notifications_updated_at_20250714 
        BEFORE UPDATE ON public.notifications 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_20250714();
        RAISE NOTICE 'Created timestamp trigger for notifications table';
    ELSE
        RAISE NOTICE 'Timestamp trigger for notifications table already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE COUNT SYNCHRONIZATION FUNCTIONS
-- ============================================================================

-- Function to update photo likes count
CREATE OR REPLACE FUNCTION update_photo_likes_count_20250714()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.photos
  SET likes_count = (
    SELECT COUNT(*) 
    FROM public.likes 
    WHERE photo_id = COALESCE(NEW.photo_id, OLD.photo_id)
  )
  WHERE id = COALESCE(NEW.photo_id, OLD.photo_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update photo comments count
CREATE OR REPLACE FUNCTION update_photo_comments_count_20250714()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.photos
  SET comments_count = (
    SELECT COUNT(*) 
    FROM public.comments 
    WHERE photo_id = COALESCE(NEW.photo_id, OLD.photo_id)
  )
  WHERE id = COALESCE(NEW.photo_id, OLD.photo_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count_20250714()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.comments
  SET likes = (
    SELECT COUNT(*) 
    FROM public.comment_likes 
    WHERE comment_id = COALESCE(NEW.comment_id, OLD.comment_id)
  )
  WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add comments for count synchronization functions
COMMENT ON FUNCTION update_photo_likes_count_20250714() IS 'Updates photo likes count when likes are added or removed';
COMMENT ON FUNCTION update_photo_comments_count_20250714() IS 'Updates photo comments count when comments are added or removed';
COMMENT ON FUNCTION update_comment_likes_count_20250714() IS 'Updates comment likes count when comment likes are added or removed';

-- ============================================================================
-- STEP 4: ADD LIKES COUNT SYNCHRONIZATION TRIGGERS
-- ============================================================================

-- Add trigger for likes table (insert)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'likes_after_insert_20250714' 
        AND event_object_table = 'likes'
    ) THEN
        CREATE TRIGGER likes_after_insert_20250714 
        AFTER INSERT ON public.likes 
        FOR EACH ROW EXECUTE FUNCTION update_photo_likes_count_20250714();
        RAISE NOTICE 'Created likes insert trigger';
    ELSE
        RAISE NOTICE 'Likes insert trigger already exists';
    END IF;
END $$;

-- Add trigger for likes table (delete)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'likes_after_delete_20250714' 
        AND event_object_table = 'likes'
    ) THEN
        CREATE TRIGGER likes_after_delete_20250714 
        AFTER DELETE ON public.likes 
        FOR EACH ROW EXECUTE FUNCTION update_photo_likes_count_20250714();
        RAISE NOTICE 'Created likes delete trigger';
    ELSE
        RAISE NOTICE 'Likes delete trigger already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: ADD COMMENTS COUNT SYNCHRONIZATION TRIGGERS
-- ============================================================================

-- Add trigger for comments table (insert)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'comments_after_insert_20250714' 
        AND event_object_table = 'comments'
    ) THEN
        CREATE TRIGGER comments_after_insert_20250714 
        AFTER INSERT ON public.comments 
        FOR EACH ROW EXECUTE FUNCTION update_photo_comments_count_20250714();
        RAISE NOTICE 'Created comments insert trigger';
    ELSE
        RAISE NOTICE 'Comments insert trigger already exists';
    END IF;
END $$;

-- Add trigger for comments table (delete)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'comments_after_delete_20250714' 
        AND event_object_table = 'comments'
    ) THEN
        CREATE TRIGGER comments_after_delete_20250714 
        AFTER DELETE ON public.comments 
        FOR EACH ROW EXECUTE FUNCTION update_photo_comments_count_20250714();
        RAISE NOTICE 'Created comments delete trigger';
    ELSE
        RAISE NOTICE 'Comments delete trigger already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 6: ADD COMMENT LIKES COUNT SYNCHRONIZATION TRIGGERS
-- ============================================================================

-- Add trigger for comment_likes table (insert)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'comment_likes_after_insert_20250714' 
        AND event_object_table = 'comment_likes'
    ) THEN
        CREATE TRIGGER comment_likes_after_insert_20250714 
        AFTER INSERT ON public.comment_likes 
        FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count_20250714();
        RAISE NOTICE 'Created comment likes insert trigger';
    ELSE
        RAISE NOTICE 'Comment likes insert trigger already exists';
    END IF;
END $$;

-- Add trigger for comment_likes table (delete)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'comment_likes_after_delete_20250714' 
        AND event_object_table = 'comment_likes'
    ) THEN
        CREATE TRIGGER comment_likes_after_delete_20250714 
        AFTER DELETE ON public.comment_likes 
        FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count_20250714();
        RAISE NOTICE 'Created comment likes delete trigger';
    ELSE
        RAISE NOTICE 'Comment likes delete trigger already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 7: VERIFY TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Verify timestamp triggers
DO $$
DECLARE
    trigger_count integer;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_name LIKE '%updated_at_20250714' 
    AND event_object_table IN ('photos', 'comments', 'profiles', 'messages', 'notifications');
    
    IF trigger_count = 5 THEN
        RAISE NOTICE '✅ All timestamp triggers created successfully (% triggers)', trigger_count;
    ELSE
        RAISE WARNING '❌ Expected 5 timestamp triggers, found %', trigger_count;
    END IF;
END $$;

-- Verify count synchronization triggers
DO $$
DECLARE
    trigger_count integer;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_name LIKE '%20250714' 
    AND event_object_table IN ('likes', 'comments', 'comment_likes');
    
    IF trigger_count = 6 THEN
        RAISE NOTICE '✅ All count synchronization triggers created successfully (% triggers)', trigger_count;
    ELSE
        RAISE WARNING '❌ Expected 6 count synchronization triggers, found %', trigger_count;
    END IF;
END $$;

-- ============================================================================
-- STEP 8: INITIAL COUNT SYNCHRONIZATION
-- ============================================================================

-- Update all photo likes counts to ensure consistency
UPDATE public.photos 
SET likes_count = (
    SELECT COUNT(*) 
    FROM public.likes 
    WHERE likes.photo_id = photos.id
)
WHERE id IN (
    SELECT DISTINCT photo_id 
    FROM public.likes 
    WHERE photo_id IS NOT NULL
);

-- Update all photo comments counts to ensure consistency
UPDATE public.photos 
SET comments_count = (
    SELECT COUNT(*) 
    FROM public.comments 
    WHERE comments.photo_id = photos.id
)
WHERE id IN (
    SELECT DISTINCT photo_id 
    FROM public.comments 
    WHERE photo_id IS NOT NULL
);

-- Update all comment likes counts to ensure consistency
UPDATE public.comments 
SET likes = (
    SELECT COUNT(*) 
    FROM public.comment_likes 
    WHERE comment_likes.comment_id = comments.id
)
WHERE id IN (
    SELECT DISTINCT comment_id 
    FROM public.comment_likes 
    WHERE comment_id IS NOT NULL
);

-- ============================================================================
-- STEP 9: FINAL SUMMARY REPORT
-- ============================================================================

-- Generate comprehensive summary report
DO $$
DECLARE
    timestamp_triggers integer;
    count_triggers integer;
    photos_with_likes integer;
    photos_with_comments integer;
    comments_with_likes integer;
    total_likes integer;
    total_comments integer;
    total_comment_likes integer;
BEGIN
    -- Count triggers
    SELECT COUNT(*) INTO timestamp_triggers
    FROM information_schema.triggers 
    WHERE trigger_name LIKE '%updated_at_20250714';
    
    SELECT COUNT(*) INTO count_triggers
    FROM information_schema.triggers 
    WHERE trigger_name LIKE '%20250714' 
    AND event_object_table IN ('likes', 'comments', 'comment_likes');
    
    -- Count data
    SELECT COUNT(*) INTO photos_with_likes FROM public.photos WHERE likes_count > 0;
    SELECT COUNT(*) INTO photos_with_comments FROM public.photos WHERE comments_count > 0;
    SELECT COUNT(*) INTO comments_with_likes FROM public.comments WHERE likes > 0;
    SELECT COUNT(*) INTO total_likes FROM public.likes;
    SELECT COUNT(*) INTO total_comments FROM public.comments;
    SELECT COUNT(*) INTO total_comment_likes FROM public.comment_likes;
    
    RAISE NOTICE 'Migration 20250714221402_add_triggers.sql completed successfully';
    RAISE NOTICE 'Summary Report:';
    RAISE NOTICE '  - Timestamp triggers: %', timestamp_triggers;
    RAISE NOTICE '  - Count synchronization triggers: %', count_triggers;
    RAISE NOTICE '  - Photos with likes: %', photos_with_likes;
    RAISE NOTICE '  - Photos with comments: %', photos_with_comments;
    RAISE NOTICE '  - Comments with likes: %', comments_with_likes;
    RAISE NOTICE '  - Total likes: %', total_likes;
    RAISE NOTICE '  - Total comments: %', total_comments;
    RAISE NOTICE '  - Total comment likes: %', total_comment_likes;
END $$; 