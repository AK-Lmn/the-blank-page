import { NavLink } from "react-router"
import ThemeToggle from "./ThemeToggle"

export default function Header() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-11 items-center rounded-full border px-3.5 py-2 text-sm backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-[#72a5c0] sm:px-4 ${
      isActive
        ? "border-[#2f556a] dark:border-[#72a5c0] bg-[#2f556a] dark:bg-[#72a5c0] text-[#edf4f7] dark:text-[#0c1015] font-medium shadow-[0_4px_14px_rgba(47,85,106,0.15)]"
        : "border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 text-[#434d56] dark:text-[#c9d1d9] hover:border-[#8c9aa6] hover:bg-white/90 dark:hover:bg-white/20 hover:text-[#141a1f] dark:hover:text-white"
    }`

  return (
    <header className="flex items-center justify-between gap-2 py-6 sm:gap-4 sm:py-9">
      <NavLink
        to="/"
        className="group min-w-0 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
        aria-label="The Blank Page home"
      >
        <span className="font-display block text-[1.25rem] leading-none tracking-[-0.04em] text-[#141a1f] dark:text-[#f0f6fc] sm:text-[1.45rem]">
          The Blank Page
        </span>
        <span className="mt-1 hidden text-[0.66rem] font-medium uppercase tracking-[0.18em] text-[#596773] dark:text-[#8b949e] min-[360px]:block">
          A quiet public space
        </span>
      </NavLink>
      <nav
        aria-label="Primary navigation"
        className="flex shrink-0 items-center gap-1.5 sm:gap-2"
      >
        <NavLink to="/search" className={navLinkClass}>
          Search
        </NavLink>
        <NavLink to="/history" className={navLinkClass}>
          History
        </NavLink>
        <ThemeToggle />
      </nav>
    </header>
  )
}
