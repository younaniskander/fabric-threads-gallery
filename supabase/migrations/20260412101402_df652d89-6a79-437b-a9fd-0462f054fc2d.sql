-- Add user_id to messages (nullable, for logged-in users)
ALTER TABLE public.messages ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update the insert policy to allow user_id
DROP POLICY IF EXISTS "Anyone can send messages" ON public.messages;
CREATE POLICY "Anyone can send messages"
ON public.messages
FOR INSERT
TO public
WITH CHECK (
  (name IS NOT NULL) AND (length(TRIM(BOTH FROM name)) > 0) AND (length(name) <= 100)
  AND (message IS NOT NULL) AND (length(TRIM(BOTH FROM message)) > 0) AND (length(message) <= 2000)
  AND ((phone IS NULL) OR (length(phone) <= 20))
  AND (is_read = false)
);

-- Allow authenticated users to view their own messages
CREATE POLICY "Users can view own messages"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create message_replies table
CREATE TABLE public.message_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reply_text text NOT NULL,
  replied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with replies
CREATE POLICY "Admins can insert replies"
ON public.message_replies
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all replies"
ON public.message_replies
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete replies"
ON public.message_replies
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view replies on their own messages
CREATE POLICY "Users can view replies to own messages"
ON public.message_replies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages
    WHERE messages.id = message_replies.message_id
    AND messages.user_id = auth.uid()
  )
);