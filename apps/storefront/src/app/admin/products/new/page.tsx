"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash2, Check, Calendar, Clock, Palette, Image as ImageIcon, Link2, X, Sparkles } from "lucide-react"
import {
  ProductImageUploader,
  UploadedImage,
} from "@/components/admin/ProductImageUploader"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

export default function NewProductPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [productImages, setProductImages] = useState<UploadedImage[]>([])
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({})
  const [colorCodes, setColorCodes] = useState<Record<string, string>>({
    "Vintage Black": "#18181b",
    "Bone White": "#f4f4f5",
    "Olive Washed": "#3f4a3c",
    "Charcoal Grey": "#27272a",
    "Oatmeal Heather": "#d6d3d1",
    "Desert Sand": "#a8a29e",
    "Heather Grey": "#9ca3af",
  })
  const [newColorInput, setNewColorInput] = useState("")
  const [newColorHex, setNewColorHex] = useState("#18181b")
  const [colorUrlInputs, setColorUrlInputs] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: "",
    handle: "",
    subtitle: "",
    description: "",
    category: "Heavyweight Tees",
    collection: "Core Heavyweight",
    gsm: 280,
    price: 1999,
    compareAtPrice: 2499,
    costPrice: 650,
    isGstIncluded: true,
    gstType: "percentage" as "percentage" | "amount",
    gstRate: 18,
    seriesName: "ADIKT Core Series",
    specifications:
      "### Fabric & Engineering\n100% Combed Compact Cotton • 240 GSM heavyweight weave • Pre-shrunk & bio-washed in South India.\n\n### Model & Fit Advisory\nModel is 6'1\" (185cm), wearing size L\n\n### Garment Care\n• Machine wash cold inside out with like colors\n• Do not bleach or tumble dry\n• Iron on reverse; do not iron direct print\n• Dry flat in shade to preserve garment shape",
    tags: "Heavyweight, Boxy, 280 GSM",
    status: "published" as "published" | "draft" | "scheduled",
    scheduledAt: "",
  })

  const [variants, setVariants] = useState([
    { size: "S", color: "Vintage Black", sku: "ADKT-TOP-BLK-S", barcode: "890123400501", inventory: 25, price: 1999, weightGrams: 280 },
    { size: "M", color: "Vintage Black", sku: "ADKT-TOP-BLK-M", barcode: "890123400502", inventory: 40, price: 1999, weightGrams: 300 },
    { size: "L", color: "Vintage Black", sku: "ADKT-TOP-BLK-L", barcode: "890123400503", inventory: 30, price: 1999, weightGrams: 320 },
    { size: "XL", color: "Vintage Black", sku: "ADKT-TOP-BLK-XL", barcode: "890123400504", inventory: 15, price: 1999, weightGrams: 340 },
  ])

  const handleTitleChange = (title: string) => {
    const handle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    setFormData({ ...formData, title, handle })
  }

  const addVariant = () => {
    const idx = variants.length + 1
    const lastColor = variants[variants.length - 1]?.color || "Vintage Black"
    const prefix = formData.handle ? formData.handle.toUpperCase().replace(/[^A-Z0-9]/g, "") : "ADKT"
    const colorCode = lastColor.slice(0, 3).toUpperCase()
    setVariants([
      ...variants,
      {
        size: "M",
        color: lastColor,
        sku: `${prefix}-${colorCode}-M-${idx}`,
        barcode: `89012340050${idx}`,
        inventory: 20,
        price: formData.price || 1999,
        weightGrams: 300,
      },
    ])
  }

  const addColorVariantBatch = (colorName: string, hex?: string) => {
    if (!colorName.trim()) return
    const cleanColor = colorName.trim()
    const colorCode = cleanColor.slice(0, 3).toUpperCase()
    const prefix = formData.handle ? formData.handle.toUpperCase().replace(/[^A-Z0-9]/g, "") : "ADKT"
    if (hex) {
      setColorCodes((prev) => ({ ...prev, [cleanColor]: hex }))
    }
    const standardSizes = ["S", "M", "L", "XL", "XXL"]
    const newBatch = standardSizes.map((size, idx) => ({
      size,
      color: cleanColor,
      sku: `${prefix}-${colorCode}-${size}`,
      barcode: `8901234${Date.now().toString().slice(-5)}${idx}`,
      inventory: 20,
      price: formData.price || 1999,
      weightGrams: 300,
    }))
    setVariants((prev) => [...prev, ...newBatch])
    setNewColorInput("")
  }

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) return
    setVariants(variants.filter((_, i) => i !== idx))
  }

  const updateColorCode = (colorName: string, hex: string) => {
    setColorCodes((prev) => ({
      ...prev,
      [colorName]: hex,
    }))
  }

  const addColorImage = (colorName: string, url: string) => {
    if (!url.trim()) return
    setColorImages((prev) => ({
      ...prev,
      [colorName]: [...(prev[colorName] || []), url.trim()],
    }))
    setColorUrlInputs((prev) => ({ ...prev, [colorName]: "" }))
  }

  const removeColorImage = (colorName: string, idx: number) => {
    setColorImages((prev) => ({
      ...prev,
      [colorName]: (prev[colorName] || []).filter((_, i) => i !== idx),
    }))
  }

  const uniqueColors = Array.from(new Set(variants.map((v) => v.color.trim()).filter(Boolean)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Get the primary image as thumbnail, all images as gallery
    const primaryImg = productImages.find((img) => img.isPrimary)
    const thumbnailUrl =
      primaryImg?.url ||
      productImages[0]?.url ||
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
    const allImageUrls = productImages.map((img) => img.url)

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          handle: formData.handle || "new-silhouette",
          subtitle: formData.subtitle,
          seriesName: formData.seriesName.trim(),
          description: formData.description,
          category: formData.category,
          collection: formData.collection,
          gsm: Number(formData.gsm),
          price: Number(formData.price),
          compareAtPrice: Number(formData.compareAtPrice),
          costPrice: Number(formData.costPrice),
          isGstIncluded: formData.isGstIncluded,
          gstType: formData.gstType,
          gstRate: formData.isGstIncluded ? 0 : Number(formData.gstRate),
          thumbnail: thumbnailUrl,
          images: allImageUrls.length > 0 ? allImageUrls : [thumbnailUrl],
          colorImages: colorImages,
          colorCodes: colorCodes,
          specifications: formData.specifications.trim(),
          fabricEngineering: formData.specifications.trim(),
          tags: formData.tags.split(",").map((t) => t.trim()),
          status: formData.status,
          scheduledAt:
            formData.status === "scheduled" && formData.scheduledAt
              ? new Date(formData.scheduledAt).toISOString()
              : null,
          variants: variants.map((v, i) => ({
            id: `var_${Date.now()}_${i}`,
            title: `${v.size} / ${v.color}`,
            ...v,
          })),
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to create product")
      }

      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
      alert(error instanceof Error ? error.message : "Failed to create product")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
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
              Product Creation Wizard
            </span>
            <h1 className="text-2xl font-black uppercase text-white font-display">
              Add New Garment
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "published" | "draft",
              })
            }
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold uppercase"
          >
            <option value="published">Publish Immediately</option>
            <option value="draft">Save as Draft</option>
          </select>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-xs font-extrabold uppercase rounded-xl transition-colors shadow-lg shadow-accent/20"
          >
            {isSaving ? (
              <Check className="h-4 w-4 animate-pulse" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Images, Title, Description, Variants */}
        <div className="lg:col-span-8 space-y-6">
          {/* Product Images */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <ProductImageUploader
              images={productImages}
              onChange={setProductImages}
              maxImages={10}
            />
          </div>

          {/* Basic Info */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">
              General Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Garment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 280 GSM Boxy Heavyweight Tee"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">URL Slug / Handle *</label>
                <input
                  type="text"
                  required
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Subtitle / Fabric Tagline</label>
                <input
                  type="text"
                  placeholder="100% Combed Compact Cotton • Pre-Shrunk Single Jersey"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
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
                  value={formData.seriesName}
                  onChange={(e) => setFormData({ ...formData, seriesName: e.target.value })}
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
                  placeholder="Detailed garment specifications, drape, weave structure, and care instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Heavyweight, Boxy, 280 GSM, Oversized"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Product Page Specifications & Details (Rich Text Editor) */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <RichTextEditor
              label="Product Page Specifications & Fit Details"
              value={formData.specifications}
              onChange={(val) => setFormData({ ...formData, specifications: val })}
              placeholder="Enter product specifications, fabric engineering, model advisory, and garment care details..."
              helperText="Use toolbar buttons for Bold (**text**), Italic (*text*), H3 Headings (### Title), and Bullet lists (• Item). Click 'Live Preview' to see the exact product page look."
            />
          </div>

          {/* Variants Matrix */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                  Variant & SKU Matrix ({variants.length})
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Configure sizes, colors, custom editable SKUs, inventory, and unit pricing.
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
                    <th className="pb-2">Price (₹)</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="text-zinc-300">
                      <td className="py-2.5">
                        <select
                          value={v.size}
                          onChange={(e) => {
                            const updated = [...variants]
                            updated[idx].size = e.target.value
                            setVariants(updated)
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
                            const updated = [...variants]
                            updated[idx].color = e.target.value
                            setVariants(updated)
                          }}
                          className="w-28 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="py-2.5">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...variants]
                            updated[idx].sku = e.target.value
                            setVariants(updated)
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
                            const updated = [...variants]
                            updated[idx].inventory = Number(e.target.value)
                            setVariants(updated)
                          }}
                          className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="py-2.5">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...variants]
                            updated[idx].price = Number(e.target.value)
                            setVariants(updated)
                          }}
                          className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
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
                  const assignedImages = colorImages[colorName] || []
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
                            style={{ backgroundColor: colorCodes[colorName] || "#18181b" }}
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
                              value={colorCodes[colorName] || "#18181b"}
                              onChange={(e) => updateColorCode(colorName, e.target.value)}
                              className="h-4 w-4 rounded cursor-pointer bg-transparent border-0 p-0"
                              title={`Choose hex color for ${colorName}`}
                            />
                            <input
                              type="text"
                              value={colorCodes[colorName] || "#18181b"}
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

        {/* Right Column (4 cols): Publishing, Pricing, GSM, Category, SEO */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing & Scheduling Engine */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" /> Publishing Status
              </h3>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  formData.status === "published"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : formData.status === "scheduled"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {formData.status === "published"
                  ? "Live on site"
                  : formData.status === "scheduled"
                  ? "Scheduled Drop"
                  : "Draft (Hidden)"}
              </span>
            </div>

            <div className="space-y-3">
              {/* Option 1: Publish Immediately */}
              <label
                onClick={() => setFormData({ ...formData, status: "published" })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.status === "published"
                    ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                    : "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="product_status"
                  checked={formData.status === "published"}
                  onChange={() => setFormData({ ...formData, status: "published" })}
                  className="mt-0.5 text-[#9A0000] accent-[#9A0000]"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Publish Immediately</p>
                  <p className="text-[11px] text-zinc-400">
                    Garment goes live on the storefront catalog right away.
                  </p>
                </div>
              </label>

              {/* Option 2: Schedule for Future Release */}
              <label
                onClick={() => setFormData({ ...formData, status: "scheduled" })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.status === "scheduled"
                    ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                    : "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="product_status"
                  checked={formData.status === "scheduled"}
                  onChange={() => setFormData({ ...formData, status: "scheduled" })}
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
                    Stays hidden from buyers until the exact date & time, then goes live automatically.
                  </p>
                </div>
              </label>

              {/* Scheduled Date/Time Picker */}
              {formData.status === "scheduled" && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Release Date & Time (IST) *</span>
                    <Clock className="h-3.5 w-3.5 text-accent" />
                  </label>
                  <input
                    type="datetime-local"
                    required={formData.status === "scheduled"}
                    value={formData.scheduledAt}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
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
                          setFormData({
                            ...formData,
                            status: "scheduled",
                            scheduledAt: d.toISOString().slice(0, 16),
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
                          setFormData({
                            ...formData,
                            status: "scheduled",
                            scheduledAt: d.toISOString().slice(0, 16),
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
                          setFormData({
                            ...formData,
                            status: "scheduled",
                            scheduledAt: d.toISOString().slice(0, 16),
                          })
                        }}
                        className="py-1 px-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold"
                      >
                        +1 Week
                      </button>
                    </div>
                  </div>

                  {formData.scheduledAt && (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-200">
                      📅 Goes live on:{" "}
                      <strong>
                        {new Date(formData.scheduledAt).toLocaleString("en-IN", {
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
                onClick={() => setFormData({ ...formData, status: "draft" })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.status === "draft"
                    ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                    : "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="product_status"
                  checked={formData.status === "draft"}
                  onChange={() => setFormData({ ...formData, status: "draft" })}
                  className="mt-0.5 text-[#9A0000] accent-[#9A0000]"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Save as Draft</p>
                  <p className="text-[11px] text-zinc-400">
                    Hidden from storefront until you manually publish or schedule it.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Pricing & Cost */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">
              Pricing & Economics
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400">Retail Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Compare-at MRP (₹)</label>
                <input
                  type="number"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Cost per Piece (₹)</label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 focus:outline-none"
                />
              </div>

              {/* GST Tax Configuration */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isGstIncluded}
                    onChange={(e) =>
                      setFormData({ ...formData, isGstIncluded: e.target.checked })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-accent focus:ring-0 focus:ring-offset-0 h-4 w-4 accent-[#9A0000]"
                  />
                  <span className="text-xs font-semibold text-white">
                    GST included in pricing
                  </span>
                </label>

                <div
                  className={`space-y-1.5 transition-all ${
                    formData.isGstIncluded ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-zinc-400">
                      Additional GST {formData.isGstIncluded ? "(Inclusive in Retail Price)" : "(Added at Checkout)"}
                    </label>
                    <div className="inline-flex rounded-lg bg-zinc-950 border border-zinc-800 p-0.5 text-[10px] font-bold">
                      <button
                        type="button"
                        disabled={formData.isGstIncluded}
                        onClick={() => setFormData({ ...formData, gstType: "percentage" })}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          formData.gstType === "percentage"
                            ? "bg-zinc-800 text-white font-black"
                            : "text-zinc-500 hover:text-zinc-300"
                        } ${formData.isGstIncluded ? "cursor-not-allowed" : ""}`}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        disabled={formData.isGstIncluded}
                        onClick={() => setFormData({ ...formData, gstType: "amount" })}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          formData.gstType === "amount"
                            ? "bg-zinc-800 text-white font-black"
                            : "text-zinc-500 hover:text-zinc-300"
                        } ${formData.isGstIncluded ? "cursor-not-allowed" : ""}`}
                      >
                        Amount (₹)
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      disabled={formData.isGstIncluded}
                      value={formData.isGstIncluded ? "" : formData.gstRate}
                      placeholder={
                        formData.isGstIncluded
                          ? "GST already inclusive in MRP"
                          : formData.gstType === "percentage"
                          ? "e.g. 18%"
                          : "e.g. 150"
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gstRate: Number(e.target.value),
                        })
                      }
                      className={`w-full rounded-xl px-3 py-2 text-xs transition-colors focus:outline-none ${
                        formData.isGstIncluded
                          ? "bg-zinc-950/60 border border-zinc-800/40 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-950 border border-zinc-800 text-white focus:border-accent font-bold"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-zinc-500 pointer-events-none">
                      {formData.gstType === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {formData.isGstIncluded
                      ? "When checked, retail price is inclusive of all taxes and 0 extra tax is added at checkout."
                      : formData.gstType === "percentage"
                      ? `+${formData.gstRate || 0}% GST will be computed and added to cart/checkout.`
                      : `+₹${formData.gstRate || 0} fixed GST will be computed and added to cart/checkout.`}
                  </p>
                </div>
              </div>

              {/* Margin Calculator */}
              {formData.price > 0 && formData.costPrice > 0 && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Margin Calculator</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Gross Profit</span>
                    <span className="text-green-400 font-bold">
                      ₹{(formData.price - formData.costPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Margin %</span>
                    <span className="text-green-400 font-bold">
                      {((1 - formData.costPrice / formData.price) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* D2C Fashion Specifications */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">
              Garment Specs
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400">Fabric Weight (GSM) *</label>
                <select
                  value={formData.gsm}
                  onChange={(e) => setFormData({ ...formData, gsm: Number(e.target.value) })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value={240}>240 GSM (Midweight)</option>
                  <option value={280}>280 GSM (Core Heavyweight)</option>
                  <option value={320}>320 GSM (Ultra Heavyweight)</option>
                  <option value={380}>380 GSM (Fleece Crewneck)</option>
                  <option value={400}>400 GSM (French Terry)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="Heavyweight Tees">Heavyweight Tees</option>
                  <option value="Hoodies & Fleece">Hoodies & Fleece</option>
                  <option value="Cargos & Bottoms">Cargos & Bottoms</option>
                  <option value="Sweatshirts">Sweatshirts</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Collection Drop *</label>
                <select
                  value={formData.collection}
                  onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="Core Heavyweight">Core Heavyweight</option>
                  <option value="French Terry Fleece">French Terry Fleece</option>
                  <option value="Parachute Cargos">Parachute Cargos</option>
                  <option value="Drop 04 Autumn">Drop 04 Autumn</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Summary Card */}
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
                    {formData.title || "Product Title"}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    ₹{formData.price.toLocaleString("en-IN")}
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
