import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  invoke: vi.fn(),
}))

vi.mock("./supabase", () => ({
  supabase: { from: mocks.from, functions: { invoke: mocks.invoke } },
}))

import {
  fetchEntries,
  fetchRandomEntry,
  getPublicEntry,
  searchEntries,
  submitEntry,
} from "./api"

const row = {
  public_id: "public-123",
  title: "Title",
  message: "Message",
  created_at: "2026-01-01T00:00:00Z",
}

const row2 = {
  public_id: "public-456",
  title: "Second Title",
  message: "Second Message",
  created_at: "2026-01-02T00:00:00Z",
}

describe("entry API", () => {
  beforeEach(() => {
    mocks.from.mockReset()
    mocks.invoke.mockReset()
  })

  it("submits only title and message through the Edge Function", async () => {
    mocks.invoke.mockResolvedValue({ data: row, error: null })
    await submitEntry("Title", "Message")
    expect(mocks.invoke).toHaveBeenCalledWith("submit-entry", {
      body: { title: "Title", message: "Message" },
    })
  })

  it("maps public_id to the frontend id", async () => {
    mocks.invoke.mockResolvedValue({ data: row, error: null })
    await expect(submitEntry("Title", "Message")).resolves.toMatchObject({
      id: "public-123",
      local: true,
    })
  })

  it("surfaces function errors", async () => {
    mocks.invoke.mockResolvedValue({
      data: null,
      error: { context: new Response(null, { status: 429 }) },
    })
    await expect(submitEntry("Title", "Message")).rejects.toMatchObject({
      status: 429,
    })
  })

  it("selects only public fields for the feed", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [row], error: null })
    const order = vi.fn(() => ({ limit }))
    const select = vi.fn(() => ({ order }))
    mocks.from.mockReturnValue({ select })
    await fetchEntries()
    expect(select).toHaveBeenCalledWith("public_id, title, message, created_at")
  })

  it("queries detail only by public_id", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null })
    const eq = vi.fn(() => ({ maybeSingle }))
    const select = vi.fn(() => ({ eq }))
    mocks.from.mockReturnValue({ select })
    await getPublicEntry("public-123")
    expect(eq).toHaveBeenCalledWith("public_id", "public-123")
  })

  it("keeps title search limited and public-column only", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [row], error: null })
    const order = vi.fn(() => ({ limit }))
    const ilike = vi.fn(() => ({ order }))
    const select = vi.fn(() => ({ ilike }))
    mocks.from.mockReturnValue({ select })
    await searchEntries("quiet")
    expect(select).toHaveBeenCalledWith("public_id, title, message, created_at")
    expect(ilike).toHaveBeenCalledWith("title", "%quiet%")
    expect(limit).toHaveBeenCalledWith(20)
  })

  describe("fetchRandomEntry", () => {
    it("returns a random entry from the fetched list", async () => {
      const limit = vi
        .fn()
        .mockResolvedValue({ data: [row, row2], error: null })
      const order = vi.fn(() => ({ limit }))
      const select = vi.fn(() => ({ order }))
      mocks.from.mockReturnValue({ select })
      const random = await fetchRandomEntry()
      expect(["public-123", "public-456"]).toContain(random?.id)
    })

    it("excludes the specified ID", async () => {
      const limit = vi
        .fn()
        .mockResolvedValue({ data: [row, row2], error: null })
      const order = vi.fn(() => ({ limit }))
      const select = vi.fn(() => ({ order }))
      mocks.from.mockReturnValue({ select })
      const random = await fetchRandomEntry("public-123")
      expect(random?.id).toBe("public-456")
    })

    it("returns null if no candidates are available", async () => {
      const limit = vi.fn().mockResolvedValue({ data: [row], error: null })
      const order = vi.fn(() => ({ limit }))
      const select = vi.fn(() => ({ order }))
      mocks.from.mockReturnValue({ select })
      const random = await fetchRandomEntry("public-123")
      expect(random).toBeNull()
    })
  })
})
