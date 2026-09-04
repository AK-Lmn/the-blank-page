import { Link } from "react-router"
import { formatEntryDate, formatRelativeDate } from "../lib/date"
import type { Entry } from "../types"

type EntryCardProps = {
  entry: Entry
  local?: boolean
  showReadLink?: boolean
}

export default function EntryCard({
  entry,
  local,
  showReadLink,
}: EntryCardProps) {
  const date = local
    ? formatRelativeDate(entry.createdAt)
    : formatEntryDate(entry.createdAt)
  return (
    <Link
      to={`/entry/${entry.id}`}
      className="group block w-full rounded-[22px] border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-xl p-5 text-left shadow-[0_8px_24px_rgba(60,79,93,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:border-[#8c9aa6] dark:hover:border-white/25 hover:bg-white/90 dark:hover:bg-[#16202a]/90 focus:outline-none focus:ring-2 focus:ring-[#72a5c0] sm:p-6"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <h3 className="font-display break-words text-xl tracking-[-0.025em] text-[#28343e] dark:text-[#f0f6fc] [overflow-wrap:anywhere] sm:text-2xl">
            {entry.title}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-[570px] break-words text-sm leading-6 text-[#596773] dark:text-[#8b949e] [overflow-wrap:anywhere]">
            {entry.message}
          </p>
        </div>
        <span className="mt-1 shrink-0 text-sm text-[#6f8190] dark:text-[#7d8590] transition group-hover:translate-x-0.5">
          →
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#6f8190] dark:text-[#8b949e]">
          {date}
        </p>
        {showReadLink && (
          <span className="text-[0.68rem] font-medium text-[#2f556a] dark:text-[#72a5c0] opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
            Read entry →
          </span>
        )}
      </div>
    </Link>
  )
}
