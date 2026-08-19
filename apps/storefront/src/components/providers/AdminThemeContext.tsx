"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { flushSync } from "react-dom"

export type AdminTheme = "dark" | "light"

interface AdminThemeContextType {
  adminTheme: AdminTheme
  setAdminTheme: (theme: AdminTheme, event?: React.MouseEvent | MouseEvent | null) => void
  toggleAdminTheme: (event?: React.MouseEvent | MouseEvent | null) => void
  isAdminDark: boolean
  isAdminLight: boolean
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined)

const ADMIN_THEME_STORAGE_KEY = "adikt_admin_theme"

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [adminTheme, setAdminThemeState] = useState<AdminTheme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(ADMIN_THEME_STORAGE_KEY) as AdminTheme | null
      if (savedTheme === "light" || savedTheme === "dark") {
        setAdminThemeState(savedTheme)
        applyAdminTheme(savedTheme)
      } else {
        applyAdminTheme("dark")
      }
    } catch {
      applyAdminTheme("dark")
    }
    setMounted(true)
  }, [])

  const applyAdminTheme = (theme: AdminTheme) => {
    const root = document.documentElement
    root.setAttribute("data-admin-theme", theme)
    if (theme === "light") {
      root.classList.remove("admin-dark")
      root.classList.add("admin-light")
    } else {
      root.classList.remove("admin-light")
      root.classList.add("admin-dark")
    }
  }

  const triggerOverlayRippleFallback = (
    newTheme: AdminTheme,
    x: number,
    y: number,
    radius: number
  ) => {
    if (typeof window === "undefined") return

    const ripple = document.createElement("div")
    const diameter = Math.ceil(radius * 2)
    ripple.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${diameter}px;
      height: ${diameter}px;
      margin-left: -${radius}px;
      margin-top: -${radius}px;
      border-radius: 50%;
      background-color: ${newTheme === "light" ? "#f6f5f2" : "#09090b"};
      pointer-events: none;
      z-index: 999999;
      transform: scale(0);
      will-change: transform, opacity;
      transition: transform 480ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 180ms ease-out 380ms;
    `
    document.body.appendChild(ripple)

    requestAnimationFrame(() => {
      ripple.style.transform = "scale(1)"
    })

    setTimeout(() => {
      setAdminThemeState(newTheme)
      applyAdminTheme(newTheme)
    }, 220)

    setTimeout(() => {
      ripple.style.opacity = "0"
    }, 380)

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 600)
  }

  const setAdminTheme = (newTheme: AdminTheme, event?: React.MouseEvent | MouseEvent | null) => {
    if (newTheme === adminTheme) return

    if (typeof window !== "undefined") {
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
              setAdminThemeState(newTheme)
            })
            applyAdminTheme(newTheme)
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
              applyAdminTheme(newTheme)
            })

          try {
            localStorage.setItem(ADMIN_THEME_STORAGE_KEY, newTheme)
          } catch {
            // ignore
          }
          return
        } catch {
          // fallback to overlay ripple
        }
      }

      // Fallback ripple if View Transitions are unsupported
      triggerOverlayRippleFallback(newTheme, x, y, endRadius)
    } else {
      setAdminThemeState(newTheme)
      applyAdminTheme(newTheme)
    }

    try {
      localStorage.setItem(ADMIN_THEME_STORAGE_KEY, newTheme)
    } catch {
      // ignore
    }
  }

  const toggleAdminTheme = (event?: React.MouseEvent | MouseEvent | null) => {
    const nextTheme: AdminTheme = adminTheme === "dark" ? "light" : "dark"
    setAdminTheme(nextTheme, event)
  }

  return (
    <AdminThemeContext.Provider
      value={{
        adminTheme,
        setAdminTheme,
        toggleAdminTheme,
        isAdminDark: adminTheme === "dark",
        isAdminLight: adminTheme === "light",
      }}
    >
      <div
        className={`admin-root ${adminTheme} min-h-screen w-full`}
        data-admin-theme={adminTheme}
        suppressHydrationWarning
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme(): AdminThemeContextType {
  const context = useContext(AdminThemeContext)
  if (!context) {
    return {
      adminTheme: "dark",
      setAdminTheme: () => {},
      toggleAdminTheme: () => {},
      isAdminDark: true,
      isAdminLight: false,
    }
  }
  return context
}

