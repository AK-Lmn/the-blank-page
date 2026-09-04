import { supabase } from "./supabase"
import type { Entry, PublicEntryRow } from "../types"

const publicEntryColumns = "public_id, title, message, author, created_at"

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

export async function submitEntry(
  title: string,
  message: string,
  author = "",
  website = "",
): Promise<Entry> {
  const payload: Record<string, string> = { title, message }
  if (author.trim()) payload.author = author.trim()
  if (website) payload.website = website
  const { data, error } = await supabase.functions.invoke("submit-entry", {
    body: payload,
  })

  if (error) {
    const status =
      error.context instanceof Response ? error.context.status : undefined
    console.error("Entry submission request failed")
    throw new EntrySubmissionError(status)
  }

  return toEntry(data as PublicEntryRow, true)
}

export async function fetchEntries(): Promise<Entry[]> {
  const { data, error } = await supabase
    .from("entries")
    .select(publicEntryColumns)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Supabase fetch error:", error)
    throw error
  }

  return ((data ?? []) as PublicEntryRow[]).map((row) => toEntry(row))
}

export async function getPublicEntry(publicId: string): Promise<Entry | null> {
  const { data, error } = await supabase
    .from("entries")
    .select(publicEntryColumns)
    .eq("public_id", publicId)
    .maybeSingle()

  if (error) {
    console.error("Supabase entry fetch error:", error)
    throw error
  }
  if (!data) return null

  return toEntry(data as PublicEntryRow)
}

export async function searchEntries(query: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from("entries")
    .select(publicEntryColumns)
    .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Supabase search error:", error)
    throw error
  }

  return ((data ?? []) as PublicEntryRow[]).map((row) => toEntry(row))
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
