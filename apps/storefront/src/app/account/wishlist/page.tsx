"use client"

import React from "react"
import Link from "next/link"
import { useWishlist } from "@/components/providers/WishlistContext"
import { ProductCard } from "@/components/product/ProductCard"
import { ArrowLeft, Heart } from "@/components/ui/Icons"
import { EmptyState } from "@/components/ui/EmptyState"

export default function WishlistPage() {
  const { wishlistItems } = useWishlist()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <Link href="/account" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div className="space-y-1 pb-6 border-b border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Curated Favourites</span>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
          My Saved Wishlist ({wishlistItems.length})
        </h1>
        <p className="text-xs text-zinc-400">Save pieces for upcoming drops and price drop alerts</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="h-10 w-10 text-zinc-600" />}
          title="Your Wishlist is Empty"
          description="Save pieces you love by tapping the heart icon on any silhouette in the catalog."
          actionLabel="Explore New Drops"
          actionHref="/shop"
        />
      )}
    </div>
  )
}
