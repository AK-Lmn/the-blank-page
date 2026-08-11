import { useEffect, useState } from "react"
import { Link } from "react-router"
import EntryCard from "../components/EntryCard"
import { getPublicEntries } from "../lib/api"
import { getHistory } from "../lib/history"
import type { Entry } from "../types"

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([])
  useEffect(() => { void getPublicEntries().then((publicEntries) => setEntries([...getHistory(), ...publicEntries].slice(0, 3))) }, [])

  return <section className="mx-auto w-full max-w-[760px] pb-16 pt-14 sm:pb-24 sm:pt-24"><div className="rounded-[28px] border border-[#d0c6d2] bg-[#f3f1f4] px-7 py-10 shadow-[0_18px_55px_rgba(60,79,93,0.08)] sm:px-12 sm:py-14"><p className="mb-7 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e]">A place without an audience</p><h1 className="font-display max-w-[550px] text-5xl leading-[0.98] tracking-[-0.055em] text-[#141a1f] sm:text-7xl">Let out what<br />you feel.</h1><p className="mt-7 max-w-md text-[1.05rem] leading-7 text-[#596773]">Leave a thought here, anonymously. No profiles, no replies, no permanent record.</p><Link to="/write" className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#2f556a] px-6 py-3.5 text-sm font-semibold text-[#edf4f7] shadow-[0_10px_24px_rgba(47,85,106,0.18)] transition hover:-translate-y-0.5 hover:bg-[#203946] focus:outline-none focus:ring-2 focus:ring-[#72a5c0] focus:ring-offset-2">Say something <span aria-hidden="true">→</span></Link></div><div className="mt-16"><div className="mb-5 flex items-baseline justify-between border-b border-[#c5ccd3] pb-3"><h2 className="font-display text-2xl tracking-[-0.03em] text-[#28343e]">A few pages left open</h2><span className="text-xs text-[#6f8190]">Anonymous</span></div><div className="space-y-3">{entries.map((entry) => <EntryCard key={entry.id} entry={entry} local={entry.local} />)}</div></div></section>
}
