import { useTheme } from "../lib/ThemeContext"

export default function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme()

  function toggle() {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark")
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
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md px-3 py-2 text-[#434d56] dark:text-[#c9d1d9] transition-all hover:-translate-y-0.5 hover:border-[#8c9aa6] hover:bg-white/90 dark:hover:bg-white/20 hover:text-[#141a1f] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#72a5c0]"
    >
      {isDark ? (
        // Crescent Moon Icon
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-none stroke-currentColor stroke-[1.8]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          />
        </svg>
      ) : (
        // Soft Sun Icon
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-none stroke-currentColor stroke-[1.8]"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"
          />
        </svg>
      )}
      {theme === "system" && (
        <span
          aria-hidden="true"
          className="ml-1.5 text-[0.62rem] font-medium tracking-wider text-[#8a718e] dark:text-[#d8b4e2]"
        >
          AUTO
        </span>
      )}
    </button>
  )
}
