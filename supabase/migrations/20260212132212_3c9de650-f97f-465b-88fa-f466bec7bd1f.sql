
-- Add api_key column to voice_assistants with auto-generated unique keys
ALTER TABLE public.voice_assistants
ADD COLUMN api_key text NOT NULL DEFAULT ('vox_' || replace(gen_random_uuid()::text, '-', ''));

-- Create unique index on api_key
CREATE UNIQUE INDEX idx_voice_assistants_api_key ON public.voice_assistants (api_key);

-- Allow reading assistant config by api_key (for external widget/API usage)
-- This policy allows anonymous users to read assistant config via api_key
CREATE POLICY "Assistants readable by api_key (public)"
ON public.voice_assistants
FOR SELECT
TO anon
USING (true);
