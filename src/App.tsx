import { useEffect, useRef } from "react"
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router"
import Header from "./components/Header"
import Entry from "./pages/Entry"
import History from "./pages/History"
import Home from "./pages/Home"
import Search from "./pages/Search"
import Write from "./pages/Write"

function AppLayout() {
  const location = useLocation()
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#f1f2f4] text-[#28343e] selection:bg-[#b9d2df] selection:text-[#141a1f]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 sm:px-8 lg:px-14">
        <Header />
        <main
          id="main-content"
          ref={contentRef}
          tabIndex={-1}
          className="focus:outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Home },
      { path: "write", Component: Write },
      { path: "search", Component: Search },
      { path: "entry/:id", Component: Entry },
      { path: "history", Component: History },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
