import { afterEach, describe, expect, it, vi } from "vitest"
import { checkRateLimit } from "./rate-limit.ts"

const config = { redisUrl: "https://redis.example", redisToken: "token", hashSecret: "long-random-secret" }
const request = new Request("https://function.example", { headers: { "x-forwarded-for": "203.0.113.8" } })

function redisResponse(results: unknown[]) {
  return new Response(JSON.stringify(results.map((result) => ({ result }))), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

describe("submission rate limiter", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("allows traffic within all three limits and records a short duplicate key", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(redisResponse([1, 1, 1, 1, 1, 1]))
      .mockResolvedValueOnce(redisResponse(["OK"]))
    vi.stubGlobal("fetch", fetchMock)

    await expect(checkRateLimit(request, "title\nmessage", config)).resolves.toEqual({ allowed: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("203.0.113.8")
  })

  it("enforces the minute limit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(redisResponse([3, 1, 1, 1, 1, 1])))
    await expect(checkRateLimit(request, "title\nmessage", config)).resolves.toEqual({ allowed: false, retryAfterSeconds: 60 })
  })

  it("enforces the hourly and daily safety caps", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(redisResponse([1, 1, 11, 1, 1, 1]))
      .mockResolvedValueOnce(redisResponse([1, 1, 1, 1, 31, 1]))
    vi.stubGlobal("fetch", fetchMock)
    await expect(checkRateLimit(request, "first", config)).resolves.toEqual({ allowed: false, retryAfterSeconds: 3600 })
    await expect(checkRateLimit(request, "second", config)).resolves.toEqual({ allowed: false, retryAfterSeconds: 86400 })
  })

  it("rejects a duplicate within the cooldown", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(redisResponse([1, 1, 1, 1, 1, 1]))
      .mockResolvedValueOnce(redisResponse([null]))
    vi.stubGlobal("fetch", fetchMock)
    await expect(checkRateLimit(request, "same content", config)).resolves.toEqual({ allowed: false, retryAfterSeconds: 300 })
  })
})
