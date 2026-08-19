export const dynamic = "force-dynamic"

import React from "react"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="max-w-md space-y-6">
        <span className="text-xs font-black uppercase tracking-widest text-accent">
          404 // Drop Not Found
        </span>
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white font-display">
          Page Does Not Exist
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          The piece, category, or archival silhouette you are looking for has been moved or does not exist.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl inline-flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-accent/20"
          >
            <ShoppingBag className="h-4 w-4" /> Shop All Garments
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold uppercase rounded-xl inline-flex items-center justify-center gap-2 transition-colors"
          >
            Back to Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
