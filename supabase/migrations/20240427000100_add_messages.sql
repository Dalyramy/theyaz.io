-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages as sender"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages"
    ON public.messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their sent messages"
    ON public.messages FOR DELETE
    TO authenticated
    USING (auth.uid() = sender_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id); 