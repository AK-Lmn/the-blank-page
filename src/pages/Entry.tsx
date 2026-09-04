import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { fetchRandomEntry, getPublicEntry } from "../lib/api"
import { formatEntryDate } from "../lib/date"
import { findHistoryEntry } from "../lib/history"
import type { Entry as EntryType } from "../types"

type EntryState = { status: "loading" } | {
  status: "ready"
  entry: EntryType
} | { status: "not-found" } | { status: "error" }

export default function Entry() {
  const { id: publicId = "" } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState<EntryState>({ status: "loading" })
  const [copied, setCopied] = useState(false)
  const [loadingRandom, setLoadingRandom] = useState(false)

  useEffect(() => {
    setCopied(false)
    let current = true
    const local = findHistoryEntry(publicId)
    if (local) {
      setState({ status: "ready", entry: local })
      return () => {
        current = false
      }
    }

    setState({ status: "loading" })
    void getPublicEntry(publicId)
      .then((found) => {
        if (current)
          setState(
            found ? { status: "ready", entry: found } : { status: "not-found" },
          )
      })
      .catch(() => {
        if (current) setState({ status: "error" })
      })

    return () => {
      current = false
    }
  }, [publicId])

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

  async function handleRandomThought() {
    if (loadingRandom) return
    setLoadingRandom(true)
    try {
      const random = await fetchRandomEntry(publicId)
      if (random) {
        navigate(`/entry/${random.id}`)
      } else {
        navigate("/")
      }
    } catch {
      navigate("/")
    } finally {
      setLoadingRandom(false)
    }
  }

  if (state.status === "loading") {
    return (
      <section className="mx-auto w-full max-w-[760px] pb-20 pt-10 sm:pt-24">
        <div
          role="status"
          className="rounded-[20px] border border-dashed border-white/60 dark:border-white/15 bg-white/40 dark:bg-white/5 backdrop-blur-md px-7 py-10 text-center text-sm text-[#6f8190] dark:text-[#8b949e]"
        >
          Opening this page…
        </div>
      </section>
    )
  }
  if (state.status === "not-found")
    return <MessagePage message="This page is no longer here." />
  if (state.status === "error") {
    return (
      <MessagePage
        message="This page could not be opened just now. Please try again."
        alert
      />
    )
  }

  const { entry } = state
  return (
    <article className="mx-auto w-full max-w-[760px] pb-20 pt-10 sm:pt-24">
      <Link
        to="/"
        className="mb-12 inline-block text-sm text-[#596773] dark:text-[#8b949e] transition hover:text-[#141a1f] dark:hover:text-white"
      >
        ← Back
      </Link>
      <div className="rounded-[28px] border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-xl p-7 shadow-[0_18px_55px_rgba(60,79,93,0.06)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.4)] sm:p-12">
        <div className="border-l-2 border-[#b9aabb] dark:border-[#72a5c0]/50 pl-5 sm:pl-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8a718e] dark:text-[#d8b4e2]">
              Anonymous · {formatEntryDate(entry.createdAt)}
            </p>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md px-3 py-1 text-xs text-[#596773] dark:text-[#c9d1d9] transition hover:border-[#8c9aa6] hover:bg-white/90 dark:hover:bg-white/20 hover:text-[#141a1f] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
              aria-label="Copy link to this entry"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                  strokeLinecap="round"
                />
                <path
                  d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                  strokeLinecap="round"
                />
              </svg>
              <span>{copied ? "Link copied!" : "Copy link"}</span>
            </button>
            {copied && (
              <span role="status" aria-live="polite" className="sr-only">
                Link copied to clipboard
              </span>
            )}
          </div>
          <h1 className="font-display mt-5 break-words text-5xl leading-[1.02] tracking-[-0.05em] text-[#141a1f] dark:text-[#f0f6fc] sm:text-7xl">
            {entry.title}
          </h1>
        </div>
        <div className="mt-12 max-w-[650px] whitespace-pre-wrap break-words text-[1.15rem] leading-9 text-[#3c4f5d] dark:text-[#c9d1d9] [overflow-wrap:anywhere] sm:ml-8 sm:text-[1.3rem] sm:leading-10">
          {entry.message}
        </div>
        <div className="mt-16 border-t border-[#c5ccd3]/50 dark:border-white/10 pt-8 sm:ml-8 sm:mt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#6f8190] dark:text-[#8b949e]">
              Every page is left open for anyone to read.
            </p>
            <button
              type="button"
              onClick={() => void handleRandomThought()}
              disabled={loadingRandom}
              className="inline-flex items-center gap-2 rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-[#2f556a] dark:text-[#72a5c0] transition hover:-translate-y-0.5 hover:border-[#8c9aa6] hover:bg-white/90 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#72a5c0] disabled:opacity-60"
            >
              {loadingRandom ? "Finding a page…" : "Read another thought →"}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function MessagePage({
  message,
  alert = false,
}: {
  message: string
  alert?: boolean
}) {
  return (
    <section
      role={alert ? "alert" : undefined}
      className="mx-auto w-full max-w-[760px] pb-20 pt-10 sm:pt-24"
    >
      <Link
        to="/"
        className="text-sm text-[#596773] dark:text-[#8b949e] transition hover:text-[#141a1f] dark:hover:text-white"
      >
        ← Back
      </Link>
      <div className="mt-12 rounded-[24px] border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-xl p-8 text-center sm:p-12">
        <p className="font-display text-3xl text-[#3c4f5d] dark:text-[#f0f6fc]">
          {message}
        </p>
      </div>
    </section>
  )
}
