-- Migration: Fix Instagram Post ID constraint for photos table
-- This script updates the CHECK constraint to allow Instagram IDs with letters, numbers, underscores, and hyphens.
-- It is safe to run multiple times (idempotent).

-- 1. Drop the existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'photos' AND constraint_name = 'photos_instagram_post_id_format'
    ) THEN
        ALTER TABLE public.photos DROP CONSTRAINT photos_instagram_post_id_format;
        RAISE NOTICE 'Dropped existing photos_instagram_post_id_format constraint';
    END IF;
END $$;

-- 2. Add the new CHECK constraint
ALTER TABLE public.photos
ADD CONSTRAINT photos_instagram_post_id_format
CHECK (
    instagram_post_id IS NULL OR 
    (LENGTH(TRIM(instagram_post_id)) > 0 AND instagram_post_id ~ '^[A-Za-z0-9_-]+$')
);

-- 3. Add a comment explaining the constraint
COMMENT ON CONSTRAINT photos_instagram_post_id_format ON public.photos IS 'Ensures instagram_post_id is NULL or matches ^[A-Za-z0-9_-]+$ (letters, numbers, underscores, hyphens)';

-- 4. Test the constraint (for manual testing, not run automatically)
-- To test, connect to your DB and run:
-- INSERT INTO photos (id, title, image_url, instagram_post_id) VALUES (gen_random_uuid(), 'Test Photo', 'https://example.com/test.jpg', 'C1234567890_ABC123'); -- Should succeed
-- INSERT INTO photos (id, title, image_url, instagram_post_id) VALUES (gen_random_uuid(), 'Invalid Photo', 'https://example.com/invalid.jpg', 'Invalid@ID'); -- Should fail

-- 5. This script is idempotent and safe to run multiple times. 