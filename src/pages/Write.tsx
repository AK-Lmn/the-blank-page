import { FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router"
import PrimaryButton from "../components/PrimaryButton"
import { EntrySubmissionError, submitEntry } from "../lib/api"
import { saveToHistory } from "../lib/history"

const titleLimit = 90
const messageLimit = 1400

export default function Write() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const trimmedTitle = title.trim()
  const trimmedMessage = message.trim()
  const canSubmit =
    trimmedTitle.length >= 1 &&
    trimmedTitle.length <= titleLimit &&
    trimmedMessage.length >= 1 &&
    trimmedMessage.length <= messageLimit

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !canSubmit) return
    setSubmitting(true)
    setError("")
    try {
      const entry = await submitEntry(trimmedTitle, trimmedMessage, website)
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

  return (
    <section className="mx-auto w-full max-w-[680px] pb-16 pt-10 sm:pt-20">
      <Link
        to="/"
        className="mb-10 inline-flex min-h-11 items-center text-sm text-[#596773] transition hover:text-[#141a1f]"
      >
        ← Back
      </Link>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e]">
        The Blank Page
      </p>
      <h1 className="font-display mt-3 text-5xl tracking-[-0.05em] text-[#141a1f] sm:text-6xl">
        Say something
      </h1>
      <p className="mt-4 text-lg leading-7 text-[#596773]">
        Your writing will be public, with no account or name attached.
      </p>
      <form
        onSubmit={submit}
        aria-busy={submitting}
        className="relative mt-11 space-y-7 rounded-[24px] border border-[#c5ccd3] bg-white/70 p-6 shadow-[0_15px_40px_rgba(60,79,93,0.06)] sm:p-9"
      >
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-4">
            <label
              htmlFor="entry-title"
              className="text-sm font-semibold text-[#3c4f5d]"
            >
              Title
            </label>
            <span
              id="title-count"
              className="text-xs tabular-nums text-[#6f8190]"
            >
              {title.length} / {titleLimit}
            </span>
          </div>
          <input
            id="entry-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={titleLimit}
            required
            disabled={submitting}
            aria-describedby="title-count"
            placeholder="Give this thought a name"
            className="w-full rounded-xl border border-[#c5ccd3] bg-[#f1f2f4] px-4 py-3.5 text-base outline-none placeholder:text-[#8c9aa6] focus:border-[#4f8eb0] focus:ring-2 focus:ring-[#b9d2df] disabled:opacity-70"
          />
        </div>
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-4">
            <label
              htmlFor="entry-message"
              className="text-sm font-semibold text-[#3c4f5d]"
            >
              Message
            </label>
            <span
              id="message-count"
              className="text-xs tabular-nums text-[#6f8190]"
            >
              {message.length.toLocaleString()} /{" "}
              {messageLimit.toLocaleString()}
            </span>
          </div>
          <textarea
            id="entry-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={messageLimit}
            required
            disabled={submitting}
            aria-describedby="message-count"
            placeholder="Write freely. Take your time."
            className="min-h-56 w-full resize-y rounded-xl border border-[#c5ccd3] bg-[#f1f2f4] px-4 py-3.5 text-base leading-7 outline-none placeholder:text-[#8c9aa6] focus:border-[#4f8eb0] focus:ring-2 focus:ring-[#b9d2df] disabled:opacity-70"
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
        <div className="flex flex-col gap-4 border-t border-[#e2e6e9] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs leading-5 text-[#6f8190]">
            A public entry will be created. A copy stays in this browser for 7
            days so you can find it again.
          </p>
          <PrimaryButton type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Publishing…" : "Submit anonymously"}
          </PrimaryButton>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-[#f3f1f4] px-4 py-3 text-sm text-[#6f4f70]"
          >
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
