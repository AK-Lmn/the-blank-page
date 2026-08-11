import { Link } from "react-router"

export default function Header() {
  return <header className="flex items-center justify-between py-6 sm:py-9">
    <Link to="/" className="group text-left" aria-label="The Blank Page home">
      <span className="font-display block text-[1.25rem] leading-none tracking-[-0.04em] text-[#141a1f] sm:text-[1.45rem]">The Blank Page</span>
      <span className="mt-1 block text-[0.66rem] font-medium uppercase tracking-[0.18em] text-[#6f8190]">A temporary public space</span>
    </Link>
    <Link to="/history" className="rounded-full border border-[#c5ccd3] bg-[#f1f2f4]/75 px-4 py-2 text-sm text-[#434d56] transition hover:border-[#8c9aa6] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0]">Recent submissions</Link>
  </header>
}
