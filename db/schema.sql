-- Schema for public.entries on Neon, matching the Supabase table it replaced.
-- Idempotent: safe to run again.
--
-- No RLS or anon grants: only the server-side /api functions connect, as the
-- owner role, and every public query filters on is_hidden = false.
-- To hide an entry: UPDATE public.entries SET is_hidden = true WHERE public_id = '...';

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public.entries (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id  text        NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  title      text        NOT NULL,
  message    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_hidden  boolean     NOT NULL DEFAULT false,
  author     varchar(30)          DEFAULT 'Anonymous',
  CONSTRAINT entries_title_length_check
    CHECK (char_length(title) BETWEEN 1 AND 90 AND title = btrim(title)),
  CONSTRAINT entries_message_length_check
    CHECK (char_length(message) BETWEEN 1 AND 1400 AND message = btrim(message))
);

CREATE INDEX IF NOT EXISTS entries_visible_created_at_idx
  ON public.entries (created_at DESC) WHERE is_hidden = false;
CREATE INDEX IF NOT EXISTS entries_visible_title_trgm_idx
  ON public.entries USING gin (title gin_trgm_ops) WHERE is_hidden = false;
CREATE INDEX IF NOT EXISTS entries_author_idx
  ON public.entries (author);
