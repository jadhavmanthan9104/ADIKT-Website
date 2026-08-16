"use client"

import React, { useState } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/formatters"
import { SizeChartModal } from "@/components/product/SizeChartModal"
import { ProductGallery } from "@/components/product/ProductGallery"
import {
  Ruler,
  Truck,
  Check,
  ShoppingBag,
  Heart,
  ShieldCheck,
  RefreshCw,
} from "@/components/ui/Icons"
import { useCart } from "@/components/providers/CartContext"
import { useWishlist } from "@/components/providers/WishlistContext"
import { StoreProduct } from "@/lib/store-api"

export interface ProductDetailViewProps {
  product: StoreProduct
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.find((s) => s.inStock)?.size || product.sizes[0]?.size || "L"
  )
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || "Vintage Black"
  )
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false)
  const [pincode, setPincode] = useState<string>("")
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState<boolean>(false)

  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const isFavorited = isInWishlist(product.id)
  const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize)
  const isSelectedInStock = selectedSizeObj?.inStock ?? true

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault()
    if (pincode.length === 6) {
      setDeliveryStatus(
        "✅ Express Delivery available in 2-3 business days (Bluedart/Delhivery). COD eligible."
      )
    } else {
      setDeliveryStatus("❌ Please enter a valid 6-digit Indian PIN code.")
    }
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      handle: product.handle,
      variantTitle: `${selectedSize} / ${selectedColor}`,
      size: selectedSize,
      color: selectedColor,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      thumbnail: product.images[0] || "",
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-400 flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white">Catalog</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-white capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-white font-medium truncate">{product.title}</span>
      </nav>

      {/* Product Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Interactive Garment Gallery (7 cols) */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            title={product.title}
            gsm={product.gsm}
            fit={product.fit}
          />
        </div>

        {/* Right: Garment Details & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                ADIKT Core Series
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-full border transition-colors ${
                  isFavorited
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
              {product.title}
            </h1>

            {product.subtitle && (
              <p className="text-xs font-semibold text-zinc-400">{product.subtitle}</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discountPercent && (
                <span className="bg-accent/20 border border-accent/40 text-accent text-xs font-bold px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Tax included. Free express shipping on prepaid orders over ₹1,999.
            </p>
          </div>

          <hr className="border-zinc-800" />

          {/* Color Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Colorway: <span className="text-white font-semibold">{selectedColor}</span>
            </label>
            <div className="flex items-center gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${
                    selectedColor === color.name
                      ? "border-accent scale-110 ring-2 ring-accent/40"
                      : "border-zinc-700 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selector & Size Guide Button */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Select Size: <span className="text-white font-semibold">{selectedSize}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <Ruler className="h-3.5 w-3.5" /> Size Guide (In / Cm)
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.size}
                  disabled={!s.inStock}
                  onClick={() => setSelectedSize(s.size)}
                  className={`py-3 rounded-lg text-xs font-bold uppercase transition-all border ${
                    !s.inStock
                      ? "border-zinc-900 bg-zinc-950 text-zinc-600 cursor-not-allowed line-through"
                      : selectedSize === s.size
                      ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>

            {/* Low stock notice */}
            {selectedSizeObj?.inStock && selectedSizeObj.stockCount <= 5 && (
              <p className="text-[11px] text-amber-400 font-medium pt-1">
                🔥 Only {selectedSizeObj.stockCount} pieces remaining in size {selectedSize}. High demand.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!isSelectedInStock}
              className={`w-full py-4 rounded-xl font-extrabold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] ${
                !isSelectedInStock
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : isAdded
                  ? "bg-green-600 text-white"
                  : "bg-white hover:bg-zinc-200 text-black shadow-xl shadow-white/5"
              }`}
            >
              {!isSelectedInStock ? (
                "Size Sold Out"
              ) : isAdded ? (
                <>
                  <Check className="h-5 w-5" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" /> Add to Bag — {formatPrice(product.price)}
                </>
              )}
            </button>

            <Link
              href="/checkout"
              className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-extrabold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors"
            >
              Instant Express Checkout
            </Link>
          </div>

          {/* Pincode & Delivery Checker */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-accent" /> Check Delivery & COD Availability
            </label>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold uppercase"
              >
                Check
              </button>
            </form>
            {deliveryStatus && <p className="text-xs text-zinc-300">{deliveryStatus}</p>}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
              <RefreshCw className="h-4 w-4 text-accent shrink-0" />
              <span>7-Day Doorstep Returns</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
              <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
              <span>100% Pre-Shrunk Cotton</span>
            </div>
          </div>

          {/* Garment Specifications */}
          <div className="border-t border-zinc-800 pt-4 space-y-4 text-sm">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">
                Fabric & Engineering
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {product.fabric} • {product.gsm} GSM heavyweight weave • Pre-shrunk & bio-washed in South India.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">
                Model & Fit Advisory
              </h4>
              <p className="text-xs text-zinc-400">{product.modelInfo}</p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">
                Garment Care
              </h4>
              <ul className="text-xs text-zinc-400 list-disc list-inside space-y-0.5">
                {product.care.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        productTitle={product.title}
      />
    </div>
  )
}
