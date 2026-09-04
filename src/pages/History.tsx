import { useEffect, useState } from "react"
import { Link } from "react-router"
import { ArrowLeft, Clock, PenLine, Trash2 } from "lucide-react"
import EntryCard from "../components/EntryCard"
import { clearHistory, getHistory } from "../lib/history"
import type { Entry } from "../types"

export default function History() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [confirmingClear, setConfirmingClear] = useState(false)
  useEffect(() => setEntries(getHistory()), [])

  function clear() {
    clearHistory()
    setEntries([])
    setConfirmingClear(false)
  }

  return (
    <section className="mx-auto w-full max-w-[760px] pb-16 pt-10 sm:pt-20">
      <Link
        to="/"
        className="mb-10 inline-flex min-h-11 items-center gap-1.5 text-sm text-[#596773] dark:text-[#8b949e] transition hover:text-[#141a1f] dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Link>
      <div className="flex flex-col gap-5 border-b border-[#c5ccd3]/50 dark:border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e] dark:text-[#d8b4e2]">
            On this device
          </p>
          <h1 className="font-display mt-3 break-words text-5xl tracking-[-0.05em] text-[#141a1f] dark:text-[#f0f6fc] sm:text-6xl">
            Your recent entries
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#6f8190] dark:text-[#8b949e]">
            A local copy is kept in this browser for 7 days. Clearing it removes
            these local references but does not delete the public entries.
          </p>
        </div>
        {entries.length > 0 && !confirmingClear && (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md px-4 py-2 text-sm text-[#596773] dark:text-[#c9d1d9] transition hover:border-[#8c9aa6] hover:bg-white/90 dark:hover:bg-white/20 hover:text-[#28343e] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear history</span>
          </button>
        )}
      </div>
      {confirmingClear && (
        <div
          role="status"
          className="mt-5 rounded-[22px] border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-xl px-5 py-4 shadow-[0_8px_24px_rgba(60,79,93,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        >
          <p className="text-sm leading-6 text-[#596773] dark:text-[#8b949e]">
            Remove these entries from this browser? The public entries will
            remain available.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={clear}
              className="min-h-11 rounded-full bg-[#2f556a] dark:bg-[#72a5c0] px-4 py-2 text-sm font-semibold text-[#edf4f7] dark:text-[#0c1015] focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
            >
              Clear local history
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="min-h-11 rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 px-4 py-2 text-sm text-[#596773] dark:text-[#c9d1d9] hover:bg-white/90 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
            >
              Keep it
            </button>
          </div>
        </div>
      )}
      <div className="mt-7 space-y-3">
        {entries.length ? (
          entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} local />
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/60 dark:border-white/15 bg-white/40 dark:bg-white/5 backdrop-blur-md px-7 py-12 text-center">
            <Clock className="mx-auto mb-3 h-8 w-8 text-[#8a718e]/60 dark:text-[#d8b4e2]/60" />
            <p className="font-display text-2xl text-[#3c4f5d] dark:text-[#f0f6fc]">
              Nothing saved here yet.
            </p>
            <Link
              to="/write"
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[#2f556a] dark:text-[#72a5c0] underline underline-offset-4"
            >
              <span>Write the first page</span>
              <PenLine className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
