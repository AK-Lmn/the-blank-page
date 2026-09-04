export type Theme = "light" | "dark" | "system"

const themeStorageKey = "the-blank-page-theme"

export function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(themeStorageKey)
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved
    }
  } catch {
    // Storage access might be restricted in private mode
  }
  return "system"
}

export function setSavedTheme(theme: Theme): void {
  try {
    localStorage.setItem(themeStorageKey, theme)
  } catch {
    // Storage access might be restricted
  }
}

export function isSystemDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function applyTheme(theme: Theme): boolean {
  if (typeof document === "undefined") return false
  const isDark = theme === "dark" || (theme === "system" && isSystemDark())
  if (isDark) {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
  return isDark
}
