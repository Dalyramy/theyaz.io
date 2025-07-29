-- Create photos storage bucket and policies
-- Run this in the Supabase SQL Editor

-- 1. Create the photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies for photos bucket

-- Allow authenticated users to upload photos to their own folder
CREATE POLICY "Users can upload photos to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to photos (for viewing)
CREATE POLICY "Public can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- 3. Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'photos';

-- 4. List all storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname; 