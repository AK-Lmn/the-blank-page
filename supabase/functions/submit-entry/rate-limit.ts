import type { AbuseCheckResult } from "./core.ts"

type RedisResult = { result?: unknown; error?: string }

export type RateLimitConfig = {
  redisUrl: string
  redisToken: string
  hashSecret: string
}

function clientIp(request: Request): string {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim()
  return forwarded || "unknown"
}

async function hmac(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value))
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")
}

async function redisPipeline(
  config: RateLimitConfig,
  commands: unknown[][],
): Promise<RedisResult[]> {
  const response = await fetch(
    `${config.redisUrl.replace(/\/$/, "")}/pipeline`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    },
  )
  if (!response.ok) throw new Error("redis-request-failed")
  const results = (await response.json()) as RedisResult[]
  if (!Array.isArray(results) || results.some((item) => item.error))
    throw new Error("redis-command-failed")
  return results
}

export async function checkRateLimit(
  request: Request,
  normalizedContent: string,
  config: RateLimitConfig,
): Promise<AbuseCheckResult> {
  const identity = await hmac(clientIp(request), config.hashSecret)
  const prefix = `tbp:submit:${identity}`
  const results = await redisPipeline(config, [
    ["INCR", `${prefix}:minute`],
    ["EXPIRE", `${prefix}:minute`, 60, "NX"],
    ["INCR", `${prefix}:hour`],
    ["EXPIRE", `${prefix}:hour`, 3600, "NX"],
    ["INCR", `${prefix}:day`],
    ["EXPIRE", `${prefix}:day`, 86400, "NX"],
  ])

  const minute = Number(results[0]?.result)
  const hour = Number(results[2]?.result)
  const day = Number(results[4]?.result)
  if (![minute, hour, day].every(Number.isFinite))
    throw new Error("invalid-rate-limit-response")
  if (day > 30) return { allowed: false, retryAfterSeconds: 86400 }
  if (hour > 10) return { allowed: false, retryAfterSeconds: 3600 }
  if (minute > 2) return { allowed: false, retryAfterSeconds: 60 }

  const contentHash = await hmac(normalizedContent, config.hashSecret)
  const duplicate = await redisPipeline(config, [
    ["SET", `${prefix}:duplicate:${contentHash}`, "1", "EX", 300, "NX"],
  ])
  if (duplicate[0]?.result !== "OK")
    return { allowed: false, retryAfterSeconds: 300 }

  return { allowed: true }
}
