import type { ChangeEvent } from "react"

type SearchInputProps = {
    value: string
    onChange: (value: string) => void
    onClear: () => void
}

export default function SearchInput({ value, onChange, onClear }: SearchInputProps) {
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value)
    }

    return <div className="relative">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f8190]" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
        <input value={value} onChange={handleChange} placeholder="Search by title..." aria-label="Search public entries by title" className="w-full rounded-[20px] border border-[#c5ccd3] bg-white/75 py-4 pl-14 pr-14 text-base text-[#28343e] shadow-[0_10px_28px_rgba(60,79,93,0.06)] outline-none placeholder:text-[#8c9aa6] transition focus:border-[#4f8eb0] focus:ring-4 focus:ring-[#dce8ef] sm:py-5 sm:text-lg" />
        {value && <button type="button" onClick={onClear} aria-label="Clear search" className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#6f8190] transition hover:bg-[#e2e6e9] hover:text-[#28343e] focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" /></svg></button>}
    </div>
}
