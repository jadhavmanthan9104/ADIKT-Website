"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/formatters"
import { SizeChartModal } from "@/components/product/SizeChartModal"
import {
  Ruler,
  Truck,
  Check,
  ShoppingBag,
} from "@/components/ui/Icons"

export interface ProductDetailViewProps {
  product: {
    id: string
    title: string
    handle: string
    price: number
    originalPrice: number
    gsm: number
    fit: string
    fabric: string
    weave: string
    modelInfo: string
    care: string[]
    sizes: { size: string; inStock: boolean; stockCount: number }[]
    images: string[]
  }
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedSize, setSelectedSize] = useState<string>("L")
  const [selectedColor, setSelectedColor] = useState<string>("Vintage Black")
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false)
  const [pincode, setPincode] = useState<string>("")
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState<boolean>(false)
  const [activeImage, setActiveImage] = useState<string>(product.images[0] || "")

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault()
    if (pincode.length === 6) {
      setDeliveryStatus("✅ Express Delivery available in 2-3 business days. COD eligible.")
    } else {
      setDeliveryStatus("❌ Please enter a valid 6-digit Indian PIN code.")
    }
  }

  const handleAddToCart = () => {
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-400 flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white">Catalog</Link>
        <span>/</span>
        <span className="text-white font-medium truncate">{product.title}</span>
      </nav>

      {/* Product Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Garment Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800">
            <Image
              src={activeImage}
              alt={product.title}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-xs font-bold text-white px-3 py-1 rounded-md uppercase tracking-wider">
              {product.gsm} GSM // {product.fit}
            </div>
          </div>

          {/* Image Thumbnails */}
          <div className="grid grid-cols-3 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === img ? "border-accent scale-[0.98]" : "border-zinc-800 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Angle ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Garment Details & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">ADIKT Core Series</p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-2xl font-bold text-white">{formatPrice(product.price)}</span>
              <span className="text-sm text-zinc-500 line-through">{formatPrice(product.originalPrice)}</span>
              <span className="bg-accent/20 border border-accent/40 text-accent text-xs font-bold px-2 py-0.5 rounded">
                20% OFF
              </span>
            </div>
            <p className="text-xs text-zinc-400">Tax included. Free express shipping on prepaid orders.</p>
          </div>

          <hr className="border-zinc-800" />

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Colorway: <span className="text-white">{selectedColor}</span>
            </label>
            <div className="flex items-center gap-3">
              {[
                { name: "Vintage Black", hex: "#18181b" },
                { name: "Bone White", hex: "#f4f4f5" },
                { name: "Olive Washed", hex: "#3f4a3c" },
              ].map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    selectedColor === color.name
                      ? "border-accent scale-110 ring-2 ring-accent/30"
                      : "border-zinc-700 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selector & Size Chart Modal Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Select Size: <span className="text-white">{selectedSize}</span>
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
            {selectedSize === "L" && (
              <p className="text-[11px] text-amber-400 font-medium">
                🔥 Only 3 pieces left in size L. High demand.
              </p>
            )}
          </div>

          {/* Add to Bag CTA */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              {isAdded ? (
                <>
                  <Check className="h-5 w-5 text-green-600" /> Added to Bag
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
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
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
            {deliveryStatus && <p className="text-xs mt-1 text-zinc-300">{deliveryStatus}</p>}
          </div>

          {/* Accordion Specs */}
          <div className="border-t border-zinc-800 pt-4 space-y-4 text-sm">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Fabric & Craft</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {product.fabric} • {product.gsm} GSM Heavyweight single jersey • Pre-shrunk and bio-washed.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Model Fit Guide</h4>
              <p className="text-xs text-zinc-400">{product.modelInfo}</p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Care Instructions</h4>
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
