-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, photo_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS likes_photo_id_idx ON likes(photo_id);
CREATE INDEX IF NOT EXISTS comments_photo_id_idx ON comments(photo_id);

-- Enable Row Level Security (RLS)
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can create likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;

-- Create or replace the policies
CREATE POLICY "Authenticated users can create likes"
    ON public.likes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can delete own likes"
    ON public.likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes"
    ON public.likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can view all comments" ON public.comments;
CREATE POLICY "Users can view all comments" ON comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own comments" ON public.comments;
CREATE POLICY "Users can create their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id); 