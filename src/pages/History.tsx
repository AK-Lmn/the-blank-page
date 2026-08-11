import { useEffect, useState } from "react"
import { Link } from "react-router"
import EntryCard from "../components/EntryCard"
import { clearHistory, getHistory } from "../lib/history"
import type { Entry } from "../types"

export default function History() {
  const [entries, setEntries] = useState<Entry[]>([])
  useEffect(() => setEntries(getHistory()), [])
  function clear() { clearHistory(); setEntries([]) }

  return <section className="mx-auto w-full max-w-[760px] pb-16 pt-10 sm:pt-20"><Link to="/" className="mb-10 inline-block text-sm text-[#596773] transition hover:text-[#141a1f]">← Back</Link><div className="flex flex-col gap-5 border-b border-[#c5ccd3] pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e]">On this device</p><h1 className="font-display mt-3 text-5xl tracking-[-0.05em] text-[#141a1f] sm:text-6xl">Recent submissions</h1><p className="mt-3 text-sm text-[#6f8190]">Stored only on this device for 7 days.</p></div>{entries.length > 0 && <button onClick={clear} className="w-fit rounded-full border border-[#c5ccd3] px-4 py-2 text-sm text-[#596773] transition hover:border-[#8c9aa6] hover:text-[#28343e]">Clear history</button>}</div><div className="mt-7 space-y-3">{entries.length ? entries.map((entry) => <EntryCard key={entry.id} entry={entry} local />) : <div className="rounded-[20px] border border-dashed border-[#c5ccd3] bg-white/35 px-7 py-12 text-center"><p className="font-display text-2xl text-[#3c4f5d]">Nothing saved here yet.</p><Link to="/write" className="mt-5 inline-block text-sm font-medium text-[#2f556a] underline underline-offset-4">Write the first page</Link></div>}</div></section>
}
