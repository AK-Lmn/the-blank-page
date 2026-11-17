import { afterEach, describe, expect, it, vi } from "vitest"
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
  author: "Wanderer",
  created_at: "2026-01-01T00:00:00Z",
}

const row2 = {
  public_id: "public-456",
  title: "Second Title",
  message: "Second Message",
  author: "Anonymous",
  created_at: "2026-01-02T00:00:00Z",
}

function respond(status: number, body: unknown = null) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(body === null ? null : JSON.stringify(body), { status }),
    )
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("entry API", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("posts title and message to the entries endpoint", async () => {
    const fetchMock = respond(201, row)
    await submitEntry("Title", "Message")
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/entries")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body)).toEqual({
      title: "Title",
      message: "Message",
    })
  })

  it("includes author when provided", async () => {
    const fetchMock = respond(201, row)
    await submitEntry("Title", "Message", " Wanderer ")
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      title: "Title",
      message: "Message",
      author: "Wanderer",
    })
  })

  it("maps public_id and author to the frontend entry", async () => {
    respond(201, row)
    await expect(
      submitEntry("Title", "Message", "Wanderer"),
    ).resolves.toMatchObject({
      id: "public-123",
      author: "Wanderer",
      local: true,
    })
  })

  it("surfaces the status of a failed submission", async () => {
    respond(429, { error: "slow down" })
    await expect(submitEntry("Title", "Message")).rejects.toMatchObject({
      status: 429,
    })
  })

  it("loads the feed", async () => {
    const fetchMock = respond(200, [row, row2])
    const entries = await fetchEntries()
    expect(fetchMock.mock.calls[0][0]).toBe("/api/entries")
    expect(entries.map((entry) => entry.id)).toEqual([
      "public-123",
      "public-456",
    ])
  })

  it("throws when the feed fails", async () => {
    respond(500, { error: "boom" })
    await expect(fetchEntries()).rejects.toThrow()
  })

  it("loads one entry by encoded public id", async () => {
    const fetchMock = respond(200, row)
    await expect(getPublicEntry("public-123")).resolves.toMatchObject({
      id: "public-123",
    })
    expect(fetchMock.mock.calls[0][0]).toBe("/api/entries/public-123")
  })

  it("returns null for a missing entry", async () => {
    respond(404, { error: "Entry not found." })
    await expect(getPublicEntry("nope")).resolves.toBeNull()
  })

  it("sends the search term as a query parameter", async () => {
    const fetchMock = respond(200, [row])
    await searchEntries("quiet & calm")
    expect(fetchMock.mock.calls[0][0]).toBe("/api/entries?q=quiet+%26+calm")
  })

  describe("fetchRandomEntry", () => {
    it("returns a random entry from the fetched list", async () => {
      respond(200, [row, row2])
      const random = await fetchRandomEntry()
      expect(["public-123", "public-456"]).toContain(random?.id)
    })

    it("excludes the specified ID", async () => {
      respond(200, [row, row2])
      const random = await fetchRandomEntry("public-123")
      expect(random?.id).toBe("public-456")
    })

    it("returns null if no candidates are available", async () => {
      respond(200, [row])
      const random = await fetchRandomEntry("public-123")
      expect(random).toBeNull()
    })
  })
})
