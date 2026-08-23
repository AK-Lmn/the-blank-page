import { NavLink } from "react-router"

export default function Header() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#72a5c0] sm:px-4 ${
      isActive
        ? "border-[#2f556a] bg-[#2f556a] text-[#edf4f7]"
        : "border-[#c5ccd3] bg-[#f1f2f4]/75 text-[#434d56] hover:border-[#8c9aa6] hover:bg-white"
    }`

  return <header className="flex items-center justify-between gap-2 py-6 sm:gap-4 sm:py-9">
    <NavLink to="/" className="group min-w-0 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-[#72a5c0]" aria-label="The Blank Page home">
      <span className="font-display block text-[1.25rem] leading-none tracking-[-0.04em] text-[#141a1f] sm:text-[1.45rem]">The Blank Page</span>
      <span className="mt-1 hidden text-[0.66rem] font-medium uppercase tracking-[0.18em] text-[#596773] min-[360px]:block">A quiet public space</span>
    </NavLink>
    <nav aria-label="Primary navigation" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <NavLink to="/search" className={navLinkClass}>Search</NavLink>
      <NavLink to="/history" className={navLinkClass}>History</NavLink>
    </nav>
  </header>
}
