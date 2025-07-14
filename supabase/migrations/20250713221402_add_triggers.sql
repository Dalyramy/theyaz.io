-- Migration: Add Triggers for Timestamps and Count Synchronization
-- This migration adds triggers to automatically update timestamps and synchronize counts

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at timestamps
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_photos_updated_at' 
        AND event_object_table = 'photos'
    ) THEN
        CREATE TRIGGER update_photos_updated_at 
        BEFORE UPDATE ON public.photos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_comments_updated_at' 
        AND event_object_table = 'comments'
    ) THEN
        CREATE TRIGGER update_comments_updated_at 
        BEFORE UPDATE ON public.comments 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_profiles_updated_at' 
        AND event_object_table = 'profiles'
    ) THEN
        CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON public.profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_messages_updated_at' 
        AND event_object_table = 'messages'
    ) THEN
        CREATE TRIGGER update_messages_updated_at 
        BEFORE UPDATE ON public.messages 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_notifications_updated_at' 
        AND event_object_table = 'notifications'
    ) THEN
        CREATE TRIGGER update_notifications_updated_at 
        BEFORE UPDATE ON public.notifications 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- Create function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.comments
  SET likes = (SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = NEW.comment_id)
  WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update comment likes count on delete
CREATE OR REPLACE FUNCTION update_comment_likes_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.comments
  SET likes = (SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = OLD.comment_id)
  WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for comment likes count synchronization
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'comment_likes_after_insert' 
        AND event_object_table = 'comment_likes'
    ) THEN
        CREATE TRIGGER comment_likes_after_insert 
        AFTER INSERT ON public.comment_likes 
        FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'comment_likes_after_delete' 
        AND event_object_table = 'comment_likes'
    ) THEN
        CREATE TRIGGER comment_likes_after_delete 
        AFTER DELETE ON public.comment_likes 
        FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count_on_delete();
    END IF;
END $$;

-- Create function to update photo likes count
CREATE OR REPLACE FUNCTION update_photo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.photos
  SET likes_count = (SELECT COUNT(*) FROM public.likes WHERE photo_id = NEW.photo_id)
  WHERE id = NEW.photo_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update photo likes count on delete
CREATE OR REPLACE FUNCTION update_photo_likes_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.photos
  SET likes_count = (SELECT COUNT(*) FROM public.likes WHERE photo_id = OLD.photo_id)
  WHERE id = OLD.photo_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for photo likes count synchronization
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'likes_after_insert' 
        AND event_object_table = 'likes'
    ) THEN
        CREATE TRIGGER likes_after_insert 
        AFTER INSERT ON public.likes 
        FOR EACH ROW EXECUTE FUNCTION update_photo_likes_count();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'likes_after_delete' 
        AND event_object_table = 'likes'
    ) THEN
        CREATE TRIGGER likes_after_delete 
        AFTER DELETE ON public.likes 
        FOR EACH ROW EXECUTE FUNCTION update_photo_likes_count_on_delete();
    END IF;
END $$;

-- Create function to update photo comments count
CREATE OR REPLACE FUNCTION update_photo_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.photos
  SET comments_count = (SELECT COUNT(*) FROM public.comments WHERE photo_id = NEW.photo_id)
  WHERE id = NEW.photo_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update photo comments count on delete
CREATE OR REPLACE FUNCTION update_photo_comments_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.photos
  SET comments_count = (SELECT COUNT(*) FROM public.comments WHERE photo_id = OLD.photo_id)
  WHERE id = OLD.photo_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for photo comments count synchronization
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'comments_after_insert' 
        AND event_object_table = 'comments'
    ) THEN
        CREATE TRIGGER comments_after_insert 
        AFTER INSERT ON public.comments 
        FOR EACH ROW EXECUTE FUNCTION update_photo_comments_count();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'comments_after_delete' 
        AND event_object_table = 'comments'
    ) THEN
        CREATE TRIGGER comments_after_delete 
        AFTER DELETE ON public.comments 
        FOR EACH ROW EXECUTE FUNCTION update_photo_comments_count_on_delete();
    END IF;
END $$; 