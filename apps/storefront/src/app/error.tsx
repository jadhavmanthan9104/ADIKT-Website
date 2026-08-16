"use client"

import React from "react"
import Link from "next/link"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <span className="text-xs font-bold uppercase tracking-widest text-accent">Error 500</span>
      <h1 className="text-4xl font-black uppercase tracking-tight text-white font-display">
        System Hiccup
      </h1>
      <p className="text-sm text-zinc-400">
        We encountered an unexpected error while loading this silhouette. Our engineering team has been alerted.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-white text-black font-bold uppercase rounded-lg text-xs"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold uppercase rounded-lg text-xs"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
