import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  PenLine,
  RefreshCw,
  Shuffle,
} from "lucide-react"
import EntryCard from "../components/EntryCard"
import { fetchEntries, fetchRandomEntry } from "../lib/api"
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
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRandom, setLoadingRandom] = useState(false)
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

  async function handleRandomThought() {
    setLoadingRandom(true)
    try {
      const random = await fetchRandomEntry()
      if (random) {
        navigate(`/entry/${random.id}`)
      }
    } catch {
      // Keep user on home if fetch fails
    } finally {
      setLoadingRandom(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-[760px] pb-16 pt-14 sm:pb-24 sm:pt-24">
      <div className="rounded-[28px] border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-xl px-7 py-10 shadow-[0_18px_55px_rgba(60,79,93,0.06)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.4)] sm:px-12 sm:py-14">
        <p className="mb-7 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e] dark:text-[#d8b4e2]">
          A place without an audience
        </p>
        <h1 className="font-display max-w-[550px] text-5xl leading-[0.98] tracking-[-0.055em] text-[#141a1f] dark:text-[#f0f6fc] sm:text-7xl">
          Let out what
          <br />
          you feel.
        </h1>
        <p className="mt-7 max-w-md text-[1.05rem] leading-7 text-[#596773] dark:text-[#8b949e]">
          Leave a public thought here without an account or name attached. No
          profiles, no replies, no social metrics.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/write"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#2f556a] dark:bg-[#72a5c0] px-6 py-3.5 text-sm font-semibold text-[#edf4f7] dark:text-[#0c1015] shadow-[0_10px_24px_rgba(47,85,106,0.18)] dark:shadow-[0_10px_24px_rgba(114,165,192,0.25)] transition hover:-translate-y-0.5 hover:bg-[#203946] dark:hover:bg-[#8cc2dd] focus:outline-none focus:ring-2 focus:ring-[#72a5c0] focus:ring-offset-2"
          >
            <PenLine className="h-4 w-4" />
            <span>Say something</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-[#2f556a] dark:text-[#72a5c0] transition hover:-translate-y-0.5 hover:border-[#8c9aa6] hover:bg-white/90 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#72a5c0] focus:ring-offset-2"
          >
            <span>Search entries</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => void handleRandomThought()}
            disabled={loadingRandom}
            className="inline-flex items-center gap-2 rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-[#596773] dark:text-[#c9d1d9] transition hover:-translate-y-0.5 hover:border-[#8c9aa6] hover:bg-white/90 dark:hover:bg-white/20 hover:text-[#141a1f] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0] focus:ring-offset-2 disabled:opacity-60"
          >
            <Shuffle
              className={`h-4 w-4 ${loadingRandom ? "animate-spin" : ""}`}
            />
            <span>{loadingRandom ? "Opening…" : "Random thought"}</span>
          </button>
        </div>
      </div>
      <div className="mt-16">
        <div className="mb-5 flex items-baseline justify-between border-b border-[#c5ccd3]/50 dark:border-white/10 pb-3">
          <h2 className="font-display flex items-center gap-2 text-2xl tracking-[-0.03em] text-[#28343e] dark:text-[#f0f6fc]">
            <BookOpen className="h-5 w-5 text-[#8a718e] dark:text-[#d8b4e2]" />
            <span>A few pages left open</span>
          </h2>
          <span className="text-xs text-[#6f8190] dark:text-[#8b949e]">
            Anonymous
          </span>
        </div>
        {loading && (
          <div
            role="status"
            className="rounded-[20px] border border-dashed border-white/60 dark:border-white/15 bg-white/40 dark:bg-white/5 backdrop-blur-md px-7 py-10 text-center text-sm text-[#6f8190] dark:text-[#8b949e]"
          >
            Opening a few pages…
          </div>
        )}
        {!loading && error && (
          <div
            role="alert"
            className="mb-4 rounded-[22px] border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-md p-6 text-center shadow-[0_8px_24px_rgba(60,79,93,0.04)]"
          >
            <AlertCircle className="mx-auto h-6 w-6 text-[#8a718e] dark:text-[#d8b4e2]" />
            <p className="mt-2 text-sm text-[#6f4f70] dark:text-[#d8b4e2]">
              Public entries could not be loaded just now.
            </p>
            <button
              type="button"
              onClick={() => void loadEntries()}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#2f556a] dark:text-[#72a5c0] underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try again</span>
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
          <div className="rounded-[20px] border border-dashed border-white/60 dark:border-white/15 bg-white/40 dark:bg-white/5 backdrop-blur-md px-7 py-12 text-center">
            <PenLine className="mx-auto mb-3 h-8 w-8 text-[#8a718e]/60 dark:text-[#d8b4e2]/60" />
            <p className="font-display text-2xl text-[#3c4f5d] dark:text-[#f0f6fc]">
              The page is quiet for now.
            </p>
            <Link
              to="/write"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#2f556a] dark:text-[#72a5c0] underline underline-offset-4"
            >
              <span>Leave the first thought</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
