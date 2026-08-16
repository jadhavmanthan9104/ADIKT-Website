"use client"

import React, { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product/ProductCard"
import { Search, X } from "@/components/ui/Icons"
import { EmptyState } from "@/components/ui/EmptyState"
import { STORE_PRODUCTS } from "@/lib/store-api"

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)

  const searchTerms = ["280 GSM", "French Terry", "Oversized", "Acid Wash", "Ripstop Cargos", "Bone White"]

  const results = useMemo(() => {
    if (!query.trim()) return STORE_PRODUCTS
    const q = query.toLowerCase()
    return STORE_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.fit.toLowerCase().includes(q) ||
        String(p.gsm).includes(q)
    )
  }, [query])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Instant Discovery
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Search Silhouettes
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            type="text"
            autoFocus
            placeholder="Search by fabric, fit, GSM, or garment title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-10 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent shadow-xl"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Popular Keyword Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-zinc-500 font-medium">Trending:</span>
          {searchTerms.map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 text-xs">
        <span className="text-zinc-400 font-bold uppercase tracking-wider">
          {query ? `Results for "${query}" (${results.length})` : `All Silhouettes (${results.length})`}
        </span>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-accent hover:underline font-bold uppercase"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Results Grid or Empty State */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Results Found"
          description={`We couldn't find any silhouettes matching "${query}". Try searching for keywords like "280 GSM", "Hoodie", or "Cargos".`}
          actionLabel="Clear Search"
          onAction={() => setQuery("")}
        />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500 text-xs uppercase">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}
