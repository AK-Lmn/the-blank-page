import { beforeEach, describe, expect, it } from "vitest"
import {
  clearDraft,
  clearHistory,
  getDraft,
  getHistory,
  saveDraft,
  saveToHistory,
} from "./history"
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

  describe("drafts", () => {
    it("returns null when no draft exists", () => {
      expect(getDraft()).toBeNull()
    })

    it("saves and retrieves a draft", () => {
      saveDraft({ title: "My quiet thought", message: "Here is what I feel" })
      expect(getDraft()).toEqual({
        title: "My quiet thought",
        message: "Here is what I feel",
      })
    })

    it("clears draft if title and message are empty", () => {
      saveDraft({ title: "Title", message: "Message" })
      saveDraft({ title: "", message: "" })
      expect(getDraft()).toBeNull()
    })

    it("clears draft explicitly", () => {
      saveDraft({ title: "Draft", message: "Some thoughts" })
      clearDraft()
      expect(getDraft()).toBeNull()
    })
  })
})
