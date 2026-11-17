#!/usr/bin/env bash
# One-off move of public.entries from Supabase to Neon using psql only.
#
#   bash scripts/migrate-from-supabase.sh inspect   # print Supabase schema for review
#   bash scripts/migrate-from-supabase.sh copy      # apply db/schema.sql on Neon, copy rows, compare counts
#   bash scripts/migrate-from-supabase.sh verify    # compare row counts and a content checksum
#
# Needs .env.migrate (git-ignored) with:
#   SUPABASE_DB_URL=postgresql://...   (Supabase "Session pooler" connection string)
# The Neon URL comes from the linked project via `neon connection-string`.
# Connection strings are never echoed.
set -euo pipefail

cd "$(dirname "$0")/.."
[[ -f .env.migrate ]] || { echo "Missing .env.migrate with SUPABASE_DB_URL" >&2; exit 1; }
set -a; source .env.migrate; set +a
: "${SUPABASE_DB_URL:?SUPABASE_DB_URL not set in .env.migrate}"

# Percent-encode the password so characters like @ : / # in it don't break
# URL parsing. Splits user info at the last @ before the host.
SUPABASE_DB_URL="$(python -c '
import sys, urllib.parse as u
url = sys.argv[1]
scheme, rest = url.split("://", 1)
userinfo, hostpart = rest.rsplit("@", 1)
user, _, pw = userinfo.partition(":")
pw = u.quote(u.unquote(pw), safe="")
print(f"{scheme}://{user}:{pw}@{hostpart}")
' "$SUPABASE_DB_URL")"

PSQL=(psql -X -v ON_ERROR_STOP=1 -q)

inspect() {
  "${PSQL[@]}" "$SUPABASE_DB_URL" <<'SQL'
\echo '== tables in public'
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1;
\echo '== entries columns'
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entries'
ORDER BY ordinal_position;
\echo '== constraints'
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.entries'::regclass;
\echo '== indexes'
SELECT indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'entries';
\echo '== triggers'
SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger WHERE tgrelid = 'public.entries'::regclass AND NOT tgisinternal;
\echo '== policies'
SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename = 'entries';
\echo '== row count'
SELECT count(*) FROM public.entries;
SQL
}

copy() {
  local neon_url dump
  neon_url="$(neon connection-string)"
  dump="$(mktemp)"
  trap "rm -f '$dump'" EXIT
  # Native Windows psql resolves /tmp differently from Git Bash; hand it a
  # path both agree on.
  command -v cygpath >/dev/null && dump="$(cygpath -m "$dump")"

  "${PSQL[@]}" "$neon_url" -f db/schema.sql
  "${PSQL[@]}" "$SUPABASE_DB_URL" \
    -c "\\copy (SELECT id, public_id, title, message, created_at, is_hidden, author FROM public.entries ORDER BY created_at) TO '$dump' WITH (FORMAT csv)"
  "${PSQL[@]}" "$neon_url" -v ON_ERROR_STOP=1 <<SQL
BEGIN;
TRUNCATE public.entries;
\\copy public.entries (id, public_id, title, message, created_at, is_hidden, author) FROM '$dump' WITH (FORMAT csv)
COMMIT;
SQL

  local src dst
  src="$("${PSQL[@]}" -tA "$SUPABASE_DB_URL" -c 'SELECT count(*) FROM public.entries')"
  dst="$("${PSQL[@]}" -tA "$neon_url" -c 'SELECT count(*) FROM public.entries')"
  echo "rows: supabase=$src neon=$dst"
  [[ "$src" == "$dst" ]] || { echo "Row counts differ" >&2; exit 1; }
}

verify() {
  local neon_url sql src dst
  neon_url="$(neon connection-string)"
  sql="SELECT count(*) || ':' || count(*) FILTER (WHERE NOT is_hidden) || ':' ||
       md5(string_agg(concat_ws('|', id, public_id, title, message,
         to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US'), is_hidden, author), E'\n' ORDER BY id))
       FROM public.entries"
  src="$("${PSQL[@]}" -tA "$SUPABASE_DB_URL" -c "$sql")"
  dst="$("${PSQL[@]}" -tA "$neon_url" -c "$sql")"
  echo "supabase total:visible:md5 = $src"
  echo "neon     total:visible:md5 = $dst"
  [[ "$src" == "$dst" ]] && echo "MATCH" || { echo "MISMATCH" >&2; exit 1; }
}

case "${1:-}" in
  inspect) inspect ;;
  copy) copy ;;
  verify) verify ;;
  *) echo "usage: $0 inspect|copy|verify" >&2; exit 2 ;;
esac
