import { FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router"
import PrimaryButton from "../components/PrimaryButton"
import { submitEntry } from "../lib/api"
import { saveToHistory } from "../lib/history"
import type { Entry } from "../types"

export default function Write() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !message.trim()) return
    try {
      const entry = await submitEntry(title.trim(), message.trim())
      saveToHistory(entry)
      setSubmitted(true)
      window.setTimeout(() => navigate(`/entry/${entry.id}`), 900)
    } catch (err) {
      console.error("Supabase insert failed:", err)
    }
  }

  return <section className="mx-auto w-full max-w-[680px] pb-16 pt-10 sm:pt-20"><Link to="/" className="mb-10 inline-block text-sm text-[#596773] transition hover:text-[#141a1f]">← Back</Link><p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e]">The Blank Page</p><h1 className="font-display mt-3 text-5xl tracking-[-0.05em] text-[#141a1f] sm:text-6xl">Say something</h1><p className="mt-4 text-lg leading-7 text-[#596773]">Let out what you feel. There is no name attached.</p><form onSubmit={submit} className="mt-11 space-y-7 rounded-[24px] border border-[#c5ccd3] bg-white/70 p-6 shadow-[0_15px_40px_rgba(60,79,93,0.06)] sm:p-9"><label className="block"><span className="mb-2.5 block text-sm font-semibold text-[#3c4f5d]">Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} required placeholder="Give this thought a name" className="w-full rounded-xl border border-[#c5ccd3] bg-[#f1f2f4] px-4 py-3.5 text-base outline-none placeholder:text-[#8c9aa6] focus:border-[#4f8eb0] focus:ring-2 focus:ring-[#b9d2df]" /></label><label className="block"><span className="mb-2.5 block text-sm font-semibold text-[#3c4f5d]">Message</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1400} required placeholder="Write freely. Take your time." className="min-h-56 w-full resize-y rounded-xl border border-[#c5ccd3] bg-[#f1f2f4] px-4 py-3.5 text-base leading-7 outline-none placeholder:text-[#8c9aa6] focus:border-[#4f8eb0] focus:ring-2 focus:ring-[#b9d2df]" /></label><div className="flex flex-col gap-4 border-t border-[#e2e6e9] pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xs text-xs leading-5 text-[#6f8190]">Your recent submissions are stored only on this device for 7 days.</p><PrimaryButton type="submit" success={submitted}>{submitted ? "Saved quietly" : "Submit anonymously"}</PrimaryButton></div>{submitted && <p role="status" className="rounded-xl bg-[#edf8ee] px-4 py-3 text-sm text-[#2c6d33]">Your page has been saved to this device.</p>}</form></section>
}

