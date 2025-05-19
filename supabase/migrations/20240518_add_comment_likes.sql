-- Add comment_likes table for per-user comment likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(comment_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view comment likes"
    ON public.comment_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can like comments"
    ON public.comment_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their comment likes"
    ON public.comment_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Trigger function to keep comments.likes in sync
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments
        SET likes = likes + 1
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments
        SET likes = likes - 1
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for comment_likes
DROP TRIGGER IF EXISTS handle_comment_likes_count_insert ON public.comment_likes;
CREATE TRIGGER handle_comment_likes_count_insert
    AFTER INSERT ON public.comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comment_likes_count();

DROP TRIGGER IF EXISTS handle_comment_likes_count_delete ON public.comment_likes;
CREATE TRIGGER handle_comment_likes_count_delete
    AFTER DELETE ON public.comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comment_likes_count(); 