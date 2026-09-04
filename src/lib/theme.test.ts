import { beforeEach, describe, expect, it, vi } from "vitest"
import { applyTheme, getSavedTheme, isSystemDark, setSavedTheme } from "./theme"

describe("theme utilities", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ""
  })

  it("defaults to system theme when nothing is stored", () => {
    expect(getSavedTheme()).toBe("system")
  })

  it("persists and retrieves light and dark preferences", () => {
    setSavedTheme("dark")
    expect(getSavedTheme()).toBe("dark")
    setSavedTheme("light")
    expect(getSavedTheme()).toBe("light")
    setSavedTheme("system")
    expect(getSavedTheme()).toBe("system")
  })

  it("applies dark class when theme is dark", () => {
    const isDark = applyTheme("dark")
    expect(isDark).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("removes dark class when theme is light", () => {
    document.documentElement.classList.add("dark")
    const isDark = applyTheme("light")
    expect(isDark).toBe(false)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("checks system dark mode preference", () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    expect(isSystemDark()).toBe(true)
    const isDark = applyTheme("system")
    expect(isDark).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(true)

    window.matchMedia = originalMatchMedia
  })
})
