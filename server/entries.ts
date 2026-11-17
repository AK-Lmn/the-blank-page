import type { PublicEntryRow } from "./core.js"

export type Query = (
  text: string,
  values?: unknown[],
) => Promise<{ rows: Record<string, unknown>[] }>

const COLUMNS = "public_id, title, message, author, created_at"
const FEED_LIMIT = 20
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const MAX_SEARCH_LENGTH = 100

function toRow(row: Record<string, unknown>): PublicEntryRow {
  const createdAt = row.created_at
  return {
    public_id: String(row.public_id),
    title: String(row.title),
    message: String(row.message),
    author: typeof row.author === "string" ? row.author : "Anonymous",
    created_at:
      createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
  }
}

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

export async function listEntries(query: Query): Promise<PublicEntryRow[]> {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM public.entries
     WHERE is_hidden = false
     ORDER BY created_at DESC LIMIT $1`,
    [FEED_LIMIT],
  )
  return rows.map(toRow)
}

export async function getEntry(
  query: Query,
  publicId: string,
): Promise<PublicEntryRow | null> {
  if (!UUID_PATTERN.test(publicId)) return null
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM public.entries
     WHERE public_id = $1 AND is_hidden = false`,
    [publicId],
  )
  return rows[0] ? toRow(rows[0]) : null
}

export async function searchEntries(
  query: Query,
  term: string,
): Promise<PublicEntryRow[]> {
  const pattern = `%${escapeLike(term)}%`
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM public.entries
     WHERE is_hidden = false AND (title ILIKE $1 OR author ILIKE $1)
     ORDER BY created_at DESC LIMIT $2`,
    [pattern, FEED_LIMIT],
  )
  return rows.map(toRow)
}

export async function insertEntry(
  query: Query,
  title: string,
  message: string,
  author: string,
): Promise<PublicEntryRow> {
  const { rows } = await query(
    `INSERT INTO public.entries (title, message, author)
     VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
    [title, message, author],
  )
  if (!rows[0]) throw new Error("insert-failed")
  return toRow(rows[0])
}
