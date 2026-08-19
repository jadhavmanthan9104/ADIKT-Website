"use client"

import React, { useEffect } from "react"
import { X } from "lucide-react"

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "lg",
}: AdminModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const widthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full ${widthClass} rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-5 relative max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold uppercase text-white font-display tracking-tight">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  )
}
