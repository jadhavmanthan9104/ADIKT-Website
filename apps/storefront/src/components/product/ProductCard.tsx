"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/formatters"
import { Heart, ShoppingBag } from "@/components/ui/Icons"
import { useWishlist } from "@/components/providers/WishlistContext"
import { useCart } from "@/components/providers/CartContext"
import { StoreProduct } from "@/lib/store-api"

export interface ProductCardProps {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  images?: string[]
  price: number
  originalPrice?: number | null
  gsm?: number | null
  fit?: string | null
  category?: string
  inStock?: boolean
}

export function ProductCard(props: ProductCardProps) {
  const {
    id,
    title,
    handle,
    thumbnail,
    images = [],
    price,
    originalPrice,
    gsm,
    fit,
    inStock = true,
  } = props

  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()

  const defaultImage =
    thumbnail ||
    images[0] ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  const isFavorited = isInWishlist(id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist({
      id,
      title,
      handle,
      price,
      originalPrice: originalPrice || undefined,
      gsm: gsm || 280,
      fit: fit || "Oversized Boxy",
      fabric: "100% Combed Compact Cotton",
      weave: "Single Jersey",
      modelInfo: "Model wearing size L",
      care: ["Machine wash cold"],
      colors: [{ name: "Vintage Black", hex: "#18181b" }],
      sizes: [{ size: "L", inStock: true, stockCount: 5 }],
      images: [defaultImage],
      inStock,
      category: "tees",
    })
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      productId: id,
      title,
      handle,
      variantTitle: "L / Standard",
      size: "L",
      color: "Standard",
      price,
      originalPrice: originalPrice || undefined,
      quantity: 1,
      thumbnail: defaultImage,
    })
  }

  return (
    <div className="group block relative space-y-3">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/80">
        <Link href={`/products/${handle}`} className="block h-full w-full">
          <Image
            src={defaultImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges (GSM / Fit / Discount) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
          {gsm && (
            <span className="bg-black/80 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider">
              {gsm} GSM
            </span>
          )}
          {discountPercent && (
            <span className="bg-accent text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorited
              ? "bg-accent text-white"
              : "bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90"
          }`}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add Button on Hover */}
        {inStock && (
          <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 rounded-lg bg-white/95 hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Quick Add (Size L)
            </button>
          </div>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <span className="bg-zinc-800 text-xs font-bold text-white px-3 py-1 rounded uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {fit && (
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            {fit}
          </p>
        )}
        <Link href={`/products/${handle}`}>
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-accent transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-bold text-white">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-zinc-500 line-through text-[11px] sm:text-xs">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
