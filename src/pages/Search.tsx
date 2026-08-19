import { useEffect, useState } from "react"
import EntryCard from "../components/EntryCard"
import SearchInput from "../components/SearchInput"
import { searchEntries } from "../lib/api"
import type { Entry } from "../types"

export default function Search() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Entry[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const trimmed = query.trim()
        if (!trimmed) {
            setResults([])
            return
        }
        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const data = await searchEntries(trimmed)
                setResults(data)
            } catch {
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    return <section className="mx-auto w-full max-w-3xl pb-16 pt-10 sm:pb-24 sm:pt-20"><div className="text-center"><p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a718e]">Search</p><h1 className="font-display mt-3 text-5xl tracking-[-0.05em] text-[#141a1f] sm:text-6xl">Find a thought</h1><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#596773] sm:text-lg">Search public entries by title. Only titles are searchable; the message body remains for reading, not discovery.</p></div><div className="mx-auto mt-10 max-w-2xl"><SearchInput value={query} onChange={setQuery} onClear={() => setQuery("")} /></div><div className="mt-14">{!query && <div className="rounded-[24px] border border-dashed border-[#c5ccd3] bg-white/30 px-7 py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3f1f4] text-[#8a718e]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="11" cy="11" r="5.5" /><path d="m15.5 15.5 4 4" strokeLinecap="round" /></svg></div><p className="font-display mt-5 text-2xl text-[#3c4f5d]">Start typing to search public entries</p></div>}{query && loading && <div className="rounded-[24px] border border-dashed border-[#c5ccd3] bg-white/30 px-7 py-14 text-center"><p className="font-display text-2xl text-[#3c4f5d]">Searching…</p></div>}{query && !loading && results.length === 0 && <div className="rounded-[24px] border border-dashed border-[#c5ccd3] bg-white/30 px-7 py-14 text-center"><p className="font-display text-2xl text-[#3c4f5d]">No entries found</p><p className="mt-3 text-sm text-[#6f8190]">Try a different title or a shorter phrase.</p></div>}{!loading && results.length > 0 && <div><p className="mb-5 border-b border-[#c5ccd3] pb-3 text-xs font-medium uppercase tracking-[0.16em] text-[#6f8190]">Matching public entries</p><div className="space-y-3">{results.map((entry) => <EntryCard key={entry.id} entry={entry} showReadLink />)}</div></div>}</div></section>
}
