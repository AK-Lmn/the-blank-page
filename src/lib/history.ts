import type { Entry } from "../types"

const storageKey = "the-blank-page-history"
const sevenDays = 7 * 24 * 60 * 60 * 1000

function isCurrent(entry: Entry): boolean {
  const createdAt = new Date(entry.createdAt).getTime()
  return Number.isFinite(createdAt) && Date.now() - createdAt < sevenDays
}

export function getHistory(): Entry[] {
  try {
    const saved = JSON.parse(
      localStorage.getItem(storageKey) ?? "[]",
    ) as Entry[]
    const current = saved.filter(isCurrent)
    if (current.length !== saved.length)
      localStorage.setItem(storageKey, JSON.stringify(current))
    return current
  } catch {
    return []
  }
}

export function saveToHistory(entry: Entry): Entry[] {
  const next = [entry, ...getHistory().filter((saved) => saved.id !== entry.id)]
  localStorage.setItem(storageKey, JSON.stringify(next))
  return next
}

export function findHistoryEntry(publicId: string): Entry | undefined {
  return getHistory().find((entry) => entry.id === publicId)
}

export function clearHistory(): void {
  localStorage.removeItem(storageKey)
}

const draftKey = "the-blank-page-draft"

export type Draft = {
  title: string
  message: string
  author?: string
}

export function saveDraft(draft: Draft): void {
  try {
    if (!draft.title && !draft.message && !draft.author) {
      clearDraft()
      return
    }
    localStorage.setItem(draftKey, JSON.stringify(draft))
  } catch {
    // Gracefully handle storage quota or private mode issues
  }
}

export function getDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Draft>
    if (
      typeof parsed?.title === "string" &&
      typeof parsed?.message === "string" &&
      (parsed.title.length > 0 ||
        parsed.message.length > 0 ||
        (typeof parsed?.author === "string" && parsed.author.length > 0))
    ) {
      return {
        title: parsed.title,
        message: parsed.message,
        author: typeof parsed.author === "string" ? parsed.author : "",
      }
    }
    return null
  } catch {
    return null
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(draftKey)
  } catch {
    // Gracefully handle storage issues
  }
}
