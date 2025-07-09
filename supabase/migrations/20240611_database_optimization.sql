-- Database Performance Optimizations
-- Add composite indexes for better query performance

-- Composite index for photos with user_id and created_at (for user galleries)
CREATE INDEX IF NOT EXISTS photos_user_created_idx ON public.photos(user_id, created_at DESC);

-- Composite index for photos with tags (for tag-based searches)
CREATE INDEX IF NOT EXISTS photos_tags_idx ON public.photos USING GIN(tags);
CREATE INDEX IF NOT EXISTS photos_created_idx ON public.photos(created_at DESC);

-- Composite index for comments with photo_id and created_at
CREATE INDEX IF NOT EXISTS comments_photo_created_idx ON public.comments(photo_id, created_at DESC);

-- Composite index for likes with photo_id and created_at
CREATE INDEX IF NOT EXISTS likes_photo_created_idx ON public.likes(photo_id, created_at DESC);

-- Full-text search index for photos
CREATE INDEX IF NOT EXISTS photos_search_idx ON public.photos USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(caption, ''))
);

-- Function to update search vector on photo changes
CREATE OR REPLACE FUNCTION public.update_photo_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.caption, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add search_vector column to photos if it doesn't exist
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create trigger to update search vector
DROP TRIGGER IF EXISTS update_photo_search_vector_trigger ON public.photos;
CREATE TRIGGER update_photo_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_photo_search_vector();

-- Update existing photos with search vector
UPDATE public.photos SET search_vector = to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(caption, ''))
WHERE search_vector IS NULL;

-- Add partial indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS photos_public_idx ON public.photos(created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS photos_featured_idx ON public.photos(created_at DESC) WHERE likes_count > 0;

-- Function to get trending photos (photos with most likes in last 7 days)
CREATE OR REPLACE FUNCTION public.get_trending_photos(limit_count integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  title text,
  caption text,
  image_url text,
  likes_count integer,
  created_at timestamp with time zone,
  user_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.caption,
    p.image_url,
    p.likes_count,
    p.created_at,
    p.user_id
  FROM public.photos p
  WHERE p.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY p.likes_count DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid uuid)
RETURNS TABLE(
  total_photos integer,
  total_likes integer,
  total_comments integer,
  avg_likes_per_photo numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(p.id)::integer as total_photos,
    COALESCE(SUM(p.likes_count), 0)::integer as total_likes,
    COALESCE(SUM(p.comments_count), 0)::integer as total_comments,
    CASE 
      WHEN COUNT(p.id) > 0 THEN ROUND(AVG(p.likes_count), 2)
      ELSE 0
    END as avg_likes_per_photo
  FROM public.photos p
  WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for user stats function
GRANT EXECUTE ON FUNCTION public.get_user_stats(uuid) TO authenticated; 