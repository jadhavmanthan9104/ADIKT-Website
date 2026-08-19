"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { flushSync } from "react-dom"
import { usePathname } from "next/navigation"

export type Theme = "dark" | "light"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme, event?: React.MouseEvent | MouseEvent | null) => void
  toggleTheme: (event?: React.MouseEvent | MouseEvent | null) => void
  isDark: boolean
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STOREFRONT_THEME_STORAGE_KEY = "adikt_storefront_theme"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STOREFRONT_THEME_STORAGE_KEY) as Theme | null
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme)
        if (!isAdmin) {
          applyStorefrontTheme(savedTheme)
        }
      } else {
        if (!isAdmin) {
          applyStorefrontTheme("dark")
        }
      }
    } catch {
      if (!isAdmin) {
        applyStorefrontTheme("dark")
      }
    }
  }, [pathname, isAdmin])

  const applyStorefrontTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "light") {
      root.classList.remove("dark")
      root.classList.add("light")
      root.setAttribute("data-theme", "light")
      root.style.colorScheme = "light"
    } else {
      root.classList.remove("light")
      root.classList.add("dark")
      root.setAttribute("data-theme", "dark")
      root.style.colorScheme = "dark"
    }
  }

  const triggerRippleThemeTransition = (
    newTheme: Theme,
    event?: React.MouseEvent | MouseEvent | null
  ) => {
    if (typeof window === "undefined") return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2

    if (event) {
      if (event.currentTarget && typeof (event.currentTarget as HTMLElement).getBoundingClientRect === "function") {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
        x = rect.left + rect.width / 2
        y = rect.top + rect.height / 2
      } else if (typeof event.clientX === "number" && (event.clientX !== 0 || event.clientY !== 0)) {
        x = event.clientX
        y = event.clientY
      }
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const doc = document as Document & {
      startViewTransition?: (callback: () => void | Promise<void>) => {
        ready: Promise<void>
        finished: Promise<void>
      }
    }

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (typeof doc.startViewTransition === "function" && !isReducedMotion) {
      try {
        const transition = doc.startViewTransition(() => {
          flushSync(() => {
            setThemeState(newTheme)
          })
          applyStorefrontTheme(newTheme)
        })

        transition.ready
          .then(() => {
            const clipPath = [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ]

            document.documentElement.animate(
              {
                clipPath: clipPath,
              },
              {
                duration: 500,
                easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            )
          })
          .catch(() => {
            applyStorefrontTheme(newTheme)
          })
        return
      } catch {
        // fallback
      }
    }

    // Smooth CSS fallback if View Transitions not available
    const root = document.documentElement
    root.classList.add("theme-transitioning")
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)

    setThemeState(newTheme)
    applyStorefrontTheme(newTheme)

    transitionTimeoutRef.current = setTimeout(() => {
      root.classList.remove("theme-transitioning")
    }, 450)
  }

  const setTheme = (newTheme: Theme, event?: React.MouseEvent | MouseEvent | null) => {
    if (newTheme === theme) return

    if (!isAdmin) {
      triggerRippleThemeTransition(newTheme, event)
    } else {
      setThemeState(newTheme)
      applyStorefrontTheme(newTheme)
    }

    try {
      localStorage.setItem(STOREFRONT_THEME_STORAGE_KEY, newTheme)
    } catch {
      // ignore
    }
  }

  const toggleTheme = (event?: React.MouseEvent | MouseEvent | null) => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme, event)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
        isLight: theme === "light",
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    return {
      theme: "dark",
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: true,
      isLight: false,
    }
  }
  return context
}

