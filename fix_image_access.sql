-- Fix image access issues by updating storage policies
-- Run this in Supabase SQL Editor

-- 1. Drop existing storage policies that might be blocking access
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- 2. Create new storage policies that allow public read access
-- Allow public read access to all photos
CREATE POLICY "Public read access to photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'photos' AND 
        (storage.foldername(name))[1] = 'public'
    );

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'photos' AND 
        auth.role() = 'authenticated'
    );

-- Allow users to update their own photos
CREATE POLICY "Users can update their own photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'photos' AND 
        auth.uid()::text = (storage.foldername(name))[2]
    );

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'photos' AND 
        auth.uid()::text = (storage.foldername(name))[2]
    );

-- 3. Ensure photos table has proper RLS policies for read access
-- Enable RLS on photos table if not already enabled
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access to photos" ON public.photos;
DROP POLICY IF EXISTS "Users can insert their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON public.photos;

-- Create new policies
-- Allow public read access to all photos
CREATE POLICY "Public read access to photos" ON public.photos
    FOR SELECT USING (true);

-- Allow authenticated users to insert photos
CREATE POLICY "Users can insert their own photos" ON public.photos
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        auth.uid() = user_id
    );

-- Allow users to update their own photos
CREATE POLICY "Users can update their own photos" ON public.photos
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        auth.uid() = user_id
    );

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" ON public.photos
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        auth.uid() = user_id
    );

-- 4. Verify the setup
SELECT 'Storage policies created successfully' as status;

-- Check if photos bucket exists and is public
SELECT 
    id as bucket_id,
    name as bucket_name,
    public as is_public
FROM storage.buckets 
WHERE id = 'photos';

-- Check storage policies
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
WHERE tablename = 'objects' AND schemaname = 'storage'; 