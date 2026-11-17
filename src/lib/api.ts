import type { Entry, PublicEntryRow } from "../types"

const ENTRIES_URL = "/api/entries"

function toEntry(row: PublicEntryRow, local = false): Entry {
  return {
    id: row.public_id,
    title: row.title,
    message: row.message,
    author: row.author || "Anonymous",
    createdAt: row.created_at,
    ...(local ? { local: true } : {}),
  }
}

export class EntrySubmissionError extends Error {
  constructor(public readonly status?: number) {
    super("Entry submission failed")
  }
}

export class EntryRequestError extends Error {
  constructor(public readonly status: number) {
    super(`Entry request failed with status ${status}`)
  }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } })
  if (!response.ok) throw new EntryRequestError(response.status)
  return (await response.json()) as T
}

export async function submitEntry(
  title: string,
  message: string,
  author = "",
  website = "",
): Promise<Entry> {
  const payload: Record<string, string> = { title, message }
  if (author.trim()) payload.author = author.trim()
  if (website) payload.website = website

  let response: Response
  try {
    response = await fetch(ENTRIES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch {
    console.error("Entry submission request failed")
    throw new EntrySubmissionError()
  }

  if (!response.ok) {
    console.error("Entry submission request failed")
    throw new EntrySubmissionError(response.status)
  }

  return toEntry((await response.json()) as PublicEntryRow, true)
}

export async function fetchEntries(): Promise<Entry[]> {
  const rows = await getJson<PublicEntryRow[]>(ENTRIES_URL)
  return rows.map((row) => toEntry(row))
}

export async function getPublicEntry(publicId: string): Promise<Entry | null> {
  try {
    return toEntry(
      await getJson<PublicEntryRow>(
        `${ENTRIES_URL}/${encodeURIComponent(publicId)}`,
      ),
    )
  } catch (error) {
    if (error instanceof EntryRequestError && error.status === 404) return null
    throw error
  }
}

export async function searchEntries(query: string): Promise<Entry[]> {
  const params = new URLSearchParams({ q: query })
  const rows = await getJson<PublicEntryRow[]>(`${ENTRIES_URL}?${params}`)
  return rows.map((row) => toEntry(row))
}

export async function fetchRandomEntry(
  excludeId?: string,
): Promise<Entry | null> {
  const entries = await fetchEntries()
  const candidates = excludeId
    ? entries.filter((entry) => entry.id !== excludeId)
    : entries
  if (candidates.length === 0) return null
  const randomIndex = Math.floor(Math.random() * candidates.length)
  return candidates[randomIndex] ?? null
}
