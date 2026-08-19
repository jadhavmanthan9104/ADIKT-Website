"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "@/components/providers/ThemeProvider"
import { Sun, Moon } from "@/components/ui/Icons"

interface ThemeToggleProps {
  variant?: "pill" | "button"
  className?: string
}

export function ThemeToggle({ variant = "pill", className = "" }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, isDark, isLight } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={(e) => toggleTheme(e)}
        suppressHydrationWarning
        className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all duration-300 group overflow-hidden ${className}`}
        aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {/* Moon Icon */}
          <Moon
            className={`h-4 w-4 text-indigo-300 absolute transition-all duration-300 ease-out transform ${
              mounted && isDark
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-50"
            }`}
          />
          {/* Sun Icon */}
          <Sun
            className={`h-4 w-4 text-amber-500 absolute transition-all duration-300 ease-out transform ${
              mounted && isLight
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-90 scale-50"
            }`}
          />
        </div>
      </button>
    )
  }

  // Consistent DOM structure between SSR and client to prevent any hydration mismatch
  const activeDark = !mounted || isDark
  const activeLight = mounted && isLight

  return (
    <div
      role="group"
      aria-label="Theme mode switcher"
      suppressHydrationWarning
      className={`relative inline-flex items-center p-1 rounded-full border text-xs select-none transition-colors duration-300 ${
        activeLight
          ? "bg-[#dedcd5] border-[#c9c7bf]"
          : "bg-zinc-900/90 border-zinc-800"
      } ${className}`}
    >
      {/* Sliding Active Pill Background */}
      <div
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm pointer-events-none"
        style={{
          transform: activeLight ? "translateX(100%)" : "translateX(0%)",
          backgroundColor: activeLight ? "#ffffff" : "#27272a",
          border: activeLight ? "1px solid #dedcd5" : "1px solid rgba(63, 63, 70, 0.8)",
        }}
      />

      {/* Dark Button */}
      <button
        type="button"
        onClick={(e) => setTheme("dark", e)}
        suppressHydrationWarning
        className={`relative z-10 w-16 sm:w-18 py-1 inline-flex items-center justify-center gap-1.5 rounded-full transition-colors duration-200 ${
          activeDark
            ? "text-white font-bold"
            : activeLight
            ? "text-zinc-600 hover:text-zinc-900 font-medium"
            : "text-zinc-400 hover:text-zinc-200 font-medium"
        }`}
        aria-pressed={activeDark}
      >
        <Moon
          className={`h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            activeDark ? "text-indigo-300 scale-110 -rotate-12" : "text-zinc-400 scale-95"
          }`}
        />
        <span>Dark</span>
      </button>

      {/* Light Button */}
      <button
        type="button"
        onClick={(e) => setTheme("light", e)}
        suppressHydrationWarning
        className={`relative z-10 w-16 sm:w-18 py-1 inline-flex items-center justify-center gap-1.5 rounded-full transition-colors duration-200 ${
          activeLight
            ? "text-[#121214] font-bold"
            : "text-zinc-400 hover:text-zinc-200 font-medium"
        }`}
        aria-pressed={activeLight}
      >
        <Sun
          className={`h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            activeLight ? "text-amber-500 scale-110 rotate-45" : "text-zinc-400 scale-95"
          }`}
        />
        <span>Light</span>
      </button>
    </div>
  )
}
