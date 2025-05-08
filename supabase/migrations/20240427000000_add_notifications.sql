-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    type text NOT NULL,
    data jsonb,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can insert notifications for themselves"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can update their notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their notifications"
    ON public.notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = recipient_id);

-- Index for recipient
CREATE INDEX IF NOT EXISTS notifications_recipient_id_idx ON public.notifications(recipient_id); 