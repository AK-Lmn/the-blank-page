import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  applyTheme,
  getSavedTheme,
  isSystemDark,
  setSavedTheme,
  type Theme,
} from "./theme"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  typingActive: boolean
  triggerTypingGlow: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  isDark: false,
  typingActive: false,
  triggerTypingGlow: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getSavedTheme())
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = getSavedTheme()
    return saved === "dark" || (saved === "system" && isSystemDark())
  })
  const [typingActive, setTypingActive] = useState(false)
  const typingTimer = useRef<number | null>(null)

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    setSavedTheme(nextTheme)
    const activeDark = applyTheme(nextTheme)
    setIsDark(activeDark)
  }, [])

  useEffect(() => {
    const activeDark = applyTheme(theme)
    setIsDark(activeDark)

    if (typeof window === "undefined" || !window.matchMedia) return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = () => {
      if (getSavedTheme() === "system") {
        const nextDark = applyTheme("system")
        setIsDark(nextDark)
      }
    }

    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [theme])

  const triggerTypingGlow = useCallback(() => {
    setTypingActive(true)
    if (typingTimer.current !== null) {
      window.clearTimeout(typingTimer.current)
    }
    typingTimer.current = window.setTimeout(() => {
      setTypingActive(false)
    }, 1200)
  }, [])

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, isDark, typingActive, triggerTypingGlow }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
