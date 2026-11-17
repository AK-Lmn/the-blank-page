import pg from "pg"
import type { Query } from "./entries.js"

let pool: pg.Pool | undefined

export function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function getPool(): pg.Pool {
  if (!pool) {
    // Pooled Neon connection string. Keep max small: each function instance
    // holds its own pool.
    pool = new pg.Pool({
      connectionString: requiredEnv("DATABASE_URL"),
      max: 3,
    })
    // An idle client dropped by Neon's pooler must not crash the instance.
    pool.on("error", (error) =>
      console.error("Idle Postgres client error", error.message),
    )
  }
  return pool
}

export const query: Query = (text, values) => getPool().query(text, values)
