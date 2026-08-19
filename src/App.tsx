import { createBrowserRouter, Outlet, RouterProvider } from "react-router"
import Header from "./components/Header"
import Entry from "./pages/Entry"
import History from "./pages/History"
import Home from "./pages/Home"
import Search from "./pages/Search"
import Write from "./pages/Write"

function AppLayout() {
    return <main className="min-h-screen bg-[#f1f2f4] text-[#28343e] selection:bg-[#b9d2df] selection:text-[#141a1f]"><div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 sm:px-8 lg:px-14"><Header /><Outlet /></div></main>
}

const router = createBrowserRouter([{ path: "/", Component: AppLayout, children: [{ index: true, Component: Home }, { path: "write", Component: Write }, { path: "search", Component: Search }, { path: "entry/:id", Component: Entry }, { path: "history", Component: History }] }])

export default function App() {
    return <RouterProvider router={router} />
}
