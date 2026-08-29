import { useEffect, useRef, useState } from "react"
import EntryCard from "../components/EntryCard"
import SearchInput from "../components/SearchInput"
import { searchEntries } from "../lib/api"
import type { Entry } from "../types"

type SearchResult = {
  ok: true
  entries: Entry[]
} | { ok: false }

export async function loadSearchResults(
  query: string,
  search: (value: string) => Promise<Entry[]> = searchEntries,
): Promise<SearchResult> {
  try {
    return { ok: true, entries: await search(query) }
  } catch {
    return { ok: false }
  }
}

export default function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const requestSequence = useRef(0)
  const trimmedQuery = query.trim()
  const meaningfulQuery = trimmedQuery.replace(/[%_]/g, "").trim()
  const canSearch = meaningfulQuery.length >= 2

  useEffect(() => {
    const sequence = ++requestSequence.current
    if (!canSearch) {
      setResults([])
      setLoading(false)
      setFailed(false)
      return
    }

    setLoading(true)
    setFailed(false)
    const timer = window.setTimeout(() => {
      void loadSearchResults(trimmedQuery)
        .then((result) => {
          if (requestSequence.current !== sequence) return
          if (result.ok) setResults(result.entries)
          else {
            setResults([])
            setFailed(true)
          }
        })
        .finally(() => {
          if (requestSequence.current === sequence) setLoading(false)
        })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [canSearch, trimmedQuery])

  return (
    <section className="mx-auto w-full max-w-3xl pb-16 pt-10 sm:pb-24 sm:pt-20">
      <div className="text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e]">
          Search
        </p>
        <h1 className="font-display mt-3 text-5xl tracking-[-0.05em] text-[#141a1f] sm:text-6xl">
          Find a thought
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#596773] sm:text-lg">
          Search public entries by title. Only titles are searchable; the
          message body remains for reading, not discovery.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-2xl">
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
        />
      </div>
      <div className="mt-14">
        {!trimmedQuery && (
          <SearchPrompt message="Start typing to search public entries" />
        )}
        {trimmedQuery && !canSearch && (
          <SearchPrompt message="Enter at least two letters or numbers" />
        )}
        {canSearch && loading && (
          <div
            role="status"
            className="rounded-[24px] border border-dashed border-[#c5ccd3] bg-white/30 px-7 py-14 text-center"
          >
            <p className="font-display text-2xl text-[#3c4f5d]">Searching…</p>
          </div>
        )}
        {canSearch && !loading && failed && (
          <div
            role="alert"
            className="rounded-[24px] border border-[#d0c6d2] bg-[#f3f1f4] px-7 py-14 text-center"
          >
            <p className="font-display text-2xl text-[#3c4f5d]">
              Search is unavailable just now
            </p>
            <p className="mt-3 text-sm text-[#6f8190]">
              Please wait a moment and try again.
            </p>
          </div>
        )}
        {canSearch && !loading && !failed && results.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-[#c5ccd3] bg-white/30 px-7 py-14 text-center">
            <p className="font-display text-2xl text-[#3c4f5d]">
              No entries found
            </p>
            <p className="mt-3 text-sm text-[#6f8190]">
              Try a different title or a shorter phrase.
            </p>
          </div>
        )}
        {canSearch && !loading && !failed && results.length > 0 && (
          <div>
            <p className="mb-5 border-b border-[#c5ccd3] pb-3 text-xs font-medium uppercase tracking-[0.16em] text-[#6f8190]">
              Matching public entries
            </p>
            <div className="space-y-3">
              {results.map((entry) => (
                <EntryCard key={entry.id} entry={entry} showReadLink />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function SearchPrompt({ message }: { message: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#c5ccd3] bg-white/30 px-7 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3f1f4] text-[#8a718e]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <circle cx="11" cy="11" r="5.5" />
          <path d="m15.5 15.5 4 4" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-display mt-5 text-2xl text-[#3c4f5d]">{message}</p>
    </div>
  )
}
