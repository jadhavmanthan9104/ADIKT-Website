"use client"

import React, { useRef } from "react"
import { StoreProduct } from "@/lib/catalog-data"
import { CmsCollectionSection } from "@/lib/content-store"
import { ProductCard } from "@/components/product/ProductCard"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

interface CollectionProductCarouselProps {
  section: CmsCollectionSection
  allProducts: StoreProduct[]
}

export function CollectionProductCarousel({
  section,
  allProducts,
}: CollectionProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const colHandleLower = (section.collectionHandle || "").toLowerCase().trim()

  // Filter products for this collection
  let matchedProducts = allProducts.filter((p) => {
    const pColHandle = (p.collectionHandle || "").toLowerCase()
    const pColTitle = ((p as any).collection || "").toLowerCase()
    return (
      pColHandle === colHandleLower ||
      pColTitle === colHandleLower ||
      pColTitle.replace(/\s+/g, "-") === colHandleLower ||
      colHandleLower.replace(/\s+/g, "-") === pColHandle
    )
  })

  // If no products matched directly, fallback to top products to ensure a rich carousel is always populated
  if (matchedProducts.length === 0) {
    matchedProducts = allProducts.slice(0, 6)
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          {section.badge && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-[#9A0000] text-white px-2.5 py-0.5 rounded-full shadow-md">
                <Sparkles className="h-2.5 w-2.5" />
                {section.badge}
              </span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-display">
            {section.heading}
          </h2>
          {section.subheading && (
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {section.subheading}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Carousel Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track with Strict Equal Card Widths */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {matchedProducts.map((product) => (
          <div
            key={product.id}
            className="w-[240px] sm:w-[270px] md:w-[290px] shrink-0 snap-start"
          >
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </section>
  )
}
