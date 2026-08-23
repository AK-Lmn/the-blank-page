# The Blank Page

**Let out what you feel**

A quiet public space for writing without accounts, profiles, or social metrics.

## Features

* Anonymous writing
* No accounts or profiles
* No reactions, comments, or social metrics
* Responsive React + Tailwind interface
* Public entries stored in Supabase
* Local 7-day submission history using `localStorage`

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Supabase

## Local Development

```bash
npm install
npm run dev
```

## Project Structure

```txt
src/
├── components/
├── lib/
├── pages/
├── App.tsx
├── main.tsx
└── types.ts
```

## Data Architecture

Public entries are stored in Supabase. PostgreSQL generates each entry's
`public_id`, which is the only identifier used in public URLs and local history.
The browser submits only the entry title and message.

Row Level Security allows anonymous visitors to read visible entries and submit
new entries, while preventing public updates, deletes, and access to internal or
moderation columns. A local copy of a writer's recent submissions is retained in
their current browser for 7 days; clearing that history does not delete the
public entry.

Rate limiting and moderation systems are not yet implemented in this repository.
