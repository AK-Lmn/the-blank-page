import { Link } from "react-router"
import { formatEntryDate, formatRelativeDate } from "../lib/date"
import type { Entry } from "../types"

type EntryCardProps = { entry: Entry; local?: boolean; showReadLink?: boolean }

export default function EntryCard({ entry, local, showReadLink }: EntryCardProps) {
  const date = local ? formatRelativeDate(entry.createdAt) : formatEntryDate(entry.createdAt)
  return <Link to={`/entry/${entry.id}`} className="group block w-full rounded-[18px] border border-[#d6dde2] bg-white/65 p-5 text-left shadow-[0_5px_18px_rgba(60,79,93,0.035)] transition hover:-translate-y-0.5 hover:border-[#a9b3bc] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0] sm:p-6"><div className="flex items-start justify-between gap-5"><div><h3 className="font-display text-xl tracking-[-0.025em] text-[#28343e] sm:text-2xl">{entry.title}</h3><p className="mt-2 line-clamp-2 max-w-[570px] text-sm leading-6 text-[#596773]">{entry.message}</p></div><span className="mt-1 shrink-0 text-sm text-[#8c9aa6] transition group-hover:translate-x-0.5">→</span></div><div className="mt-4 flex items-center justify-between"><p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#8c9aa6]">{date}</p>{showReadLink && <span className="text-[0.68rem] font-medium text-[#2f556a] opacity-0 transition group-hover:opacity-100">Read entry →</span>}</div></Link>
}
