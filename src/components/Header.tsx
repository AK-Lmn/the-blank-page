import { NavLink } from "react-router"

export default function Header() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#72a5c0] ${
      isActive
        ? "border-[#2f556a] bg-[#2f556a] text-[#edf4f7]"
        : "border-[#c5ccd3] bg-[#f1f2f4]/75 text-[#434d56] hover:border-[#8c9aa6] hover:bg-white"
    }`

  return <header className="flex items-center justify-between py-6 sm:py-9">
    <NavLink to="/" className="group text-left" aria-label="The Blank Page home">
      <span className="font-display block text-[1.25rem] leading-none tracking-[-0.04em] text-[#141a1f] sm:text-[1.45rem]">The Blank Page</span>
      <span className="mt-1 block text-[0.66rem] font-medium uppercase tracking-[0.18em] text-[#6f8190]">A temporary public space</span>
    </NavLink>
    <nav className="flex items-center gap-2">
      <NavLink to="/search" className={navLinkClass}>Search</NavLink>
      <NavLink to="/history" className={navLinkClass}>History</NavLink>
    </nav>
  </header>
}
