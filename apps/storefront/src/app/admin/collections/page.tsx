"use client"

export const dynamic = "force-dynamic"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { AdminProduct } from "@/lib/admin-api"
import {
  Plus,
  Edit2,
  Trash2,
  Grid,
  Search,
  Check,
  Package,
  Layers,
  X,
  Sparkles,
  Tag,
  CheckCircle2,
  ArrowRight,
  Filter,
  Eye,
  Calendar,
  Clock,
} from "lucide-react"

interface CollectionItem {
  id: string
  title: string
  handle: string
  description: string
  launchDate: string
  status: "Active" | "Scheduled" | "Draft" | "Archived"
  scheduledAt?: string | null
}

const INITIAL_COLLECTIONS: CollectionItem[] = [
  {
    id: "col_1",
    title: "Core Heavyweight",
    handle: "core-heavyweight",
    description: "Foundational 280–400 GSM luxury basics designed for perpetual replenishment.",
    launchDate: "Aug 2026",
    status: "Active",
    scheduledAt: null,
  },
  {
    id: "col_2",
    title: "French Terry Fleece",
    handle: "french-terry-fleece",
    description: "400 GSM custom loopback knit hoodies and high-density sweats.",
    launchDate: "Aug 2026",
    status: "Active",
    scheduledAt: null,
  },
  {
    id: "col_3",
    title: "Parachute Cargos",
    handle: "parachute-cargos",
    description: "Modular tactical utility bottoms cut in high-tensile ripstop.",
    launchDate: "Aug 2026",
    status: "Active",
    scheduledAt: null,
  },
  {
    id: "col_4",
    title: "Drop 04 Autumn",
    handle: "drop-04-autumn",
    description: "Limited seasonal capsule showcasing our heaviest knit structures to date.",
    launchDate: "Sep 2026",
    status: "Active",
    scheduledAt: null,
  },
]

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS)
  const [allProducts, setAllProducts] = useState<AdminProduct[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    handle: "",
    description: "",
    launchDate: "Aug 2026",
    status: "Active" as "Active" | "Scheduled" | "Draft" | "Archived",
    scheduledAt: "",
  })
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  // Product selector filter states
  const [productSearch, setProductSearch] = useState("")
  const [productCategoryFilter, setProductCategoryFilter] = useState("All")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // 1. Fetch products & collections from API
  const loadData = async () => {
    try {
      setIsLoadingProducts(true)
      const [prodRes, colRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/collections"),
      ])

      if (prodRes.ok) {
        const pData = await prodRes.json()
        if (pData.adminProducts) {
          setAllProducts(pData.adminProducts)
        }
      }

      if (colRes.ok) {
        const cData = await colRes.json()
        if (cData.collections && cData.collections.length > 0) {
          setCollections(cData.collections)
        }
      }
    } catch (err) {
      console.error("Failed to load products/collections:", err)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Derive products assigned to a collection
  const getProductsForCollection = (col: CollectionItem) => {
    const colTitleLower = col.title.toLowerCase()
    const colHandleLower = col.handle.toLowerCase()
    return allProducts.filter((p) => {
      const pColLower = (p.collection || "").toLowerCase()
      return (
        pColLower === colTitleLower ||
        pColLower === colHandleLower ||
        pColLower.replace(/\s+/g, "-") === colHandleLower
      )
    })
  }

  // Open modal for new collection
  const handleOpenCreateModal = () => {
    setEditingCollectionId(null)
    setFormData({
      title: "",
      handle: "",
      description: "",
      launchDate: "Aug 2026",
      status: "Active",
      scheduledAt: "",
    })
    setSelectedProductIds([])
    setProductSearch("")
    setProductCategoryFilter("All")
    setIsModalOpen(true)
  }

  // Open modal for editing collection
  const handleOpenEditModal = (col: CollectionItem) => {
    setEditingCollectionId(col.id)
    setFormData({
      title: col.title,
      handle: col.handle,
      description: col.description,
      launchDate: col.launchDate,
      status: col.status || "Active",
      scheduledAt: col.scheduledAt
        ? new Date(col.scheduledAt).toISOString().slice(0, 16)
        : "",
    })
    // Pre-select products currently in this collection
    const currentProds = getProductsForCollection(col)
    setSelectedProductIds(currentProds.map((p) => p.id))
    setProductSearch("")
    setProductCategoryFilter("All")
    setIsModalOpen(true)
  }

  // Handle saving collection & assigning products
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSaving(true)
    const handle = formData.handle.trim() || formData.title.toLowerCase().replace(/\s+/g, "-")
    const title = formData.title.trim()
    const scheduledIso =
      formData.status === "Scheduled" && formData.scheduledAt
        ? new Date(formData.scheduledAt).toISOString()
        : null

    try {
      const collectionItem: CollectionItem = {
        id: editingCollectionId || `col_${Date.now()}`,
        title,
        handle,
        description: formData.description,
        launchDate: formData.launchDate,
        status: formData.status,
        scheduledAt: scheduledIso,
      }

      let updatedCols = [...collections]
      if (editingCollectionId) {
        updatedCols = updatedCols.map((c) => (c.id === editingCollectionId ? collectionItem : c))
      } else {
        updatedCols.unshift(collectionItem)
      }

      setCollections(updatedCols)

      // Persist collection via POST /api/collections
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectionItem),
      })

      // Update collection field on products in parallel via PUT /api/products/[id]
      const updatePromises = selectedProductIds.map((pId) => {
        return fetch(`/api/products/${pId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection: title }),
        }).catch((err) => console.error(`Error updating product ${pId}:`, err))
      })

      await Promise.all(updatePromises)

      // Refresh data from server
      await loadData()

      setSaveSuccess(
        editingCollectionId
          ? `Updated "${title}" with ${selectedProductIds.length} products.`
          : `Created collection "${title}" with ${selectedProductIds.length} products assigned!`
      )
      setTimeout(() => setSaveSuccess(null), 4000)
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error saving collection and product assignments:", err)
      alert("An error occurred while saving the collection.")
    } finally {
      setIsSaving(false)
    }
  }

  // Filter products for the picker inside the modal
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch =
        !productSearch.trim() ||
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.gsm?.toString().includes(productSearch)
      const matchesCat =
        productCategoryFilter === "All" || p.category === productCategoryFilter
      return matchesSearch && matchesCat
    })
  }, [allProducts, productSearch, productCategoryFilter])

  // Toggle single product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  // Select all filtered
  const selectAllFiltered = () => {
    const idsToAdd = filteredProducts.map((p) => p.id)
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...idsToAdd])))
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedProductIds([])
  }

  // Categories list for tabs
  const categoriesList = useMemo(() => {
    const cats = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)))
    return ["All", ...cats]
  }, [allProducts])

  // Table Columns
  const columns: Column<CollectionItem>[] = [
    {
      header: "Collection Drop",
      accessor: (c) => {
        const prods = getProductsForCollection(c)
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-accent shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white block">{c.title}</span>
              <span className="text-[11px] font-mono text-zinc-500">/collections/{c.handle}</span>
            </div>
          </div>
        )
      },
    },
    {
      header: "Narrative & Description",
      accessor: (c) => <span className="text-zinc-400 max-w-sm block truncate">{c.description}</span>,
    },
    {
      header: "Assigned Garments",
      accessor: (c) => {
        const prods = getProductsForCollection(c)
        return (
          <div className="space-y-1">
            <span className="font-bold text-white block text-xs">
              {prods.length} {prods.length === 1 ? "piece" : "pieces"}
            </span>
            {prods.length > 0 && (
              <div className="flex items-center gap-1 -space-x-1.5 overflow-hidden max-w-[120px]">
                {prods.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="relative h-6 w-6 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0"
                    title={p.title}
                  >
                    <Image
                      src={p.thumbnail || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80"}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {prods.length > 4 && (
                  <span className="text-[9px] font-bold text-zinc-400 pl-2">
                    +{prods.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: "Launch Date",
      accessor: (c) => <span className="text-zinc-300 font-mono text-xs">{c.launchDate}</span>,
    },
    {
      header: "Status",
      accessor: (c) => {
        const isScheduledFuture =
          c.status === "Scheduled" &&
          c.scheduledAt &&
          new Date(c.scheduledAt).getTime() > Date.now()

        const isScheduledLive =
          c.status === "Scheduled" &&
          c.scheduledAt &&
          new Date(c.scheduledAt).getTime() <= Date.now()

        if (isScheduledFuture) {
          const dateStr = new Date(c.scheduledAt!).toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/30">
                <span>🟡</span> Scheduled
              </span>
              <p className="text-[10px] text-amber-300/80 font-mono">
                {dateStr}
              </p>
            </div>
          )
        }

        if (isScheduledLive || c.status === "Active") {
          return (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
            </span>
          )
        }

        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-zinc-800 text-zinc-400 border-zinc-700">
            {c.status || "Draft"}
          </span>
        )
      },
    },
    {
      header: "Actions",
      accessor: (c) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleOpenEditModal(c)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Edit Collection & Assigned Products"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete collection "${c.title}"?`)) {
                setCollections(collections.filter((col) => col.id !== c.id))
              }
            }}
            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            title="Delete Collection"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            Curated Drops & Capsules
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Collections ({collections.length})
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create capsule collections and assign products directly from your product catalog.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" /> Create Collection
        </button>
      </div>

      {/* Collections Data Table */}
      <AdminDataTable
        data={collections}
        columns={columns}
        searchPlaceholder="Search collections by title or description..."
        filterKey={(c, q) =>
          c.title.toLowerCase().includes(q.toLowerCase()) ||
          c.handle.toLowerCase().includes(q.toLowerCase())
        }
      />

      {/* CREATE / EDIT COLLECTION MODAL WITH PRODUCT SELECTOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-accent">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    {editingCollectionId ? "Edit Collection & Products" : "Create New Drop Collection"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Define collection details and select products to showcase.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveCollection} className="space-y-6 overflow-y-auto pr-1 flex-1">
              {/* Section 1: Basic Collection Details */}
              <div className="space-y-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> 1. Collection Identity
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-zinc-400 font-medium">Collection Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vintage Heavyweight Fleece"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.target.value,
                          handle:
                            formData.handle ||
                            e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-medium">Handle / URL Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. vintage-heavyweight-fleece"
                      value={formData.handle}
                      onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 font-medium">Description & Narrative</label>
                    <textarea
                      rows={2}
                      placeholder="Story and craft details for this drop..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-medium">Launch Season / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Aug 2026 or Drop 04"
                      value={formData.launchDate}
                      onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-3 pt-2 border-t border-zinc-800/80">
                    <label className="text-zinc-300 font-bold block">
                      Publishing Status & Scheduling *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Live Immediately */}
                      <label
                        onClick={() => setFormData({ ...formData, status: "Active" })}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.status === "Active"
                            ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="col_status"
                          checked={formData.status === "Active"}
                          onChange={() => setFormData({ ...formData, status: "Active" })}
                          className="mt-0.5 text-[#9A0000] accent-[#9A0000]"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">Active (Live Now)</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Visible across the storefront immediately.
                          </p>
                        </div>
                      </label>

                      {/* Schedule for Future */}
                      <label
                        onClick={() => setFormData({ ...formData, status: "Scheduled" })}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.status === "Scheduled"
                            ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="col_status"
                          checked={formData.status === "Scheduled"}
                          onChange={() => setFormData({ ...formData, status: "Scheduled" })}
                          className="mt-0.5 text-[#9A0000] accent-[#9A0000]"
                        />
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1">
                            <span>Schedule Drop</span>
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1 rounded">
                              🟡 Auto
                            </span>
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Goes live automatically on scheduled date.
                          </p>
                        </div>
                      </label>

                      {/* Draft / Hidden */}
                      <label
                        onClick={() => setFormData({ ...formData, status: "Draft" })}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.status === "Draft" || formData.status === "Archived"
                            ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="col_status"
                          checked={formData.status === "Draft" || formData.status === "Archived"}
                          onChange={() => setFormData({ ...formData, status: "Draft" })}
                          className="mt-0.5 text-[#9A0000] accent-[#9A0000]"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">Draft / Hidden</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Hidden from store until you publish.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* DateTime Picker for Scheduled Collection */}
                    {formData.status === "Scheduled" && (
                      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 animate-in fade-in duration-200">
                        <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                          <span>Release Date & Time (IST) *</span>
                          <Clock className="h-3.5 w-3.5 text-accent" />
                        </label>
                        <input
                          type="datetime-local"
                          required={formData.status === "Scheduled"}
                          value={formData.scheduledAt}
                          min={new Date().toISOString().slice(0, 16)}
                          onChange={(e) =>
                            setFormData({ ...formData, scheduledAt: e.target.value })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent font-mono"
                        />

                        {/* Quick Presets */}
                        <div className="space-y-1">
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
                                  status: "Scheduled",
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
                                  status: "Scheduled",
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
                                  status: "Scheduled",
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
                          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-200">
                            📅 Collection goes live on:{" "}
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
                  </div>
                </div>
              </div>

              {/* Section 2: Product Picker & Multi-Select */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" /> 2. Add Products from Catalog
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Select which products belong to this collection.
                    </p>
                  </div>

                  {/* Quick Select / Deselect Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                      {selectedProductIds.length} Selected
                    </span>
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase"
                    >
                      Select All
                    </button>
                    {selectedProductIds.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 text-xs font-bold uppercase"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Selected Products Preview Chips */}
                {selectedProductIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    {selectedProductIds.map((pId) => {
                      const prod = allProducts.find((p) => p.id === pId)
                      if (!prod) return null
                      return (
                        <div
                          key={pId}
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-bold"
                        >
                          <div className="relative h-4 w-4 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                            <Image
                              src={prod.thumbnail || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=50&q=80"}
                              alt={prod.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="truncate max-w-[140px]">{prod.title}</span>
                          <button
                            type="button"
                            onClick={() => toggleProductSelection(pId)}
                            className="text-zinc-500 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Search & Category Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search products by title, category, or GSM..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProductCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                          productCategoryFilter === cat
                            ? "bg-accent text-white"
                            : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Selectable Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-zinc-500 text-xs">
                      No products found matching your search.
                    </div>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isSelected = selectedProductIds.includes(prod.id)
                      return (
                        <div
                          key={prod.id}
                          onClick={() => toggleProductSelection(prod.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group select-none ${
                            isSelected
                              ? "bg-accent/10 border-accent text-white shadow-sm"
                              : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          {/* Checkbox indicator */}
                          <div
                            className={`h-4 w-4 rounded-md flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-accent border-accent text-white"
                                : "border-zinc-700 bg-zinc-900 group-hover:border-zinc-500"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>

                          {/* Thumbnail */}
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                            <Image
                              src={
                                prod.thumbnail ||
                                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80"
                              }
                              alt={prod.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h5 className="font-bold text-xs truncate text-white">
                              {prod.title}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                              <span>{prod.category}</span>
                              <span>•</span>
                              <span>{prod.gsm} GSM</span>
                              <span>•</span>
                              <span className="font-bold text-white">₹{prod.price}</span>
                            </div>
                            {prod.collection && (
                              <span className="text-[9px] text-zinc-500 truncate block">
                                In: {prod.collection}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800 shrink-0">
                <span className="text-xs text-zinc-400">
                  {selectedProductIds.length} products will be assigned to this collection.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-extrabold uppercase shadow-lg shadow-accent/20 transition-transform active:scale-95"
                  >
                    {isSaving ? "Saving..." : editingCollectionId ? "Save Changes" : "Create Collection"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
