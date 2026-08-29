import { describe, expect, it, vi } from "vitest"
import {
  handleSubmitEntry,
  MAX_BODY_BYTES,
  type SubmitEntryDependencies,
} from "./core.ts"

const validRow = {
  public_id: "public-id",
  title: "Title",
  message: "Message",
  created_at: "2026-01-01T00:00:00Z",
}

function deps(
  overrides: Partial<SubmitEntryDependencies> = {},
): SubmitEntryDependencies {
  return {
    allowedOrigins: ["https://example.com"],
    checkAbuse: vi.fn().mockResolvedValue({ allowed: true }),
    insertEntry: vi.fn().mockResolvedValue(validRow),
    log: vi.fn(),
    ...overrides,
  }
}

function request(body: unknown, options: RequestInit = {}) {
  return new Request("https://function.example/submit-entry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://example.com",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...options,
  })
}

describe("submit-entry handler", () => {
  it("returns 405 for GET", async () => {
    const response = await handleSubmitEntry(
      new Request("https://function.example", { method: "GET" }),
      deps(),
    )
    expect(response.status).toBe(405)
  })

  it("returns 400 for malformed JSON", async () => {
    expect((await handleSubmitEntry(request("{"), deps())).status).toBe(400)
  })

  it("returns 413 for an oversized body", async () => {
    expect(
      (await handleSubmitEntry(request("x".repeat(MAX_BODY_BYTES + 1)), deps()))
        .status,
    ).toBe(413)
  })

  it.each([
    [{ message: "Message" }, "missing title"],
    [{ title: "Title" }, "missing message"],
    [{ title: "", message: "Message" }, "empty title"],
    [{ title: "Title", message: "" }, "empty message"],
    [{ title: " ", message: "Message" }, "whitespace title"],
    [{ title: "Title", message: "   " }, "whitespace message"],
    [{ title: "a".repeat(91), message: "Message" }, "long title"],
    [{ title: "Title", message: "a".repeat(1401) }, "long message"],
  ])("returns 400 for %s", async (payload) => {
    expect((await handleSubmitEntry(request(payload), deps())).status).toBe(400)
  })

  it("rejects a populated honeypot without inserting", async () => {
    const dependencies = deps()
    const response = await handleSubmitEntry(
      request({ title: "Title", message: "Message", website: "bot" }),
      dependencies,
    )
    expect(response.status).toBe(400)
    expect(dependencies.insertEntry).not.toHaveBeenCalled()
  })

  it("returns 429 when rate limited", async () => {
    const response = await handleSubmitEntry(
      request({ title: "Title", message: "Message" }),
      deps({
        checkAbuse: vi
          .fn()
          .mockResolvedValue({ allowed: false, retryAfterSeconds: 60 }),
      }),
    )
    expect(response.status).toBe(429)
    expect(response.headers.get("Retry-After")).toBe("60")
  })

  it("returns 429 for a rapid duplicate", async () => {
    const response = await handleSubmitEntry(
      request({ title: "Title", message: "Message" }),
      deps({
        checkAbuse: vi
          .fn()
          .mockResolvedValue({ allowed: false, retryAfterSeconds: 300 }),
      }),
    )
    expect(response.status).toBe(429)
  })

  it("inserts only trimmed title and message", async () => {
    const dependencies = deps()
    const response = await handleSubmitEntry(
      request({ title: "  Title  ", message: "  Message  " }),
      dependencies,
    )
    expect(response.status).toBe(201)
    expect(dependencies.insertEntry).toHaveBeenCalledWith("Title", "Message")
  })

  it("returns only public fields", async () => {
    const response = await handleSubmitEntry(
      request({ title: "Title", message: "Message" }),
      deps(),
    )
    expect(await response.json()).toEqual(validRow)
  })

  it("returns 500 without exposing insert errors", async () => {
    const response = await handleSubmitEntry(
      request({ title: "Title", message: "Message" }),
      deps({
        insertEntry: vi
          .fn()
          .mockRejectedValue(new Error("secret database error")),
      }),
    )
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain("secret database error")
  })
})
