import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { getPublicEntry } from "../lib/api"
import { formatEntryDate } from "../lib/date"
import { findHistoryEntry } from "../lib/history"
import type { Entry as EntryType } from "../types"

type EntryState =
  | { status: "loading" }
  | { status: "ready"; entry: EntryType }
  | { status: "not-found" }
  | { status: "error" }

export default function Entry() {
  const { id: publicId = "" } = useParams()
  const [state, setState] = useState<EntryState>({ status: "loading" })

  useEffect(() => {
    let current = true
    const local = findHistoryEntry(publicId)
    if (local) {
      setState({ status: "ready", entry: local })
      return () => { current = false }
    }

    setState({ status: "loading" })
    void getPublicEntry(publicId)
      .then((found) => {
        if (current) setState(found ? { status: "ready", entry: found } : { status: "not-found" })
      })
      .catch(() => {
        if (current) setState({ status: "error" })
      })

    return () => { current = false }
  }, [publicId])

  if (state.status === "loading") return <section role="status" className="mx-auto w-full max-w-[760px] pb-20 pt-10 text-sm text-[#6f8190] sm:pt-24">Opening this page…</section>
  if (state.status === "not-found") return <MessagePage message="This page is no longer here." />
  if (state.status === "error") return <MessagePage message="This page could not be opened just now. Please try again." alert />

  const { entry } = state
  return <article className="mx-auto w-full max-w-[760px] pb-20 pt-10 sm:pt-24"><Link to="/" className="mb-12 inline-block text-sm text-[#596773] transition hover:text-[#141a1f]">← Back</Link><div className="border-l-2 border-[#b9aabb] pl-5 sm:pl-8"><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8a718e]">Anonymous · {formatEntryDate(entry.createdAt)}</p><h1 className="font-display mt-5 break-words text-5xl leading-[1.02] tracking-[-0.05em] text-[#141a1f] sm:text-7xl">{entry.title}</h1></div><div className="mt-12 max-w-[650px] whitespace-pre-wrap break-words text-[1.15rem] leading-9 text-[#3c4f5d] [overflow-wrap:anywhere] sm:ml-8 sm:text-[1.3rem] sm:leading-10">{entry.message}</div></article>
}

function MessagePage({ message, alert = false }: { message: string; alert?: boolean }) {
  return <section role={alert ? "alert" : undefined} className="mx-auto w-full max-w-[760px] pb-20 pt-10 sm:pt-24"><Link to="/" className="text-sm text-[#596773] transition hover:text-[#141a1f]">← Back</Link><p className="font-display mt-12 text-3xl text-[#3c4f5d]">{message}</p></section>
}
