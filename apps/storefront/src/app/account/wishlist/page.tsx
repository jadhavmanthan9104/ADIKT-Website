"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useWishlist, WishlistItem } from "@/components/providers/WishlistContext"
import { formatPrice } from "@/lib/formatters"
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Check,
  Zap,
} from "@/components/ui/Icons"
import { EmptyState } from "@/components/ui/EmptyState"

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, moveToCart, clearWishlist, refreshAvailability } =
    useWishlist()
  const [movingId, setMovingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})

  useEffect(() => {
    refreshAvailability()
  }, [refreshAvailability])

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }))
  }

  const handleMoveToBag = (item: WishlistItem) => {
    const size = selectedSizes[item.id] || item.selectedSize || item.sizes.find((s) => s.inStock)?.size || "L"
    setMovingId(item.id)

    const success = moveToCart(item, size)
    if (success) {
      setSuccessMessage(`Moved "${item.title}" (${size}) to your Shopping Bag!`)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
    setMovingId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Account Dashboard
        </Link>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-medium"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="space-y-1 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Curated Vault
          </span>
          <span className="text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
            {wishlistItems.length} Saved {wishlistItems.length === 1 ? "Piece" : "Pieces"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
          My Saved Wishlist
        </h1>
        <p className="text-xs text-zinc-400">
          Saved silhouettes for future drops and seamless 1-click cart transfer.
        </p>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Wishlist Items Grid */}
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const isOutOfStock = item.sizes && item.sizes.every((s) => !s.inStock)
            const activeSize =
              selectedSizes[item.id] ||
              item.selectedSize ||
              item.sizes.find((s) => s.inStock)?.size ||
              "L"
            const activeSizeObj = item.sizes?.find((s) => s.size === activeSize)
            const isCurrentSizeInStock = activeSizeObj?.inStock ?? true

            if (item.isDeleted) {
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <AlertCircle className="h-4 w-4" />
                      <span>Product Archived</span>
                    </div>
                    <p className="text-sm font-bold text-white line-clamp-1">{item.title}</p>
                    <p className="text-xs text-zinc-500">
                      This piece is no longer available in the active collection.
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              )
            }

            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[3/4] bg-zinc-950 overflow-hidden">
                  <Link href={`/products/${item.handle || item.id}`}>
                    <Image
                      src={
                        item.images?.[0] ||
                        (item as any).thumbnail ||
                        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Top Floating Badges */}
                  {isOutOfStock && (
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded bg-red-950/80 backdrop-blur-md text-[10px] font-bold text-red-400 border border-red-800/40">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-zinc-400 hover:text-red-400 border border-white/10 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <Link
                      href={`/products/${item.handle || item.id}`}
                      className="text-xs font-bold text-white hover:text-accent transition-colors line-clamp-1 block"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-white font-display">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-zinc-500 line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Size Selector */}
                  {item.sizes && item.sizes.length > 0 && !isOutOfStock && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Select Size:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.sizes.map((s) => (
                          <button
                            key={s.size}
                            disabled={!s.inStock}
                            onClick={() => handleSizeChange(item.id, s.size)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                              activeSize === s.size
                                ? "bg-white text-black border-white"
                                : s.inStock
                                ? "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600"
                                : "bg-zinc-950/40 text-zinc-600 border-zinc-900 line-through cursor-not-allowed"
                            }`}
                          >
                            {s.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Move to Bag Button */}
                  <div className="pt-2">
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-zinc-800/50 text-zinc-600 text-xs font-bold uppercase cursor-not-allowed border border-zinc-800"
                      >
                        Out of Stock
                      </button>
                    ) : !isCurrentSizeInStock ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-zinc-800/50 text-zinc-600 text-xs font-bold uppercase cursor-not-allowed border border-zinc-800"
                      >
                        Size {activeSize} Sold Out
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMoveToBag(item)}
                        disabled={movingId === item.id}
                        className="w-full py-2.5 rounded-xl bg-[#9A0000] hover:bg-[#7a0000] text-white text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#9A0000]/30"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Move to Bag ({activeSize})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="h-10 w-10 text-zinc-600" />}
          title="Your Vault is Empty"
          description="Save high-GSM tees, hoodies, and cargo pants by tapping the heart icon on any drop in the catalog."
          actionLabel="Explore Current Drops"
          actionHref="/shop"
        />
      )}
    </div>
  )
}
