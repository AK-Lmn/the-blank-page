import { useEffect, useState } from "react"
import { Link } from "react-router"
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
        className="mb-10 inline-flex min-h-11 items-center text-sm text-[#596773] transition hover:text-[#141a1f]"
      >
        ← Back
      </Link>
      <div className="flex flex-col gap-5 border-b border-[#c5ccd3] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e]">
            On this device
          </p>
          <h1 className="font-display mt-3 break-words text-5xl tracking-[-0.05em] text-[#141a1f] sm:text-6xl">
            Your recent entries
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#6f8190]">
            A local copy is kept in this browser for 7 days. Clearing it removes
            these local references but does not delete the public entries.
          </p>
        </div>
        {entries.length > 0 && !confirmingClear && (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="min-h-11 w-fit rounded-full border border-[#c5ccd3] px-4 py-2 text-sm text-[#596773] transition hover:border-[#8c9aa6] hover:text-[#28343e] focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
          >
            Clear history
          </button>
        )}
      </div>
      {confirmingClear && (
        <div
          role="status"
          className="mt-5 rounded-[18px] border border-[#d0c6d2] bg-[#f3f1f4] px-5 py-4"
        >
          <p className="text-sm leading-6 text-[#596773]">
            Remove these entries from this browser? The public entries will
            remain available.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={clear}
              className="min-h-11 rounded-full bg-[#2f556a] px-4 py-2 text-sm font-semibold text-[#edf4f7] focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
            >
              Clear local history
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="min-h-11 rounded-full border border-[#c5ccd3] px-4 py-2 text-sm text-[#596773] focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
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
          <div className="rounded-[20px] border border-dashed border-[#c5ccd3] bg-white/35 px-7 py-12 text-center">
            <p className="font-display text-2xl text-[#3c4f5d]">
              Nothing saved here yet.
            </p>
            <Link
              to="/write"
              className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[#2f556a] underline underline-offset-4"
            >
              Write the first page
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
