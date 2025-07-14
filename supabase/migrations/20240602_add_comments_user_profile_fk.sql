-- Add a foreign key from comments.user_id to profiles.id for Supabase join support
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'comments'
          AND constraint_name = 'comments_user_id_profiles_id_fkey'
    ) THEN
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_user_id_profiles_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- The following line is now handled by the block above:
-- ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_profiles_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE; 