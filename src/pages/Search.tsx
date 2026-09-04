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
        <h1 className="font-display text-5xl tracking-[-0.05em] text-[#141a1f] dark:text-[#f0f6fc] sm:text-6xl">
          Find a thought
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#596773] dark:text-[#8b949e] sm:text-lg">
          Search by title or pen name. Messages aren't searchable.
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
        {trimmedQuery && !canSearch && (
          <p className="py-10 text-center text-sm text-[#6f8190] dark:text-[#8b949e]">
            Enter at least two letters or numbers
          </p>
        )}
        {canSearch && loading && (
          <div
            role="status"
            className="rounded-[24px] border border-dashed border-white/60 dark:border-white/15 bg-white/40 dark:bg-white/5 backdrop-blur-md px-7 py-12 text-center"
          >
            <p className="font-display text-2xl text-[#3c4f5d] dark:text-[#f0f6fc]">
              Searching…
            </p>
          </div>
        )}
        {canSearch && !loading && failed && (
          <div
            role="alert"
            className="rounded-[24px] border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-xl px-7 py-12 text-center shadow-[0_8px_24px_rgba(60,79,93,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
          >
            <p className="font-display text-2xl text-[#3c4f5d] dark:text-[#f0f6fc]">
              Search is unavailable just now
            </p>
            <p className="mt-2 text-sm text-[#6f8190] dark:text-[#8b949e]">
              Please wait a moment and try again.
            </p>
          </div>
        )}
        {canSearch && !loading && !failed && results.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-white/60 dark:border-white/15 bg-white/40 dark:bg-white/5 backdrop-blur-md px-7 py-12 text-center">
            <p className="font-display text-2xl text-[#3c4f5d] dark:text-[#f0f6fc]">
              No entries found
            </p>
            <p className="mt-2 text-sm text-[#6f8190] dark:text-[#8b949e]">
              Try a different title or a shorter phrase.
            </p>
          </div>
        )}
        {canSearch && !loading && !failed && results.length > 0 && (
          <div>
            <p className="mb-5 border-b border-[#c5ccd3]/50 dark:border-white/10 pb-3 text-xs font-medium uppercase tracking-[0.16em] text-[#6f8190] dark:text-[#8b949e]">
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
