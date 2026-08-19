"use client"

import React, { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { useAdminTheme } from "@/components/providers/AdminThemeContext"

export function AdminThemeToggle() {
  const { adminTheme, toggleAdminTheme, isAdminDark } = useAdminTheme()
  const [mounted, setMounted] = useState(false)
  const [isRippling, setIsRippling] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsRippling(true)
    setTimeout(() => setIsRippling(false), 500)
    toggleAdminTheme(e)
  }

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center justify-center p-2 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 active:scale-90 text-zinc-300 hover:text-white transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/40 overflow-hidden group cursor-pointer"
      aria-label={`Switch to ${isAdminDark ? "light" : "dark"} mode for Admin`}
      title={`Admin Theme: currently ${adminTheme} mode (Click to switch)`}
      suppressHydrationWarning
    >
      {/* Subtle button internal ripple glow */}
      {isRippling && (
        <span className="absolute inset-0 rounded-xl bg-accent/25 animate-ping pointer-events-none" />
      )}

      <div className="relative w-4 h-4 flex items-center justify-center pointer-events-none">
        <Sun
          className={`h-4 w-4 text-amber-400 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
            mounted && isAdminDark
              ? "opacity-100 rotate-0 scale-100 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
              : "opacity-0 rotate-180 scale-0"
          }`}
        />
        <Moon
          className={`h-4 w-4 text-indigo-400 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
            mounted && !isAdminDark
              ? "opacity-100 rotate-0 scale-100 filter drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]"
              : "opacity-0 -rotate-180 scale-0"
          }`}
        />
      </div>
      <span className="sr-only">Toggle Admin Theme</span>
    </button>
  )
}

