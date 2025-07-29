-- Simple fix for public photo access
-- Run this in Supabase SQL Editor

-- 1. Make photos bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'photos';

-- 2. Create simple public read policy for all photos
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'photos');

-- 3. Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'photos' AND 
        auth.role() = 'authenticated'
    );

-- 4. Allow users to update their own photos
CREATE POLICY "User update own photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'photos' AND 
        auth.uid()::text = (storage.foldername(name))[2]
    );

-- 5. Allow users to delete their own photos
CREATE POLICY "User delete own photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'photos' AND 
        auth.uid()::text = (storage.foldername(name))[2]
    );

-- 6. Verify the setup
SELECT 'Photos bucket is now public' as status;
SELECT id, name, public FROM storage.buckets WHERE id = 'photos'; 