import { handleSubmitEntry } from "../../server/core.js"
import { query, requiredEnv } from "../../server/db.js"
import {
  insertEntry,
  listEntries,
  MAX_SEARCH_LENGTH,
  searchEntries,
} from "../../server/entries.js"
import { json, serverError } from "../../server/http.js"
import { checkRateLimit } from "../../server/rate-limit.js"

export async function GET(request: Request): Promise<Response> {
  const term = new URL(request.url).searchParams.get("q")?.trim() ?? ""
  if (term.length > MAX_SEARCH_LENGTH)
    return json(400, { error: "Please shorten your search." })

  try {
    return json(
      200,
      term ? await searchEntries(query, term) : await listEntries(query),
    )
  } catch (error) {
    console.error("Entry list failed", (error as Error).message)
    return serverError()
  }
}

function submit(request: Request): Promise<Response> {
  const rateLimitConfig = {
    redisUrl: requiredEnv("UPSTASH_REDIS_REST_URL"),
    redisToken: requiredEnv("UPSTASH_REDIS_REST_TOKEN"),
    hashSecret: requiredEnv("RATE_LIMIT_HASH_SECRET"),
  }

  return handleSubmitEntry(request, {
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    checkAbuse: (incomingRequest, normalizedContent) =>
      checkRateLimit(incomingRequest, normalizedContent, rateLimitConfig),
    insertEntry: (title, message, author) =>
      insertEntry(query, title, message, author),
    log: (event) => console.log(JSON.stringify({ event })),
  })
}

export const POST = submit
export const OPTIONS = submit
