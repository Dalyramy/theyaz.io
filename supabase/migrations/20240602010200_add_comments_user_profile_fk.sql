-- Add a foreign key from comments.user_id to profiles.id for Supabase join support
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_profiles_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE; 