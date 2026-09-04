import { createClient } from "npm:@supabase/supabase-js@2"
import { handleSubmitEntry, type PublicEntryRow } from "./core.ts"
import { checkRateLimit } from "./rate-limit.ts"

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const supabase = createClient(
  requiredEnv("SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const allowedOrigins = requiredEnv("ALLOWED_ORIGINS")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const rateLimitConfig = {
  redisUrl: requiredEnv("UPSTASH_REDIS_REST_URL"),
  redisToken: requiredEnv("UPSTASH_REDIS_REST_TOKEN"),
  hashSecret: requiredEnv("RATE_LIMIT_HASH_SECRET"),
}

Deno.serve((request) =>
  handleSubmitEntry(request, {
    allowedOrigins,
    checkAbuse: (incomingRequest, normalizedContent) =>
      checkRateLimit(incomingRequest, normalizedContent, rateLimitConfig),
    insertEntry: async (title, message, author) => {
      const { data, error } = await supabase
        .from("entries")
        .insert({ title, message, author })
        .select("public_id, title, message, author, created_at")
        .single()

      if (error || !data) throw new Error("insert-failed")
      return data as PublicEntryRow
    },
    log: (event) => console.log(JSON.stringify({ event })),
  }),
)
