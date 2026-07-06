
-- Add secure unsubscribe token to newsletter_subscribers
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');

UPDATE public.newsletter_subscribers
  SET unsubscribe_token = encode(gen_random_bytes(32), 'hex')
  WHERE unsubscribe_token IS NULL;

ALTER TABLE public.newsletter_subscribers
  ALTER COLUMN unsubscribe_token SET NOT NULL;

-- Remove plaintext SMTP credentials from system_settings (moved to Edge Function Secrets)
DELETE FROM public.system_settings
  WHERE key IN ('smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'email_from');
