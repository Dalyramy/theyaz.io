-- Migration: Fix photos-profiles relationship
-- Description: Adds missing foreign key relationship between photos and profiles tables
-- Date: 2025-07-15
-- Author: System

-- Enable logging for debugging
DO $$
BEGIN
    RAISE NOTICE 'Starting photos-profiles relationship fix...';
END $$;

-- =============================================================================
-- ADD MISSING FOREIGN KEY RELATIONSHIP
-- =============================================================================

-- Add foreign key constraint for photos.user_id -> profiles.id
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'photos_user_id_fkey' 
        AND table_name = 'photos'
        AND table_schema = 'public'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.photos 
        ADD CONSTRAINT photos_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added photos_user_id_fkey constraint';
    ELSE
        RAISE NOTICE 'photos_user_id_fkey constraint already exists';
    END IF;
END $$;

-- =============================================================================
-- VERIFY THE RELATIONSHIP
-- =============================================================================

-- Verify the constraint was added
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'photos_user_id_fkey' 
        AND table_name = 'photos'
        AND table_schema = 'public'
        AND constraint_type = 'FOREIGN KEY'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE 'SUCCESS: photos_user_id_fkey constraint is properly set up';
    ELSE
        RAISE NOTICE 'ERROR: photos_user_id_fkey constraint was not created';
    END IF;
END $$;

-- =============================================================================
-- ADD INDEX FOR PERFORMANCE
-- =============================================================================

-- Add index on photos.user_id for better query performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'photos_user_id_idx'
    ) THEN
        CREATE INDEX photos_user_id_idx ON public.photos(user_id);
        RAISE NOTICE 'Added index on photos.user_id';
    ELSE
        RAISE NOTICE 'Index photos_user_id_idx already exists';
    END IF;
END $$;

-- =============================================================================
-- FINAL VERIFICATION
-- =============================================================================

-- Show the relationship in the schema
DO $$
BEGIN
    RAISE NOTICE 'Final verification:';
    RAISE NOTICE 'Photos table now has a foreign key relationship to profiles table via user_id column';
    RAISE NOTICE 'This should resolve the "Could not find a relationship between photos and profiles" error';
END $$; 