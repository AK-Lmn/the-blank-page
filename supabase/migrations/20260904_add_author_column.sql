-- Add author column to entries table with 'Anonymous' as default
ALTER TABLE public.entries
ADD COLUMN IF NOT EXISTS author VARCHAR(30) DEFAULT 'Anonymous';

-- Grant select on all columns of entries to anon and authenticated
GRANT SELECT ON public.entries TO anon, authenticated;

-- Optional: index author column for search performance
CREATE INDEX IF NOT EXISTS entries_author_idx ON public.entries (author);
