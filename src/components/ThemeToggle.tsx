import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "../lib/ThemeContext"

export default function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme()

  function toggle() {
    if (theme === "system") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("system")
    }
  }

  const label =
    theme === "system"
      ? `Theme: System (${isDark ? "Dark" : "Light"})`
      : theme === "dark"
        ? "Theme: Dark"
        : "Theme: Light"

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md p-2.5 text-[#434d56] dark:text-[#c9d1d9] transition-all hover:-translate-y-0.5 hover:border-[#8c9aa6] hover:bg-white/90 dark:hover:bg-white/20 hover:text-[#141a1f] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
    >
      {theme === "system" ? (
        <Monitor className="h-4 w-4" />
      ) : theme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  )
}
