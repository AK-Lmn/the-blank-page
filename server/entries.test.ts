import { describe, expect, it, vi } from "vitest"
import {
  escapeLike,
  getEntry,
  insertEntry,
  listEntries,
  searchEntries,
} from "./entries.ts"

const dbRow = {
  public_id: "6f1c2b9e-1d2a-4c3b-9e8f-0a1b2c3d4e5f",
  title: "Title",
  message: "Message",
  author: "Wanderer",
  created_at: new Date("2026-01-01T00:00:00Z"),
}

function queryReturning(rows: Record<string, unknown>[]) {
  return vi.fn().mockResolvedValue({ rows })
}

describe("entry queries", () => {
  it("lists the latest 20 entries with ISO timestamps", async () => {
    const query = queryReturning([dbRow])
    const rows = await listEntries(query)
    expect(query.mock.calls[0][0]).toMatch(/ORDER BY created_at DESC LIMIT \$1/)
    expect(query.mock.calls[0][1]).toEqual([20])
    expect(rows[0].created_at).toBe("2026-01-01T00:00:00.000Z")
  })

  it("skips the database for ids that are not UUIDs", async () => {
    const query = queryReturning([])
    await expect(getEntry(query, "not-a-uuid")).resolves.toBeNull()
    expect(query).not.toHaveBeenCalled()
  })

  it("fetches one entry by public_id", async () => {
    const query = queryReturning([dbRow])
    await expect(getEntry(query, dbRow.public_id)).resolves.toMatchObject({
      public_id: dbRow.public_id,
    })
    expect(query.mock.calls[0][1]).toEqual([dbRow.public_id])
  })

  it("escapes LIKE wildcards in search terms", async () => {
    expect(escapeLike("50%_off\\")).toBe("50\\%\\_off\\\\")
    const query = queryReturning([])
    await searchEntries(query, "100%")
    expect(query.mock.calls[0][0]).toMatch(
      /title ILIKE \$1 OR author ILIKE \$1/,
    )
    expect(query.mock.calls[0][1]).toEqual(["%100\\%%", 20])
  })

  it("passes insert values as parameters", async () => {
    const query = queryReturning([dbRow])
    await insertEntry(query, "T'); DROP TABLE x;--", "M", "A")
    expect(query.mock.calls[0][1]).toEqual(["T'); DROP TABLE x;--", "M", "A"])
  })

  it.each([
    ["list", (query: ReturnType<typeof queryReturning>) => listEntries(query)],
    [
      "get",
      (query: ReturnType<typeof queryReturning>) =>
        getEntry(query, dbRow.public_id),
    ],
    [
      "search",
      (query: ReturnType<typeof queryReturning>) =>
        searchEntries(query, "quiet"),
    ],
  ])("%s never returns hidden entries", async (_name, run) => {
    const query = queryReturning([])
    await run(query)
    expect(query.mock.calls[0][0]).toMatch(/is_hidden = false/)
  })

  it("fails when insert returns no row", async () => {
    await expect(
      insertEntry(queryReturning([]), "T", "M", "A"),
    ).rejects.toThrow("insert-failed")
  })
})
