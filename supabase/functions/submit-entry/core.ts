export const MAX_BODY_BYTES = 16 * 1024

export type PublicEntryRow = {
  public_id: string
  title: string
  message: string
  author: string
  created_at: string
}

export type AbuseCheckResult = { allowed: true } | {
  allowed: false
  retryAfterSeconds: number
}

export type SubmitEntryDependencies = {
  allowedOrigins: string[]
  checkAbuse: (
    request: Request,
    normalizedContent: string,
  ) => Promise<AbuseCheckResult>
  insertEntry: (
    title: string,
    message: string,
    author: string,
  ) => Promise<PublicEntryRow>
  log: (event: string) => void
}

function corsHeaders(
  origin: string | null,
  allowedOrigins: string[],
): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  }

  if (origin && allowedOrigins.includes(origin))
    headers["Access-Control-Allow-Origin"] = origin
  return headers
}

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  cors: HeadersInit,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...cors,
      ...extraHeaders,
    },
  })
}

async function readLimitedBody(request: Request): Promise<string> {
  const declaredLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES)
    throw new Error("too-large")
  if (!request.body) return ""

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let total = 0
  let body = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_BODY_BYTES) {
      await reader.cancel()
      throw new Error("too-large")
    }
    body += decoder.decode(value, { stream: true })
  }

  return body + decoder.decode()
}

export async function handleSubmitEntry(
  request: Request,
  deps: SubmitEntryDependencies,
): Promise<Response> {
  const origin = request.headers.get("origin")
  const cors = corsHeaders(origin, deps.allowedOrigins)

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors })
  if (request.method !== "POST") {
    return jsonResponse(
      405,
      { error: "This endpoint only accepts submissions." },
      cors,
      { Allow: "POST, OPTIONS" },
    )
  }
  if (origin && !deps.allowedOrigins.includes(origin)) {
    deps.log("origin_rejected")
    return jsonResponse(
      403,
      { error: "This submission could not be accepted." },
      cors,
    )
  }

  let rawBody: string
  try {
    rawBody = await readLimitedBody(request)
  } catch {
    deps.log("request_too_large")
    return jsonResponse(
      413,
      { error: "This entry is too large to submit." },
      cors,
    )
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return jsonResponse(
      400,
      { error: "This submission could not be read." },
      cors,
    )
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse(
      400,
      { error: "Please check your entry and try again." },
      cors,
    )
  }

  const record = payload as Record<string, unknown>
  const allowedKeys = new Set(["title", "message", "author", "website"])
  if (Object.keys(record).some((key) => !allowedKeys.has(key))) {
    return jsonResponse(
      400,
      { error: "Please check your entry and try again." },
      cors,
    )
  }
  if (typeof record.website === "string" && record.website.trim()) {
    deps.log("honeypot_rejected")
    return jsonResponse(
      400,
      { error: "This submission could not be accepted." },
      cors,
    )
  }
  if (record.website !== undefined && typeof record.website !== "string") {
    return jsonResponse(
      400,
      { error: "Please check your entry and try again." },
      cors,
    )
  }
  if (typeof record.title !== "string" || typeof record.message !== "string") {
    return jsonResponse(
      400,
      { error: "Please add both a title and a message." },
      cors,
    )
  }

  let author = "Anonymous"
  if (typeof record.author === "string") {
    const trimmedAuthor = record.author.trim()
    if (trimmedAuthor.length > 30) {
      return jsonResponse(
        400,
        { error: "Please keep your pen name within 30 characters." },
        cors,
      )
    }
    if (trimmedAuthor.length > 0) {
      author = trimmedAuthor
    }
  } else if (record.author !== undefined && record.author !== null) {
    return jsonResponse(
      400,
      { error: "Please check your pen name and try again." },
      cors,
    )
  }

  const title = record.title.trim()
  const message = record.message.trim()
  if (!title || title.length > 90 || !message || message.length > 1400) {
    return jsonResponse(
      400,
      { error: "Please check the length of your title and message." },
      cors,
    )
  }

  const normalizedContent = `${title.toLocaleLowerCase()}\n${message.toLocaleLowerCase().replace(/\s+/g, " ")}`
  let abuseCheck: AbuseCheckResult
  try {
    abuseCheck = await deps.checkAbuse(request, normalizedContent)
  } catch {
    deps.log("rate_limit_backend_error")
    return jsonResponse(
      500,
      { error: "Something went wrong while publishing. Please try again." },
      cors,
    )
  }

  if (abuseCheck.allowed === false) {
    deps.log("submission_rate_limited")
    return jsonResponse(
      429,
      { error: "Please wait a little before submitting again." },
      cors,
      { "Retry-After": String(abuseCheck.retryAfterSeconds) },
    )
  }

  try {
    const entry = await deps.insertEntry(title, message, author)
    deps.log("submission_created")
    return jsonResponse(201, entry, cors)
  } catch {
    deps.log("database_insert_error")
    return jsonResponse(
      500,
      { error: "Something went wrong while publishing. Please try again." },
      cors,
    )
  }
}
