import { FormEvent, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowLeft } from "lucide-react"
import PrimaryButton from "../components/PrimaryButton"
import { EntrySubmissionError, submitEntry } from "../lib/api"
import { clearDraft, getDraft, saveDraft, saveToHistory } from "../lib/history"
import { useTheme } from "../lib/ThemeContext"

const titleLimit = 90
const messageLimit = 1400
const authorLimit = 30

const isMac =
  typeof navigator !== "undefined" &&
  /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform)
const shortcutBadge = isMac ? "⌘Enter" : "Ctrl+Enter"

export default function Write() {
  const navigate = useNavigate()
  const { triggerTypingGlow } = useTheme()
  const [title, setTitle] = useState(() => getDraft()?.title ?? "")
  const [message, setMessage] = useState(() => getDraft()?.message ?? "")
  const [author, setAuthor] = useState(() => getDraft()?.author ?? "")
  const [website, setWebsite] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [draftRestored, setDraftRestored] = useState(() => {
    const draft = getDraft()
    return Boolean(draft && (draft.title || draft.message || draft.author))
  })

  useEffect(() => {
    saveDraft({ title, message, author })
  }, [title, message, author])

  const trimmedTitle = title.trim()
  const trimmedMessage = message.trim()
  const canSubmit =
    trimmedTitle.length >= 1 &&
    trimmedTitle.length <= titleLimit &&
    trimmedMessage.length >= 1 &&
    trimmedMessage.length <= messageLimit

  async function executeSubmit() {
    if (submitting || !canSubmit) return
    setSubmitting(true)
    setError("")
    try {
      const entry = await submitEntry(
        trimmedTitle,
        trimmedMessage,
        author.trim(),
        website,
      )
      clearDraft()
      saveToHistory(entry)
      navigate(`/entry/${entry.id}`)
    } catch (submissionError) {
      setError(
        submissionError instanceof EntrySubmissionError &&
          submissionError.status === 429
          ? "Please wait a little before submitting again."
          : "Something went wrong while publishing. Please try again.",
      )
      setSubmitting(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void executeSubmit()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      void executeSubmit()
    }
  }

  function handleClearDraft() {
    clearDraft()
    setTitle("")
    setMessage("")
    setAuthor("")
    setDraftRestored(false)
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value)
    triggerTypingGlow?.()
  }

  function handleAuthorChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAuthor(event.target.value)
    triggerTypingGlow?.()
  }

  function handleMessageChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value)
    triggerTypingGlow?.()
  }

  return (
    <section className="mx-auto w-full max-w-[680px] pb-16 pt-10 sm:pt-20">
      <Link
        to="/"
        className="mb-10 inline-flex min-h-11 items-center gap-1.5 text-sm text-[#596773] dark:text-[#8b949e] transition hover:text-[#141a1f] dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Link>
      <h1 className="font-display text-5xl tracking-[-0.05em] text-[#141a1f] dark:text-[#f0f6fc] sm:text-6xl">
        Say something
      </h1>
      <p className="mt-4 text-lg leading-7 text-[#596773] dark:text-[#8b949e]">
        Your writing will be public, with no account or name attached.
      </p>
      <form
        onSubmit={submit}
        onKeyDown={handleKeyDown}
        aria-busy={submitting}
        className="relative mt-11 space-y-7 rounded-[28px] border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-xl p-6 shadow-[0_18px_50px_rgba(60,79,93,0.06)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.4)] sm:p-9"
      >
        {draftRestored && (
          <div
            role="status"
            className="flex items-center justify-between rounded-xl border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md px-4 py-2.5 text-xs text-[#596773] dark:text-[#8b949e]"
          >
            <span>Draft restored from this device</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearDraft}
                className="font-medium text-[#6f4f70] dark:text-[#d8b4e2] underline underline-offset-2 hover:text-[#432f44] dark:hover:text-[#edd4f5] focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
              >
                Clear draft
              </button>
              <button
                type="button"
                onClick={() => setDraftRestored(false)}
                className="text-[#6f8190] dark:text-[#8b949e] hover:text-[#141a1f] dark:hover:text-white focus:outline-none"
                aria-label="Dismiss draft notice"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-4">
            <label
              htmlFor="entry-title"
              className="text-sm font-semibold text-[#3c4f5d] dark:text-[#c9d1d9]"
            >
              Title
            </label>
            <span
              id="title-count"
              className="text-xs tabular-nums text-[#6f8190] dark:text-[#8b949e]"
            >
              {title.length} / {titleLimit}
            </span>
          </div>
          <input
            id="entry-title"
            value={title}
            onChange={handleTitleChange}
            maxLength={titleLimit}
            required
            disabled={submitting}
            aria-describedby="title-count"
            placeholder="Give this thought a name"
            className="w-full rounded-xl border border-white/60 dark:border-white/15 bg-white/70 dark:bg-[#0c1015]/70 backdrop-blur-sm px-4 py-3.5 text-base text-[#141a1f] dark:text-[#f0f6fc] outline-none placeholder:text-[#8c9aa6] dark:placeholder:text-[#6e7681] focus:border-[#4f8eb0] dark:focus:border-[#72a5c0] focus:ring-2 focus:ring-[#b9d2df] dark:focus:ring-[#72a5c0]/30 disabled:opacity-70"
          />
        </div>
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-4">
            <label
              htmlFor="entry-author"
              className="text-sm font-semibold text-[#3c4f5d] dark:text-[#c9d1d9]"
            >
              Pen Name{" "}
              <span className="text-xs font-normal text-[#6f8190] dark:text-[#8b949e]">
                (optional)
              </span>
            </label>
            <span
              id="author-count"
              className="text-xs tabular-nums text-[#6f8190] dark:text-[#8b949e]"
            >
              {author.length} / {authorLimit}
            </span>
          </div>
          <input
            id="entry-author"
            value={author}
            onChange={handleAuthorChange}
            maxLength={authorLimit}
            disabled={submitting}
            aria-describedby="author-count"
            placeholder="Leave blank to stay Anonymous"
            className="w-full rounded-xl border border-white/60 dark:border-white/15 bg-white/70 dark:bg-[#0c1015]/70 backdrop-blur-sm px-4 py-3.5 text-base text-[#141a1f] dark:text-[#f0f6fc] outline-none placeholder:text-[#8c9aa6] dark:placeholder:text-[#6e7681] focus:border-[#4f8eb0] dark:focus:border-[#72a5c0] focus:ring-2 focus:ring-[#b9d2df] dark:focus:ring-[#72a5c0]/30 disabled:opacity-70"
          />
        </div>
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-4">
            <label
              htmlFor="entry-message"
              className="text-sm font-semibold text-[#3c4f5d] dark:text-[#c9d1d9]"
            >
              Message
            </label>
            <span
              id="message-count"
              className="text-xs tabular-nums text-[#6f8190] dark:text-[#8b949e]"
            >
              {message.length.toLocaleString()} /{" "}
              {messageLimit.toLocaleString()}
            </span>
          </div>
          <textarea
            id="entry-message"
            value={message}
            onChange={handleMessageChange}
            maxLength={messageLimit}
            required
            disabled={submitting}
            aria-describedby="message-count"
            placeholder="Write freely. Take your time."
            className="min-h-56 w-full resize-y rounded-xl border border-white/60 dark:border-white/15 bg-white/70 dark:bg-[#0c1015]/70 backdrop-blur-sm px-4 py-3.5 text-base text-[#141a1f] dark:text-[#f0f6fc] leading-7 outline-none placeholder:text-[#8c9aa6] dark:placeholder:text-[#6e7681] focus:border-[#4f8eb0] dark:focus:border-[#72a5c0] focus:ring-2 focus:ring-[#b9d2df] dark:focus:ring-[#72a5c0]/30 disabled:opacity-70"
          />
          <label
            aria-hidden="true"
            className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
          >
            <span>Website</span>
            <input
              name="website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
        <div className="flex flex-col gap-4 border-t border-[#e2e6e9]/60 dark:border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs leading-5 text-[#6f8190] dark:text-[#8b949e]">
            A public entry will be created. A copy stays in this browser for 7
            days so you can find it again.
          </p>
          <PrimaryButton
            type="submit"
            disabled={!canSubmit || submitting}
            shortcut={shortcutBadge}
          >
            {submitting ? "Publishing…" : "Submit anonymously"}
          </PrimaryButton>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-white/60 dark:border-white/10 bg-white/75 dark:bg-[#131b23]/80 px-4 py-3 text-sm text-[#6f4f70] dark:text-[#fca5a5]"
          >
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
