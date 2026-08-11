import type { Entry } from "../types"

const storageKey = "the-blank-page-history"
const sevenDays = 7 * 24 * 60 * 60 * 1000

function isCurrent(entry: Entry): boolean {
  const createdAt = new Date(entry.createdAt).getTime()
  return Number.isFinite(createdAt) && Date.now() - createdAt < sevenDays
}

export function getHistory(): Entry[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Entry[]
    const current = saved.filter(isCurrent)
    if (current.length !== saved.length) localStorage.setItem(storageKey, JSON.stringify(current))
    return current
  } catch {
    return []
  }
}

export function saveToHistory(entry: Entry): Entry[] {
  const next = [entry, ...getHistory()]
  localStorage.setItem(storageKey, JSON.stringify(next))
  return next
}

export function findHistoryEntry(id: string): Entry | undefined {
  return getHistory().find((entry) => entry.id === id)
}

export function clearHistory(): void {
  localStorage.removeItem(storageKey)
}
