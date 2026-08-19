"use client"

export const dynamic = "force-dynamic"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { AdminDataService, AdminProduct } from "@/lib/admin-api"
import { ArrowLeft, Save, Trash2, Check, ExternalLink, Calendar, Clock, Plus, Palette, Sparkles, Image as ImageIcon } from "lucide-react"
import {
  ProductImageUploader,
  UploadedImage,
} from "@/components/admin/ProductImageUploader"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = (params?.id as string) || "prod_01JADIKT01"
  const [product, setProduct] = useState<AdminProduct | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [productImages, setProductImages] = useState<UploadedImage[]>([])
  const [newColorInput, setNewColorInput] = useState("")
  const [newColorHex, setNewColorHex] = useState("#18181b")
  const [colorUrlInputs, setColorUrlInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    // Try loading from API first (persisted products), fall back to in-memory
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.product) {
            setProduct(data.product)
            initImages(data.product)
            return
          }
        }
      } catch {
        // fall through to in-memory
      }

      // Fallback to in-memory AdminDataService for seeded products
      const p = AdminDataService.getProductById(id) || AdminDataService.getProducts()[0]
      setProduct(p)
      if (p) initImages(p)
    }

    function initImages(p: AdminProduct) {
      const existingImages: UploadedImage[] = (p.images || []).map((url, idx) => ({
        id: `existing_${idx}`,
        url,
        name: `Image ${idx + 1}`,
        size: 0,
        isPrimary: url === p.thumbnail || idx === 0,
      }))
      if (existingImages.length === 0 && p.thumbnail) {
        existingImages.push({
          id: "existing_thumb",
          url: p.thumbnail,
          name: "Thumbnail",
          size: 0,
          isPrimary: true,
        })
      }
      setProductImages(existingImages)
    }

    loadProduct()
  }, [id])

  if (!product) {
    return <div className="p-8 text-white">Loading product details...</div>
  }

  const addVariant = () => {
    const idx = (product.variants || []).length + 1
    const lastColor = product.variants?.[product.variants.length - 1]?.color || "Vintage Black"
    const prefix = product.handle ? product.handle.toUpperCase().replace(/[^A-Z0-9]/g, "") : "ADKT"
    const colorCode = lastColor.slice(0, 3).toUpperCase()
    const newVar = {
      id: `var_${Date.now()}_${idx}`,
      title: `M / ${lastColor}`,
      size: "M",
      color: lastColor,
      sku: `${prefix}-${colorCode}-M-${idx}`,
      barcode: `89012340050${idx}`,
      inventory: 20,
      price: product.price || 1999,
      weightGrams: 300,
    }
    setProduct({
      ...product,
      variants: [...(product.variants || []), newVar],
    })
  }

  const addColorVariantBatch = (colorName: string, hex?: string) => {
    if (!colorName.trim() || !product) return
    const cleanColor = colorName.trim()
    const colorCode = cleanColor.slice(0, 3).toUpperCase()
    const prefix = product.handle ? product.handle.toUpperCase().replace(/[^A-Z0-9]/g, "") : "ADKT"
    const standardSizes = ["S", "M", "L", "XL", "XXL"]
    const newBatch = standardSizes.map((size, idx) => ({
      id: `var_${Date.now()}_${idx}`,
      title: `${size} / ${cleanColor}`,
      size,
      color: cleanColor,
      sku: `${prefix}-${colorCode}-${size}`,
      barcode: `8901234${Date.now().toString().slice(-5)}${idx}`,
      inventory: 20,
      price: product.price || 1999,
      weightGrams: 300,
    }))
    setProduct({
      ...product,
      colorCodes: hex ? { ...(product.colorCodes || {}), [cleanColor]: hex } : product.colorCodes,
      variants: [...(product.variants || []), ...newBatch],
    })
    setNewColorInput("")
  }

  const updateColorCode = (colorName: string, hex: string) => {
    if (!product) return
    setProduct({
      ...product,
      colorCodes: {
        ...(product.colorCodes || {}),
        [colorName]: hex,
      },
    })
  }

  const removeVariant = (idx: number) => {
    if (!product || (product.variants || []).length <= 1) return
    setProduct({
      ...product,
      variants: product.variants.filter((_, i) => i !== idx),
    })
  }

  const addColorImage = (colorName: string, url: string) => {
    if (!url.trim() || !product) return
    const currentMap = product.colorImages || {}
    setProduct({
      ...product,
      colorImages: {
        ...currentMap,
        [colorName]: [...(currentMap[colorName] || []), url.trim()],
      },
    })
    setColorUrlInputs((prev) => ({ ...prev, [colorName]: "" }))
  }

  const removeColorImage = (colorName: string, idx: number) => {
    if (!product) return
    const currentMap = product.colorImages || {}
    setProduct({
      ...product,
      colorImages: {
        ...currentMap,
        [colorName]: (currentMap[colorName] || []).filter((_, i) => i !== idx),
      },
    })
  }

  const uniqueColors = Array.from(
    new Set((product.variants || []).map((v) => v.color.trim()).filter(Boolean))
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Sync images back to product before saving
    const primaryImg = productImages.find((img) => img.isPrimary)
    const updatedProduct = {
      ...product,
      thumbnail: primaryImg?.url || productImages[0]?.url || product.thumbnail,
      images: productImages.map((img) => img.url),
    }

    try {
      // Try persisted API first
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      })

      if (!res.ok) {
        // Fallback to in-memory
        AdminDataService.updateProduct(product.id, updatedProduct)
      }
    } catch {
      AdminDataService.updateProduct(product.id, updatedProduct)
    }

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleDelete = async () => {
    if (confirm("Delete this garment permanently from catalog?")) {
      try {
        await fetch(`/api/products/${product.id}`, { method: "DELETE" })
      } catch {
        // fallback
      }
      AdminDataService.deleteProduct(product.id)
      router.push("/admin/products")
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Edit Silhouette
            </span>
            <h1 className="text-2xl font-black uppercase text-white font-display">
              {product.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/products/${product.handle}`}
            target="_blank"
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase rounded-xl inline-flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Preview Storefront
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 text-xs font-bold uppercase rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20"
          >
            {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isSaved ? "Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Product Images */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <ProductImageUploader
              images={productImages}
              onChange={setProductImages}
              maxImages={10}
            />
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">
              Product Overview
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Garment Title</label>
                <input
                  type="text"
                  value={product.title}
                  onChange={(e) => setProduct({ ...product, title: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Subtitle / Weave Detail</label>
                <input
                  type="text"
                  value={product.subtitle || ""}
                  onChange={(e) => setProduct({ ...product, subtitle: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">
                  Series / Badge Label (Shown on Product Page)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ADIKT Core Series (Leave empty to remove text)"
                  value={product.seriesName !== undefined ? product.seriesName : "ADIKT Core Series"}
                  onChange={(e) => setProduct({ ...product, seriesName: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Custom badge displayed above the title on the product page (defaults to &quot;ADIKT Core Series&quot;). If no text is entered, the text is removed from the product page.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Description</label>
                <textarea
                  rows={4}
                  value={product.description || ""}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Product Page Specifications & Details (Rich Text Editor) */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <RichTextEditor
              label="Product Page Specifications & Fit Details"
              value={
                product.specifications !== undefined
                  ? product.specifications
                  : product.fabricEngineering ||
                    `### Fabric & Engineering\n${
                      product.fabric || "100% Combed Compact Cotton"
                    } • ${product.gsm || 280} GSM heavyweight weave • Pre-shrunk & bio-washed in South India.\n\n### Model & Fit Advisory\n${
                      product.modelFitAdvisory || product.modelInfo || "Model is 6'1\" (185cm), wearing size L"
                    }\n\n### Garment Care\n${
                      product.care && product.care.length > 0
                        ? product.care.map((c) => `• ${c}`).join("\n")
                        : "• Machine wash cold inside out with like colors\n• Do not bleach or tumble dry\n• Iron on reverse; do not iron direct print\n• Dry flat in shade to preserve garment shape"
                    }`
              }
              onChange={(val) =>
                setProduct({
                  ...product,
                  specifications: val,
                  fabricEngineering: val,
                })
              }
              placeholder="Enter product specifications, fabric engineering, model advisory, and garment care details..."
              helperText="Use toolbar buttons for Bold (**text**), Italic (*text*), H3 Headings (### Title), and Bullet lists (• Item). Click 'Live Preview' to see the exact product page look."
            />
          </div>

          {/* Variant Matrix */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                  Variant & SKU Matrix ({product.variants.length})
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Configure sizes, colors, custom editable SKUs, stock levels, and unit pricing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase rounded-lg transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Variant
                </button>
              </div>
            </div>

            {/* Quick Batch Color Adder */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
                <Palette className="h-3.5 w-3.5 text-accent" />
                <span className="font-semibold text-white">Add Colorway:</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Bone White, Olive Washed, Desert Sand"
                value={newColorInput}
                onChange={(e) => setNewColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addColorVariantBatch(newColorInput, newColorHex)
                  }
                }}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
              />
              <div className="flex items-center gap-1.5 shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-5 w-5 rounded cursor-pointer bg-transparent border-0 p-0"
                  title="Choose swatch hex color"
                />
                <span className="font-mono text-[10px] text-zinc-400">{newColorHex}</span>
              </div>
              <button
                type="button"
                onClick={() => addColorVariantBatch(newColorInput, newColorHex)}
                disabled={!newColorInput.trim()}
                className="px-3 py-1.5 bg-[#9A0000] hover:bg-[#800000] disabled:opacity-40 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors shrink-0 flex items-center justify-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Add Sizes (S to XXL)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-500 font-extrabold uppercase text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Color</th>
                    <th className="pb-2">SKU (Editable)</th>
                    <th className="pb-2">Stock</th>
                    <th className="pb-2">Unit Price (₹)</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {product.variants.map((v, idx) => (
                    <tr key={v.id || idx} className="text-zinc-300">
                      <td className="py-2.5">
                        <select
                          value={v.size}
                          onChange={(e) => {
                            const updated = { ...product }
                            updated.variants[idx].size = e.target.value
                            setProduct(updated)
                          }}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white font-bold"
                        >
                          {["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5">
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => {
                            const updated = { ...product }
                            updated.variants[idx].color = e.target.value
                            setProduct(updated)
                          }}
                          className="w-28 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="py-2.5">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const updated = { ...product }
                            updated.variants[idx].sku = e.target.value
                            setProduct(updated)
                          }}
                          placeholder="e.g. ADKT-TOP-BLK-S"
                          className="w-36 font-mono text-[11px] bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-accent"
                        />
                      </td>
                      <td className="py-2.5">
                        <input
                          type="number"
                          value={v.inventory}
                          onChange={(e) => {
                            const updated = { ...product }
                            updated.variants[idx].inventory = Number(e.target.value)
                            setProduct(updated)
                          }}
                          className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="py-2.5">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const updated = { ...product }
                            updated.variants[idx].price = Number(e.target.value)
                            setProduct(updated)
                          }}
                          className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          disabled={product.variants.length <= 1}
                          className="p-1 text-zinc-600 hover:text-red-400 disabled:opacity-30 transition-colors"
                          title="Remove variant"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Color Variant Photos & Galleries */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                  <Palette className="h-4 w-4 text-accent" />
                  Color Variant Photos & Galleries ({uniqueColors.length} Colors)
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Attach specific product photos to each color variant. When customers click a colorway on the storefront, the gallery will instantly sync to show these photos.
                </p>
              </div>
            </div>

            {uniqueColors.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Add at least one variant above to configure color photos.</p>
            ) : (
              <div className="space-y-4">
                {uniqueColors.map((colorName) => {
                  const assignedImages = (product.colorImages && product.colorImages[colorName]) || []
                  const currentInput = colorUrlInputs[colorName] || ""

                  return (
                    <div
                      key={colorName}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-900">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border border-zinc-600 shadow-sm"
                            style={{
                              backgroundColor:
                                (product.colorCodes && product.colorCodes[colorName]) || "#18181b",
                            }}
                          />
                          <span className="text-xs font-bold text-white uppercase tracking-wide">
                            {colorName}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ({assignedImages.length} {assignedImages.length === 1 ? "photo" : "photos"})
                          </span>
                        </div>

                        {/* Color Swatch Hex Code Selector */}
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-semibold text-zinc-400">
                            Website Swatch Color:
                          </label>
                          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                            <input
                              type="color"
                              value={(product.colorCodes && product.colorCodes[colorName]) || "#18181b"}
                              onChange={(e) => updateColorCode(colorName, e.target.value)}
                              className="h-4 w-4 rounded cursor-pointer bg-transparent border-0 p-0"
                              title={`Choose hex color for ${colorName}`}
                            />
                            <input
                              type="text"
                              value={(product.colorCodes && product.colorCodes[colorName]) || "#18181b"}
                              onChange={(e) => updateColorCode(colorName, e.target.value)}
                              placeholder="#18181b"
                              className="w-20 font-mono text-[10px] bg-transparent text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Photo Thumbnail Reel */}
                      {assignedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2.5">
                          {assignedImages.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative group h-16 w-16 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900"
                            >
                              <img
                                src={imgUrl}
                                alt={`${colorName} view ${imgIdx + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeColorImage(colorName, imgIdx)}
                                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-300 transition-opacity"
                                title="Remove photo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Image URL Row */}
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          placeholder={`Paste image URL for ${colorName}...`}
                          value={currentInput}
                          onChange={(e) =>
                            setColorUrlInputs((prev) => ({ ...prev, [colorName]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addColorImage(colorName, currentInput)
                            }
                          }}
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => addColorImage(colorName, currentInput)}
                          disabled={!currentInput.trim()}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-[10px] font-bold uppercase rounded-lg transition-colors shrink-0"
                        >
                          + Add Photo
                        </button>
                      </div>

                      {/* Quick Pick from Main Product Images */}
                      {productImages.length > 0 && (
                        <div className="pt-2 border-t border-zinc-900 space-y-1.5">
                          <p className="text-[10px] font-semibold text-zinc-500">
                            Quick-assign from uploaded product gallery:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {productImages.map((pImg, pIdx) => {
                              const isAlreadyAssigned = assignedImages.includes(pImg.url)
                              return (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => {
                                    if (!isAlreadyAssigned) {
                                      addColorImage(colorName, pImg.url)
                                    }
                                  }}
                                  className={`relative h-10 w-10 rounded-md overflow-hidden border transition-all ${
                                    isAlreadyAssigned
                                      ? "border-emerald-500 opacity-40 cursor-default ring-1 ring-emerald-500"
                                      : "border-zinc-800 hover:border-accent hover:scale-105"
                                  }`}
                                  title={isAlreadyAssigned ? "Already added" : "Click to add to this color"}
                                >
                                  <img
                                    src={pImg.url}
                                    alt={`Product ${pIdx + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                  {isAlreadyAssigned && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-emerald-400">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Publishing & Scheduling Engine */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" /> Publishing Status
              </h3>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  product.status === "published"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : product.status === "scheduled"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {product.status === "published"
                  ? "Live on site"
                  : product.status === "scheduled"
                  ? "Scheduled Drop"
                  : "Draft (Hidden)"}
              </span>
            </div>

            <div className="space-y-3">
              {/* Option 1: Publish Immediately */}
              <label
                onClick={() => setProduct({ ...product, status: "published" })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  product.status === "published"
                    ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                    : "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="edit_product_status"
                  checked={product.status === "published"}
                  onChange={() => setProduct({ ...product, status: "published" })}
                  className="mt-0.5 text-[#9A0000] accent-[#9A0000]"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Publish Immediately</p>
                  <p className="text-[11px] text-zinc-400">
                    Garment is live and visible on the storefront right now.
                  </p>
                </div>
              </label>

              {/* Option 2: Schedule for Future Release */}
              <label
                onClick={() => setProduct({ ...product, status: "scheduled" })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  product.status === "scheduled"
                    ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                    : "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="edit_product_status"
                  checked={product.status === "scheduled"}
                  onChange={() => setProduct({ ...product, status: "scheduled" })}
                  className="mt-0.5 text-[#9A0000] accent-[#9A0000]"
                />
                <div className="space-y-0.5 flex-1">
                  <p className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Schedule Future Drop</span>
                    <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Drop Automation
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Takes garment down from public view until the scheduled timestamp arrives.
                  </p>
                </div>
              </label>

              {/* Scheduled Date/Time Picker */}
              {product.status === "scheduled" && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Release Date & Time (IST) *</span>
                    <Clock className="h-3.5 w-3.5 text-accent" />
                  </label>
                  <input
                    type="datetime-local"
                    required={product.status === "scheduled"}
                    value={
                      product.scheduledAt
                        ? new Date(product.scheduledAt).toISOString().slice(0, 16)
                        : ""
                    }
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent font-mono"
                  />

                  {/* Quick Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                      Quick Presets:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date()
                          d.setDate(d.getDate() + 1)
                          d.setHours(18, 0, 0, 0)
                          setProduct({
                            ...product,
                            status: "scheduled",
                            scheduledAt: d.toISOString(),
                          })
                        }}
                        className="py-1 px-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold"
                      >
                        +1 Day (6 PM)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date()
                          d.setDate(d.getDate() + 3)
                          d.setHours(18, 0, 0, 0)
                          setProduct({
                            ...product,
                            status: "scheduled",
                            scheduledAt: d.toISOString(),
                          })
                        }}
                        className="py-1 px-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold"
                      >
                        +3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date()
                          d.setDate(d.getDate() + 7)
                          d.setHours(12, 0, 0, 0)
                          setProduct({
                            ...product,
                            status: "scheduled",
                            scheduledAt: d.toISOString(),
                          })
                        }}
                        className="py-1 px-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold"
                      >
                        +1 Week
                      </button>
                    </div>
                  </div>

                  {product.scheduledAt && (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-200">
                      📅 Goes live on:{" "}
                      <strong>
                        {new Date(product.scheduledAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* Option 3: Save as Draft */}
              <label
                onClick={() => setProduct({ ...product, status: "draft" })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  product.status === "draft"
                    ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                    : "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="edit_product_status"
                  checked={product.status === "draft"}
                  onChange={() => setProduct({ ...product, status: "draft" })}
                  className="mt-0.5 text-[#9A0000] accent-[#9A0000]"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Draft / Hidden</p>
                  <p className="text-[11px] text-zinc-400">
                    Unpublished from storefront. Available for editing in admin only.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">
              Pricing & Economics
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400">Retail Price (₹)</label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Compare-at Price (₹)</label>
                <input
                  type="number"
                  value={product.compareAtPrice || ""}
                  onChange={(e) => setProduct({ ...product, compareAtPrice: Number(e.target.value) })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Fabric GSM</label>
                <input
                  type="number"
                  value={product.gsm}
                  onChange={(e) => setProduct({ ...product, gsm: Number(e.target.value) })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              {/* GST Tax Configuration */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={product.isGstIncluded ?? true}
                    onChange={(e) =>
                      setProduct({ ...product, isGstIncluded: e.target.checked })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-accent focus:ring-0 focus:ring-offset-0 h-4 w-4 accent-[#9A0000]"
                  />
                  <span className="text-xs font-semibold text-white">
                    GST included in pricing
                  </span>
                </label>

                <div
                  className={`space-y-1.5 transition-all ${
                    product.isGstIncluded ?? true ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-zinc-400">
                      Additional GST {(product.isGstIncluded ?? true) ? "(Inclusive in Retail Price)" : "(Added at Checkout)"}
                    </label>
                    <div className="inline-flex rounded-lg bg-zinc-950 border border-zinc-800 p-0.5 text-[10px] font-bold">
                      <button
                        type="button"
                        disabled={product.isGstIncluded ?? true}
                        onClick={() => setProduct({ ...product, gstType: "percentage" })}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          (product.gstType || "percentage") === "percentage"
                            ? "bg-zinc-800 text-white font-black"
                            : "text-zinc-500 hover:text-zinc-300"
                        } ${(product.isGstIncluded ?? true) ? "cursor-not-allowed" : ""}`}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        disabled={product.isGstIncluded ?? true}
                        onClick={() => setProduct({ ...product, gstType: "amount" })}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          product.gstType === "amount"
                            ? "bg-zinc-800 text-white font-black"
                            : "text-zinc-500 hover:text-zinc-300"
                        } ${(product.isGstIncluded ?? true) ? "cursor-not-allowed" : ""}`}
                      >
                        Amount (₹)
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      disabled={product.isGstIncluded ?? true}
                      value={(product.isGstIncluded ?? true) ? "" : product.gstRate || ""}
                      placeholder={
                        (product.isGstIncluded ?? true)
                          ? "GST already inclusive in MRP"
                          : (product.gstType || "percentage") === "percentage"
                          ? "e.g. 18%"
                          : "e.g. 150"
                      }
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          gstRate: Number(e.target.value),
                        })
                      }
                      className={`w-full rounded-xl px-3 py-2 text-xs transition-colors focus:outline-none ${
                        (product.isGstIncluded ?? true)
                          ? "bg-zinc-950/60 border border-zinc-800/40 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-950 border border-zinc-800 text-white focus:border-accent font-bold"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-zinc-500 pointer-events-none">
                      {(product.gstType || "percentage") === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {(product.isGstIncluded ?? true)
                      ? "When checked, retail price is inclusive of all taxes and 0 extra tax is added at checkout."
                      : (product.gstType || "percentage") === "percentage"
                      ? `+${product.gstRate || 0}% GST will be computed and added to cart/checkout.`
                      : `+₹${product.gstRate || 0} fixed GST will be computed and added to cart/checkout.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">
              Organization
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400">Category</label>
                <input
                  type="text"
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Collection Drop</label>
                <input
                  type="text"
                  value={product.collection}
                  onChange={(e) => setProduct({ ...product, collection: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Storefront Preview */}
          {productImages.length > 0 && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
                Storefront Preview
              </h4>
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-zinc-800">
                <img
                  src={
                    productImages.find((img) => img.isPrimary)?.url ||
                    productImages[0]?.url
                  }
                  alt="Storefront thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-[10px] font-bold text-white truncate">
                    {product.title}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 text-center">
                This is how it appears on the storefront
              </p>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
