import { query } from "../../server/db.js"
import { getEntry } from "../../server/entries.js"
import { json, serverError } from "../../server/http.js"

export async function GET(request: Request): Promise<Response> {
  const id = decodeURIComponent(
    new URL(request.url).pathname.split("/").pop() ?? "",
  )

  try {
    const entry = await getEntry(query, id)
    return entry ? json(200, entry) : json(404, { error: "Entry not found." })
  } catch (error) {
    console.error("Entry fetch failed", (error as Error).message)
    return serverError()
  }
}
