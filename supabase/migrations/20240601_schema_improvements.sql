-- Remove profile_id from photos table
ALTER TABLE public.photos DROP COLUMN IF EXISTS profile_id;

-- Add updated_at to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Trigger to update updated_at on messages
CREATE OR REPLACE FUNCTION public.handle_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS handle_messages_updated_at ON public.messages;
CREATE TRIGGER handle_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_messages_updated_at();

-- Ensure ON DELETE CASCADE for all relevant foreign keys
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_photo_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id) ON DELETE CASCADE;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_photo_id_fkey;
ALTER TABLE public.likes ADD CONSTRAINT likes_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id) ON DELETE CASCADE;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.comment_likes DROP CONSTRAINT IF EXISTS comment_likes_comment_id_fkey;
ALTER TABLE public.comment_likes ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;
ALTER TABLE public.comment_likes DROP CONSTRAINT IF EXISTS comment_likes_user_id_fkey;
ALTER TABLE public.comment_likes ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add/verify trigger for likes_count on photos
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.photos
        SET likes_count = likes_count + 1
        WHERE id = NEW.photo_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.photos
        SET likes_count = likes_count - 1
        WHERE id = OLD.photo_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS handle_likes_count_insert ON public.likes;
CREATE TRIGGER handle_likes_count_insert
    AFTER INSERT ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_likes_count();

DROP TRIGGER IF EXISTS handle_likes_count_delete ON public.likes;
CREATE TRIGGER handle_likes_count_delete
    AFTER DELETE ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_likes_count(); 