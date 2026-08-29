import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router"
import EntryCard from "../components/EntryCard"
import { fetchEntries } from "../lib/api"
import { getHistory } from "../lib/history"
import type { Entry } from "../types"

function mergeEntries(publicEntries: Entry[], localEntries: Entry[]): Entry[] {
  const byPublicId = new Map(publicEntries.map((entry) => [entry.id, entry]))
  for (const entry of localEntries) byPublicId.set(entry.id, entry)

  return [...byPublicId.values()]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3)
}
export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadEntries = useCallback(async () => {
    const localEntries = getHistory()
    setLoading(true)
    setError(false)
    try {
      const publicEntries = await fetchEntries()
      setEntries(mergeEntries(publicEntries, localEntries))
    } catch {
      setEntries(localEntries.slice(0, 3))
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEntries()
  }, [loadEntries])

  return (
    <section className="mx-auto w-full max-w-[760px] pb-16 pt-14 sm:pb-24 sm:pt-24">
      <div className="rounded-[28px] border border-[#d0c6d2] bg-[#f3f1f4] px-7 py-10 shadow-[0_18px_55px_rgba(60,79,93,0.08)] sm:px-12 sm:py-14">
        <p className="mb-7 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e]">
          A place without an audience
        </p>
        <h1 className="font-display max-w-[550px] text-5xl leading-[0.98] tracking-[-0.055em] text-[#141a1f] sm:text-7xl">
          Let out what
          <br />
          you feel.
        </h1>
        <p className="mt-7 max-w-md text-[1.05rem] leading-7 text-[#596773]">
          Leave a public thought here without an account or name attached. No
          profiles, no replies, no social metrics.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/write"
            className="inline-flex items-center gap-3 rounded-full bg-[#2f556a] px-6 py-3.5 text-sm font-semibold text-[#edf4f7] shadow-[0_10px_24px_rgba(47,85,106,0.18)] transition hover:-translate-y-0.5 hover:bg-[#203946] focus:outline-none focus:ring-2 focus:ring-[#72a5c0] focus:ring-offset-2"
          >
            Say something <span aria-hidden="true">→</span>
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-3 rounded-full border border-[#c5ccd3] bg-white/70 px-6 py-3.5 text-sm font-semibold text-[#2f556a] transition hover:-translate-y-0.5 hover:border-[#8c9aa6] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0] focus:ring-offset-2"
          >
            Search entries <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="mt-16">
        <div className="mb-5 flex items-baseline justify-between border-b border-[#c5ccd3] pb-3">
          <h2 className="font-display text-2xl tracking-[-0.03em] text-[#28343e]">
            A few pages left open
          </h2>
          <span className="text-xs text-[#6f8190]">Anonymous</span>
        </div>
        {loading && (
          <div
            role="status"
            className="rounded-[20px] border border-dashed border-[#c5ccd3] bg-white/30 px-7 py-10 text-center text-sm text-[#6f8190]"
          >
            Opening a few pages…
          </div>
        )}
        {!loading && error && (
          <div
            role="alert"
            className="mb-3 rounded-[20px] border border-[#d0c6d2] bg-[#f3f1f4] px-6 py-5 text-center"
          >
            <p className="text-sm text-[#6f4f70]">
              Public entries could not be loaded just now.
            </p>
            <button
              type="button"
              onClick={() => void loadEntries()}
              className="mt-3 text-sm font-medium text-[#2f556a] underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} local={entry.local} />
            ))}
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#c5ccd3] bg-white/30 px-7 py-10 text-center">
            <p className="font-display text-2xl text-[#3c4f5d]">
              The page is quiet for now.
            </p>
            <Link
              to="/write"
              className="mt-4 inline-block text-sm font-medium text-[#2f556a] underline underline-offset-4"
            >
              Leave the first thought
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
