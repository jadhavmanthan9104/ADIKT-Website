import React from "react"
import Link from "next/link"
import { ArrowRight } from "./Icons"

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel = "Explore Drops",
  actionHref = "/shop",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 sm:py-24 px-4 max-w-md mx-auto space-y-5">
      {icon && <div className="flex justify-center text-zinc-500">{icon}</div>}
      <div className="space-y-2">
        <h3 className="text-xl font-bold uppercase tracking-tight text-white">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      </div>

      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-extrabold uppercase rounded-lg text-xs tracking-wider transition-transform active:scale-95"
        >
          {actionLabel} <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-extrabold uppercase rounded-lg text-xs tracking-wider transition-transform active:scale-95"
        >
          {actionLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
