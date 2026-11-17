# The Blank Page

**Let out what you feel**

A quiet public space for writing without accounts, profiles, or social metrics.

## Features

* Anonymous writing
* No accounts or profiles
* No reactions, comments, or social metrics
* Responsive React + Tailwind interface
* Public entries stored in Neon Postgres
* Local 7-day submission history using `localStorage`

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Neon Postgres
* Vercel Functions

## Local Development

```bash
npm install
neon env pull        # writes DATABASE_URL for the linked Neon branch
vercel dev           # serves the Vite app and the /api functions together
```

`npm run dev` runs the frontend alone; `/api` requests need `vercel dev`.
Copy `.env.example` for the other variables.

## Project Structure

```txt
api/entries/         Vercel Functions: GET/POST /api/entries, GET /api/entries/:id
server/              Validation, rate limiting, and SQL used by the functions
src/
├── components/
├── lib/
├── pages/
├── App.tsx
├── main.tsx
└── types.ts
```

## Data Architecture

Public entries are stored in Neon Postgres. PostgreSQL generates each entry's
`public_id`, which is the only identifier used in public URLs and local history.
The browser submits only the entry title, message, and optional pen name.

The browser never talks to the database. Vercel Functions under `/api` run
fixed, parameterized queries that return only public columns, so there is no
public path to update, delete, or read internal columns. The submit endpoint
validates payloads, applies short-lived rate limits and duplicate protection,
and inserts only the title, message, and pen name. A local copy of a writer's
recent submissions is retained in their current browser for 7 days; clearing
that history does not delete the public entry.

```txt
Public reads: Browser -> GET /api/entries -> Neon
Writes:       Browser -> POST /api/entries -> validation/rate limit -> Neon
```

The rate limiter uses ephemeral Redis keys and does not store raw IP addresses.
The app has no accounts, profiles, reactions, comments, or social metrics.
Moderation tooling is not yet implemented in this repository.

## Verification

```bash
npx tsc --noEmit
npm run build
npm test
```
