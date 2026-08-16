import React from "react"

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-[3/4] w-full rounded-lg bg-zinc-900 border border-zinc-800" />
      <div className="space-y-2">
        <div className="h-3 w-16 bg-zinc-800 rounded" />
        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        <div className="h-4 w-20 bg-zinc-800 rounded" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-pulse space-y-8">
      <div className="h-4 w-48 bg-zinc-800 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-900 border border-zinc-800" />
          <div className="grid grid-cols-3 gap-3">
            <div className="aspect-square rounded-lg bg-zinc-900" />
            <div className="aspect-square rounded-lg bg-zinc-900" />
            <div className="aspect-square rounded-lg bg-zinc-900" />
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-8 w-3/4 bg-zinc-800 rounded" />
          <div className="h-6 w-32 bg-zinc-800 rounded" />
          <div className="h-10 w-full bg-zinc-900 rounded-lg" />
          <div className="h-12 w-full bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function OrderTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((idx) => (
        <div key={idx} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex justify-between">
            <div className="h-4 w-32 bg-zinc-800 rounded" />
            <div className="h-4 w-20 bg-zinc-800 rounded" />
          </div>
          <div className="h-12 w-full bg-zinc-950 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
