"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Zap,
} from "@/components/ui/Icons"
import { Star } from "lucide-react"
import { useCart } from "@/components/providers/CartContext"
import { useWishlist } from "@/components/providers/WishlistContext"
import { StoreProduct } from "@/lib/store-api"
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection"
import { FormattedTextRenderer } from "@/components/admin/RichTextEditor"

export interface ProductDetailViewProps {
  product: StoreProduct
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || "Vintage Black"
  )

  // Dynamically compute size availability for the currently selected colorway
  const colorwaySizes = React.useMemo(() => {
    const baseOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
    // Always include standard sizes up to XXL (S, M, L, XL, XXL)
    const availableSizeNames = new Set([
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      ...(product.variants?.map((v) => v.size) || []),
      ...(product.sizes?.map((s) => s.size) || []),
    ])
    const ordered = baseOrder.filter((s) => availableSizeNames.has(s))

    return ordered.map((sizeName) => {
      // Look up variant for current colorway & size
      if (product.variants && product.variants.length > 0) {
        const matchedVariant = product.variants.find(
          (v) =>
            v.color.toLowerCase() === selectedColor.toLowerCase() &&
            v.size.toUpperCase() === sizeName.toUpperCase()
        )
        if (matchedVariant) {
          return {
            size: sizeName,
            inStock: matchedVariant.inventory > 0,
            stockCount: matchedVariant.inventory,
          }
        }
        return {
          size: sizeName,
          inStock: false,
          stockCount: 0,
        }
      }

      // Fallback to product.sizes if variants matrix is absent
      const fallback = product.sizes.find(
        (s) => s.size.toUpperCase() === sizeName.toUpperCase()
      )
      return {
        size: sizeName,
        inStock: fallback ? fallback.inStock : false,
        stockCount: fallback ? fallback.stockCount : 0,
      }
    })
  }, [product.variants, product.sizes, selectedColor])

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const initialInStock = product.sizes.find((s) => s.inStock)?.size
    return initialInStock || "L"
  })

  // Automatically sync selected size when changing colorway
  React.useEffect(() => {
    const currentSizeObj = colorwaySizes.find(
      (s) => s.size.toUpperCase() === selectedSize.toUpperCase()
    )
    if (!currentSizeObj || !currentSizeObj.inStock) {
      const firstAvailable = colorwaySizes.find((s) => s.inStock)
      if (firstAvailable) {
        setSelectedSize(firstAvailable.size)
      }
    }
  }, [colorwaySizes, selectedSize])

  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false)
  const [pincode, setPincode] = useState<string>("")
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState<boolean>(false)

  const { addToCart, closeDrawer } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const isFavorited = isInWishlist(product.id)
  const selectedSizeObj = colorwaySizes.find(
    (s) => s.size.toUpperCase() === selectedSize.toUpperCase()
  )
  const isSelectedInStock = selectedSizeObj?.inStock ?? false

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
        AnalyticsHub.productView({
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          gsm: product.gsm,
          variant: `${selectedSize} / ${selectedColor}`,
        })
      })
    }
  }, [product.id, selectedSize, selectedColor])

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

  // Dynamically resolve photos for the currently selected color variant
  const activeColorImages = React.useMemo(() => {
    if (!selectedColor) return product.images

    // 1. Check if product.variantImages has entries for this color
    const matchedKey = Object.keys(product.variantImages || {}).find(
      (k) => k.toLowerCase() === selectedColor.toLowerCase()
    )
    if (matchedKey && product.variantImages?.[matchedKey]?.length) {
      return product.variantImages[matchedKey]
    }

    // 2. Check if product.colors has images for this color
    const colorObj = product.colors.find(
      (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
    )
    if (colorObj?.images && colorObj.images.length > 0) {
      return colorObj.images
    }

    // 3. Check variants for specific color image
    const variantWithImg = product.variants?.find(
      (v) => v.color.toLowerCase() === selectedColor.toLowerCase() && (v.images?.length || v.image)
    )
    if (variantWithImg?.images && variantWithImg.images.length > 0) {
      return variantWithImg.images
    }
    if (variantWithImg?.image) {
      return [variantWithImg.image]
    }

    // 4. Fall back to standard product images
    return product.images
  }, [product.images, product.variantImages, product.colors, product.variants, selectedColor])

  const handleAddToCart = (e?: React.MouseEvent) => {
    const coords = e ? { x: e.clientX, y: e.clientY } : undefined

    addToCart(
      {
        productId: product.id,
        title: product.title,
        handle: product.handle,
        variantTitle: `${selectedSize} / ${selectedColor}`,
        size: selectedSize,
        color: selectedColor,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: 1,
        thumbnail: activeColorImages[0] || product.images[0] || "",
        isGstIncluded: product.isGstIncluded ?? true,
        gstType: product.gstType || "percentage",
        gstRate: product.gstRate,
      },
      true,
      coords
    )
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleInstantCheckout = () => {
    if (!isSelectedInStock) return

    closeDrawer()
    addToCart(
      {
        productId: product.id,
        title: product.title,
        handle: product.handle,
        variantTitle: `${selectedSize} / ${selectedColor}`,
        size: selectedSize,
        color: selectedColor,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: 1,
        thumbnail: activeColorImages[0] || product.images[0] || "",
        isGstIncluded: product.isGstIncluded ?? true,
        gstType: product.gstType || "percentage",
        gstRate: product.gstRate,
      },
      false
    )

    router.push("/checkout")
  }

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
      {/* Product Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Interactive Garment Gallery (6 cols) */}
        <div className="lg:col-span-6">
          <ProductGallery
            images={activeColorImages}
            title={`${product.title} (${selectedColor})`}
            gsm={product.gsm}
            fit={product.fit}
          />
        </div>

        {/* Right: Garment Details & Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            {product.seriesName && product.seriesName.trim() && (
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#9A0000]">
                  {product.seriesName.trim()}
                </span>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display flex-1">
                {product.title}
              </h1>
              <button
                onClick={() => toggleWishlist(product, selectedSize, selectedColor)}
                className={`p-2.5 rounded-full border transition-all shrink-0 mt-0.5 ${
                  isFavorited
                    ? "border-[#9A0000] bg-[#9A0000] text-white shadow-md shadow-[#9A0000]/30"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
                aria-label="Wishlist toggle"
                title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Quick Review Anchor */}
            <div className="flex items-center gap-2">
              <a
                href="#reviews-section"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-zinc-400 hover:underline">
                  Verified Reviews & Fit Guide ↓
                </span>
              </a>
            </div>

            {product.subtitle &&
              product.subtitle.trim() &&
              !product.subtitle.toLowerCase().includes("gsm engineered garment") &&
              !product.subtitle.toLowerCase().includes("engineered d2c garment") && (
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
                <span className="bg-[#9A0000] text-white text-xs font-black px-2.5 py-0.5 rounded shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {(product.isGstIncluded ?? true)
                ? "Tax included."
                : product.gstRate && product.gstRate > 0
                ? product.gstType === "amount"
                  ? `+₹${product.gstRate} GST added at checkout.`
                  : `+${product.gstRate}% GST added at checkout.`
                : "Additional GST added at checkout."}
            </p>
          </div>

          <hr className="border-zinc-800" />

          {/* Color Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              COLOUR: <span className="text-white font-semibold">{selectedColor}</span>
            </label>
            <div className="flex items-center gap-3">
              {product.colors.map((color) => {
                const swatchHex =
                  (product.colorCodes && product.colorCodes[color.name]) ||
                  color.hex ||
                  "#18181b"

                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`h-9 w-9 rounded-full border-2 transition-all shadow-sm ${
                      selectedColor === color.name
                        ? "border-[#9A0000] scale-110 ring-2 ring-[#9A0000]/50"
                        : "border-zinc-700 opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: swatchHex }}
                    title={`${color.name} (${swatchHex})`}
                  />
                )
              })}
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
                className="inline-flex items-center gap-1 text-xs font-bold text-[#9A0000] hover:underline"
              >
                <Ruler className="h-3.5 w-3.5" /> Size Guide (In / Cm)
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {colorwaySizes.map((s) => {
                const isSelected = selectedSize.toUpperCase() === s.size.toUpperCase()
                const isAvailable = s.inStock

                return (
                  <button
                    key={s.size}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(s.size)}
                    className={`py-3 rounded-lg text-xs font-bold uppercase transition-all border ${
                      !isAvailable
                        ? "border-zinc-900 bg-zinc-950/70 text-zinc-600 cursor-not-allowed opacity-40 line-through decoration-zinc-600 select-none"
                        : isSelected
                        ? "border-[#9A0000] bg-[#9A0000] text-white shadow-lg shadow-[#9A0000]/30 font-black scale-[1.02]"
                        : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-600 hover:text-white"
                    }`}
                    title={
                      !isAvailable
                        ? `Size ${s.size} is unavailable in ${selectedColor}`
                        : `Select Size ${s.size}`
                    }
                  >
                    {s.size}
                  </button>
                )
              })}
            </div>

            {/* Dynamic Low stock notice */}
            {selectedSizeObj?.inStock && selectedSizeObj.stockCount <= 5 && (
              <p className="text-[11px] text-amber-400 font-medium pt-1 flex items-center gap-1.5">
                <span>🔥</span>
                <span>
                  Only <strong className="text-white font-bold">{selectedSizeObj.stockCount}</strong> remaining in {selectedColor} (Size {selectedSize}).
                </span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!isSelectedInStock}
              className={`w-full py-4 rounded-xl font-extrabold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
                !isSelectedInStock
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : isAdded
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 scale-[1.01]"
                  : "bg-white hover:bg-zinc-200 text-black shadow-xl shadow-white/10 hover:shadow-2xl"
              }`}
            >
              {!isSelectedInStock ? (
                "Size Sold Out"
              ) : isAdded ? (
                <span className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
                  <Check className="h-5 w-5 stroke-[2.5]" /> Added to Bag ✓
                </span>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" /> Add to Bag — {formatPrice(product.price)}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleInstantCheckout}
              disabled={!isSelectedInStock}
              className={`w-full py-3.5 rounded-xl font-extrabold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                !isSelectedInStock
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
                  : "bg-[#9A0000] hover:bg-[#7a0000] text-white shadow-lg shadow-[#9A0000]/30"
              }`}
            >
              <Zap className="h-4 w-4 fill-current" /> Instant Express Checkout
            </button>
          </div>

          {/* Pincode & Delivery Checker */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-[#9A0000]" /> Check Delivery & COD Availability
            </label>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#9A0000]"
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

          {/* Garment Specifications / Custom Formatted Details */}
          <div className="border-t border-zinc-800 pt-4 space-y-4 text-sm">
            {product.specifications || product.fabricEngineering ? (
              <FormattedTextRenderer
                content={product.specifications || product.fabricEngineering || ""}
              />
            ) : (
              <>
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
                  <p className="text-xs text-zinc-400">
                    {product.modelFitAdvisory || product.modelInfo || `Model is 6'1" (185cm), wearing size L`}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">
                    Garment Care
                  </h4>
                  <ul className="text-xs text-zinc-400 list-disc list-inside space-y-0.5">
                    {(product.care && product.care.length > 0
                      ? product.care
                      : [
                          "Machine wash cold inside out with like colors",
                          "Do not bleach or tumble dry",
                          "Iron on reverse; do not iron direct print",
                          "Dry flat in shade to preserve garment shape",
                        ]
                    ).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Verified Reviews & Ratings Section */}
      <div id="reviews-section">
        <ProductReviewsSection
          productId={product.id}
          productTitle={product.title}
          productHandle={product.handle}
        />
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
