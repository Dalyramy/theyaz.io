-- Fix Upload Issues - Comprehensive Solution
-- Run this in the Supabase SQL Editor

-- 1. Create photos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing storage policies to recreate them properly
DROP POLICY IF EXISTS "Users can upload photos to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;

-- 3. Create storage policies for photos bucket
CREATE POLICY "Users can upload photos to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- 4. Ensure photos table has proper RLS policies
-- Enable RLS on photos table if not already enabled
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can create photos" ON public.photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON public.photos;
DROP POLICY IF EXISTS "Public can view photos" ON public.photos;

-- Create photos table policies
CREATE POLICY "Users can create photos" ON public.photos 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" ON public.photos 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON public.photos 
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view photos" ON public.photos 
FOR SELECT USING (true);

-- 5. Verify the setup
SELECT 'Storage Bucket Check' as check_type, 
       CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'photos') 
            THEN '✅ Photos bucket exists' 
            ELSE '❌ Photos bucket missing' 
       END as status;

SELECT 'Photos Table Policies' as check_type, 
       COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'photos' AND schemaname = 'public';

SELECT 'Storage Policies' as check_type, 
       COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' AND tablename = 'objects'; 