#!/bin/bash

# Apply Supabase migrations to production
echo "Applying Supabase migrations to production..."
supabase db push --project-ref bkbqkpfzrqykrzzvzyrg

# Verify the instagram_post_id column was added
echo "Verifying instagram_post_id column exists..."
supabase db query --project-ref bkbqkpfzrqykrzzvzyrg --query "
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'photos' 
AND column_name = 'instagram_post_id';
"

# Check if the indexes were created
echo "Verifying Instagram-related indexes..."
supabase db query --project-ref bkbqkpfzrqykrzzvzyrg --query "
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'photos' 
AND indexname LIKE '%instagram%';
"

# Show sample data structure
echo "Showing photos table structure..."
supabase db query --project-ref bkbqkpfzrqykrzzvzyrg --query "
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'photos' 
ORDER BY ordinal_position;
"

echo "Migration verification complete!" 