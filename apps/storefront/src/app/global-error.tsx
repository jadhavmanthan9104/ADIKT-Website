"use client"

import React from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Critical Error
          </h1>
          <p className="text-sm text-zinc-400">
            A critical error occurred while rendering the application.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-white text-black font-bold uppercase rounded-lg text-xs"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  )
}
