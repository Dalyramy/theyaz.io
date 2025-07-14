-- Migration: Add Instagram Support to Photos Table
-- This migration adds Instagram post ID support to enable Instagram photo integration

-- Add instagram_post_id column to photos table
ALTER TABLE public.photos
ADD COLUMN instagram_post_id text;

-- Add index for efficient Instagram post queries
CREATE INDEX idx_photos_instagram_post_id ON public.photos(instagram_post_id);

-- Add comment explaining the new column
COMMENT ON COLUMN public.photos.instagram_post_id IS 'Stores Instagram post ID for photos sourced from Instagram. Used for embedding Instagram posts in the gallery.'; 