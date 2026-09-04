import type { ChangeEvent } from "react"
import { Search, X } from "lucide-react"

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export default function SearchInput({
  value,
  onChange,
  onClear,
}: SearchInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f8190] dark:text-[#8b949e]"
      />
      <input
        value={value}
        onChange={handleChange}
        placeholder="Search by title or pen name..."
        aria-label="Search public entries by title or pen name"
        className="w-full rounded-[22px] border border-white/60 dark:border-white/15 bg-white/75 dark:bg-[#131b23]/75 backdrop-blur-xl py-4 pl-14 pr-14 text-base text-[#28343e] dark:text-[#f0f6fc] shadow-[0_10px_30px_rgba(60,79,93,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] outline-none placeholder:text-[#8c9aa6] dark:placeholder:text-[#6e7681] transition focus:border-[#4f8eb0] dark:focus:border-[#72a5c0] focus:ring-4 focus:ring-[#dce8ef] dark:focus:ring-[#72a5c0]/20 sm:py-5 sm:text-lg"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-[#6f8190] dark:text-[#8b949e] transition hover:bg-white/60 dark:hover:bg-white/10 hover:text-[#28343e] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
