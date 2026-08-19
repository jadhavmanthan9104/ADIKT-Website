"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/formatters"
import { Heart, ShoppingBag, X, Check } from "@/components/ui/Icons"
import { useWishlist } from "@/components/providers/WishlistContext"
import { useCart } from "@/components/providers/CartContext"

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
  fabric?: string | null
  weave?: string | null
  modelInfo?: string | null
  care?: string[] | null
  category?: string
  inStock?: boolean
  sizes?: { size: string; inStock: boolean; stockCount?: number }[]
  colors?: { name: string; hex: string; images?: string[] }[]
  variants?: {
    id: string
    title: string
    sku: string
    size: string
    color: string
    inventory: number
    price: number
    images?: string[]
  }[]
  isGstIncluded?: boolean
  gstType?: "percentage" | "amount"
  gstRate?: number
}

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"]

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
    fabric,
    weave,
    modelInfo,
    care,
    category,
    inStock = true,
    sizes = [],
    colors = [],
    variants = [],
    isGstIncluded,
    gstType,
    gstRate,
  } = props

  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()

  const [isSizeSelectorOpen, setIsSizeSelectorOpen] = useState<boolean>(false)
  const [selectedColor, setSelectedColor] = useState<string>(
    colors[0]?.name || (variants[0]?.color && variants[0].color !== "Standard" ? variants[0].color : "Standard")
  )
  const [addedSize, setAddedSize] = useState<string | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnterCard = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handleMouseLeaveCard = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsSizeSelectorOpen(false)
    }, 200)
  }

  // Determine active thumbnail based on selected color if available
  const activeColorObj = colors.find((c) => c.name.toLowerCase() === selectedColor.toLowerCase())
  const defaultImage =
    (activeColorObj?.images && activeColorObj.images[0]) ||
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
      gsm: gsm || 240,
      fit: fit || "Oversized Boxy",
      fabric: fabric || "100% Combed Compact Cotton",
      weave: weave || "Single Jersey",
      modelInfo: modelInfo || "Model wearing size L",
      care: care || ["Machine wash cold"],
      colors: colors.length > 0 ? colors : [{ name: selectedColor, hex: "#18181b" }],
      sizes: sizes.length > 0 ? sizes.map((s) => ({ ...s, stockCount: s.stockCount ?? 5 })) : [{ size: "L", inStock: true, stockCount: 5 }],
      images: [defaultImage],
      inStock,
      category: (category as "tees" | "hoodies" | "cargos" | "sweats" | "accessories") || "tees",
    })
  }

  // Check if a size is available in stock for the currently selected color
  const checkSizeInStock = (sizeName: string) => {
    if (variants && variants.length > 0) {
      const matchingVariants = variants.filter(
        (v) =>
          v.size.toUpperCase() === sizeName.toUpperCase() &&
          (!selectedColor ||
            v.color.toLowerCase() === selectedColor.toLowerCase() ||
            v.color.toLowerCase() === "standard" ||
            selectedColor === "Standard")
      )
      if (matchingVariants.length > 0) {
        return matchingVariants.some((v) => v.inventory > 0)
      }
    }

    if (sizes && sizes.length > 0) {
      const s = sizes.find((sz) => sz.size.toUpperCase() === sizeName.toUpperCase())
      if (s) {
        return s.inStock
      }
    }

    return inStock
  }

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault()
    e.stopPropagation()

    const coords = { x: e.clientX, y: e.clientY }
    const activeColor = selectedColor || (colors && colors[0]?.name) || "Standard"

    addToCart(
      {
        productId: id,
        title,
        handle,
        variantTitle: `${size} / ${activeColor}`,
        size,
        color: activeColor,
        price,
        originalPrice: originalPrice || undefined,
        quantity: 1,
        thumbnail: defaultImage,
        isGstIncluded: isGstIncluded ?? true,
        gstType: gstType || "percentage",
        gstRate,
      },
      true,
      coords
    )

    setAddedSize(size)
    setTimeout(() => {
      setAddedSize(null)
      setIsSizeSelectorOpen(false)
    }, 500)
  }

  return (
    <div
      className="group block relative space-y-3"
      onMouseEnter={handleMouseEnterCard}
      onMouseLeave={handleMouseLeaveCard}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm transition-all duration-300">
        <Link href={`/products/${handle}`} className="block h-full w-full">
          <Image
            src={defaultImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges (Discount % OFF) */}
        {discountPercent && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
            <span className="bg-[#9A0000] text-[10px] font-black text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorited
              ? "bg-[#9A0000] text-white shadow-md shadow-[#9A0000]/40 scale-105"
              : "bg-black/40 hover:bg-black/80 text-white/90 border border-white/10"
          }`}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add Trigger Button (Desktop Hover) */}
        {inStock && (
          <div
            className={`absolute inset-x-3 bottom-3 transition-all duration-200 hidden sm:block z-10 ${
              isSizeSelectorOpen ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100 pointer-events-auto"
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleMouseEnterCard()
                setIsSizeSelectorOpen(true)
              }}
              className="quick-add-trigger-btn w-full py-2.5 rounded-xl bg-white/95 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-1.5 transition-all hover:shadow-2xl active:scale-95 border border-white/40"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
            </button>
          </div>
        )}

        {/* Mobile Quick Add Floating Button */}
        {inStock && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsSizeSelectorOpen((prev) => !prev)
            }}
            className={`sm:hidden absolute bottom-2.5 right-2.5 p-2.5 rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-all border z-10 ${
              isSizeSelectorOpen
                ? "bg-zinc-800 text-white border-white/20"
                : "bg-white/95 text-zinc-950 border-white/40"
            }`}
            aria-label="Quick Add"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Luxury Glassmorphism Size Selector Tray with Seamless Flush Bottom and Slide-Up Animation */}
        <div
          className={`quick-add-size-tray absolute inset-x-0 bottom-0 -bottom-1 bg-white dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/15 p-3.5 pb-4 z-20 space-y-2.5 transition-all duration-300 ease-out shadow-2xl ${
            isSizeSelectorOpen
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-full opacity-0 pointer-events-none"
          }`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {/* Tray Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-200">
              Select Size
            </span>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsSizeSelectorOpen(false)
              }}
              className="close-tray-btn p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-white/10 dark:hover:bg-white/20 dark:text-zinc-300 dark:hover:text-white transition-colors"
              aria-label="Close size selector"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Color Swatches (if multiple colors available) */}
          {colors && colors.length > 1 && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate max-w-[120px]">
                {selectedColor}
              </span>
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedColor(c.name)
                    }}
                    className={`h-4 w-4 rounded-full border transition-all ${
                      selectedColor.toLowerCase() === c.name.toLowerCase()
                        ? "border-zinc-900 dark:border-white scale-125 ring-2 ring-[#9A0000]"
                        : "border-zinc-300 dark:border-zinc-600 hover:scale-110"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Buttons Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {ALL_SIZES.map((size) => {
              const isSizeInStock = checkSizeInStock(size)
              const isJustAdded = addedSize === size

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!isSizeInStock}
                  onClick={(e) => handleSelectSize(e, size)}
                  className={`size-pill-btn h-9 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center ${
                    isJustAdded
                      ? "btn-added bg-[#9A0000] text-white border border-[#9A0000] shadow-lg scale-105 ring-2 ring-white/20"
                      : isSizeInStock
                      ? "bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-900 border border-zinc-200/90 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black dark:text-white dark:border-white/15 active:scale-95 shadow-sm"
                      : "bg-zinc-50 text-zinc-300 border border-zinc-200/40 dark:bg-transparent dark:text-zinc-600 dark:border-white/5 cursor-not-allowed line-through opacity-40"
                  }`}
                >
                  {isJustAdded ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <span>{size}</span>}
                </button>
              )
            })}
          </div>

          {/* Feedback message / Direct Link */}
          <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500 dark:text-zinc-400 pt-0.5">
            <span>{addedSize ? <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Added size {addedSize}! ✓</span> : "1-Tap Add"}</span>
            <Link
              href={`/products/${handle}`}
              onClick={(e) => e.stopPropagation()}
              className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white underline underline-offset-2 transition-colors"
            >
              Details →
            </Link>
          </div>
        </div>

        {/* Sold Out Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
            <span className="bg-zinc-900/90 text-xs font-bold text-white px-3 py-1 rounded-full uppercase tracking-wider border border-white/10 shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {fit && (
          <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {fit}
          </p>
        )}
        <Link href={`/products/${handle}`} className="block">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-[#9A0000] transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-extrabold text-zinc-900 dark:text-white">{formatPrice(price)}</span>
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
