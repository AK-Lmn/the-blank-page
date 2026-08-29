import { beforeEach, describe, expect, it } from "vitest"
import { clearHistory, getHistory, saveToHistory } from "./history"
import type { Entry } from "../types"

const entry = (id: string, createdAt = new Date().toISOString()): Entry => ({
  id,
  title: id,
  message: "Message",
  createdAt,
  local: true,
})

describe("local history", () => {
  beforeEach(() => localStorage.clear())

  it("expires entries older than seven days", () => {
    saveToHistory(
      entry("old", new Date(Date.now() - 8 * 86_400_000).toISOString()),
    )
    expect(getHistory()).toEqual([])
  })

  it("deduplicates public IDs", () => {
    saveToHistory(entry("same"))
    saveToHistory({ ...entry("same"), title: "Newest" })
    expect(getHistory()).toHaveLength(1)
    expect(getHistory()[0]?.title).toBe("Newest")
  })

  it("clears local history", () => {
    saveToHistory(entry("one"))
    clearHistory()
    expect(getHistory()).toEqual([])
  })

  it("never performs a backend deletion", () => {
    saveToHistory(entry("one"))
    clearHistory()
    expect(localStorage.getItem("the-blank-page-history")).toBeNull()
  })
})
