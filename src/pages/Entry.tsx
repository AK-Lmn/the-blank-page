import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { getPublicEntry } from "../lib/api"
import { formatRelativeDate } from "../lib/date"
import { findHistoryEntry } from "../lib/history"
import type { Entry as EntryType } from "../types"

export default function Entry() {
  const { id = "" } = useParams()
  const [entry, setEntry] = useState<EntryType | null | undefined>(undefined)

  useEffect(() => { const local = findHistoryEntry(id); if (local) { setEntry(local); return }; void getPublicEntry(id).then((found) => setEntry(found ?? null)) }, [id])
  if (entry === undefined) return null
  if (entry === null) return <section className="mx-auto w-full max-w-[760px] pb-20 pt-10 sm:pt-24"><Link to="/" className="text-sm text-[#596773] transition hover:text-[#141a1f]">← Back</Link><p className="font-display mt-12 text-3xl text-[#3c4f5d]">This page is no longer here.</p></section>

  return <article className="mx-auto w-full max-w-[760px] pb-20 pt-10 sm:pt-24"><Link to="/" className="mb-12 inline-block text-sm text-[#596773] transition hover:text-[#141a1f]">← Back</Link><div className="border-l-2 border-[#b9aabb] pl-5 sm:pl-8"><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8a718e]">Anonymous · {entry.local ? formatRelativeDate(entry.createdAt) : entry.createdAt}</p><h1 className="font-display mt-5 text-5xl leading-[1.02] tracking-[-0.05em] text-[#141a1f] sm:text-7xl">{entry.title}</h1></div><div className="mt-12 max-w-[650px] whitespace-pre-wrap text-[1.15rem] leading-9 text-[#3c4f5d] sm:ml-8 sm:text-[1.3rem] sm:leading-10">{entry.message}</div></article>
}
