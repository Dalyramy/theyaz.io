-- Database improvements migration
-- This migration applies the changes from database_changes.txt safely

-- 1. Preventing Duplicate Likes (already exist, but let's ensure they're there)
-- These constraints already exist, but we'll add them with IF NOT EXISTS to be safe
DO $$ 
BEGIN
    -- Add unique constraint to comment_likes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_comment_like' 
        AND table_name = 'comment_likes'
    ) THEN
        ALTER TABLE public.comment_likes
        ADD CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id);
    END IF;
    
    -- Add unique constraint to likes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_photo_like' 
        AND table_name = 'likes'
    ) THEN
        ALTER TABLE public.likes
        ADD CONSTRAINT unique_photo_like UNIQUE (photo_id, user_id);
    END IF;
END $$;

-- 2. Simplifying Foreign Key Constraints
-- Remove direct references to auth.users, relying on profiles.id instead
-- First, let's check if the constraints exist before trying to drop them

-- Drop comments FK to auth.users if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE public.comments
        DROP CONSTRAINT comments_user_id_fkey;
    END IF;
END $$;

-- Drop photos FK to auth.users if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'photos_user_id_fkey' 
        AND table_name = 'photos'
    ) THEN
        ALTER TABLE public.photos
        DROP CONSTRAINT photos_user_id_fkey;
    END IF;
END $$;

-- 3. Adding Unique Constraint to Categories
-- Ensure category names are unique
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_category_name' 
        AND table_name = 'categories'
    ) THEN
        ALTER TABLE public.categories
        ADD CONSTRAINT unique_category_name UNIQUE (name);
    END IF;
END $$;

-- 4. Synchronizing Count Fields
-- Drop existing trigger functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS update_comment_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_comment_likes_count_on_delete() CASCADE;
DROP FUNCTION IF EXISTS update_photo_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_photo_likes_count_on_delete() CASCADE;
DROP FUNCTION IF EXISTS update_photo_comments_count() CASCADE;
DROP FUNCTION IF EXISTS update_photo_comments_count_on_delete() CASCADE;

-- Create functions and triggers to keep likes and comments counts updated

-- Function and trigger for comment likes (insert)
CREATE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.comments
    SET likes = (SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = NEW.comment_id)
    WHERE id = NEW.comment_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS comment_likes_after_insert ON public.comment_likes;
DROP TRIGGER IF EXISTS comment_likes_after_delete ON public.comment_likes;

CREATE TRIGGER comment_likes_after_insert
AFTER INSERT ON public.comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Function and trigger for comment likes (delete)
CREATE FUNCTION update_comment_likes_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.comments
    SET likes = (SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = OLD.comment_id)
    WHERE id = OLD.comment_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_likes_after_delete
AFTER DELETE ON public.comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count_on_delete();

-- Function and trigger for photo likes (insert)
CREATE FUNCTION update_photo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.photos
    SET likes_count = (SELECT COUNT(*) FROM public.likes WHERE photo_id = NEW.photo_id)
    WHERE id = NEW.photo_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS likes_after_insert ON public.likes;
DROP TRIGGER IF EXISTS likes_after_delete ON public.likes;

CREATE TRIGGER likes_after_insert
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION update_photo_likes_count();

-- Function and trigger for photo likes (delete)
CREATE FUNCTION update_photo_likes_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.photos
    SET likes_count = (SELECT COUNT(*) FROM public.likes WHERE photo_id = OLD.photo_id)
    WHERE id = OLD.photo_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_after_delete
AFTER DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION update_photo_likes_count_on_delete();

-- Function and trigger for photo comments (insert)
CREATE FUNCTION update_photo_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.photos
    SET comments_count = (SELECT COUNT(*) FROM public.comments WHERE photo_id = NEW.photo_id)
    WHERE id = NEW.photo_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS comments_after_insert ON public.comments;
DROP TRIGGER IF EXISTS comments_after_delete ON public.comments;

CREATE TRIGGER comments_after_insert
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_photo_comments_count();

-- Function and trigger for photo comments (delete)
CREATE FUNCTION update_photo_comments_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.photos
    SET comments_count = (SELECT COUNT(*) FROM public.comments WHERE photo_id = OLD.photo_id)
    WHERE id = OLD.photo_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_after_delete
AFTER DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_photo_comments_count_on_delete();

-- 5. Update existing data to ensure counts are accurate
-- This will sync all existing counts with actual data
UPDATE public.comments 
SET likes = (
    SELECT COUNT(*) 
    FROM public.comment_likes 
    WHERE comment_likes.comment_id = comments.id
);

UPDATE public.photos 
SET likes_count = (
    SELECT COUNT(*) 
    FROM public.likes 
    WHERE likes.photo_id = photos.id
);

UPDATE public.photos 
SET comments_count = (
    SELECT COUNT(*) 
    FROM public.comments 
    WHERE comments.photo_id = photos.id
); 