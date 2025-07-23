-- Migration: Remove Instagram Support from Photos Table
-- Date: 2024-07-16
-- This migration removes the instagram_post_id column and all related constraints and indexes from the photos table.

-- 1. Drop constraints (if exist)
ALTER TABLE public.photos DROP CONSTRAINT IF EXISTS photos_instagram_post_id_format;
ALTER TABLE public.photos DROP CONSTRAINT IF EXISTS check_instagram_post_id_format_20250714;
ALTER TABLE public.photos DROP CONSTRAINT IF EXISTS check_instagram_post_id_format;

-- 2. Drop indexes (if exist)
DROP INDEX IF EXISTS idx_photos_instagram_post_id_20250714;
DROP INDEX IF EXISTS idx_photos_instagram_not_null_20250714;
DROP INDEX IF EXISTS idx_photos_instagram_post_id;
DROP INDEX IF EXISTS idx_photos_instagram_20250714;

-- 3. Drop the column
ALTER TABLE public.photos DROP COLUMN IF EXISTS instagram_post_id; 