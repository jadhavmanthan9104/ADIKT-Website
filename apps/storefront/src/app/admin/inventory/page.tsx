"use client"

import React, { useState, useEffect } from "react"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { AdminModal } from "@/components/admin/AdminModal"
import {
  Boxes,
  Package,
  AlertTriangle,
  AlertCircle,
  Plus,
  Minus,
  Check,
  History,
  TrendingDown,
  Layers,
  Search,
  Warehouse,
  ShieldCheck,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from "lucide-react"

interface InventoryItem {
  id: string
  sku: string
  barcode: string
  productId: string
  productTitle: string
  variantId: string
  variantTitle: string
  size: string
  color: string
  gsm?: number
  location: string
  stockedQuantity: number
  reservedQuantity: number
  availableQuantity: number
  lowStockThreshold: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
  weightGrams?: number
  price: number
  thumbnail?: string
}

interface ProductGroup {
  productId: string
  title: string
  handle: string
  category: string
  thumbnail: string
  totalStocked: number
  totalReserved: number
  totalAvailable: number
  variantCount: number
  status: "Healthy" | "Low Stock" | "Out of Stock"
}

interface HistoryEntry {
  id: string
  sku: string
  productTitle: string
  variantTitle: string
  delta: number
  previousStocked: number
  newStocked: number
  type: string
  reason: string
  location: string
  user: string
  timestamp: string
}

type TabType = "overview" | "by-product" | "by-variant" | "low-stock" | "out-of-stock" | "history"

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [matrix, setMatrix] = useState<InventoryItem[]>([])
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [historyLog, setHistoryLog] = useState<HistoryEntry[]>([])
  const [kpis, setKpis] = useState({
    totalStocked: 0,
    totalReserved: 0,
    activeCheckoutSessions: 0,
    totalAvailable: 0,
    totalSkus: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    locations: ["Tirupur Warehouse (WH-1)", "Mumbai Metro Hub (WH-2)"],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Adjustment Modal State
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustmentAction, setAdjustmentAction] = useState<"add" | "remove" | "damaged" | "return">("add")
  const [quantity, setQuantity] = useState<number>(10)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch("/api/inventory")
      if (res.ok) {
        const data = await res.json()
        setMatrix(data.matrix || [])
        setProductGroups(data.byProduct || [])
        setHistoryLog(data.history || [])
        if (data.kpis) setKpis(data.kpis)
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // 3-second live auto-refresh polling for real-time storefront synchronization
    const interval = setInterval(() => {
      fetchData()
    }, 3000)

    const handleFocus = () => fetchData()
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleFocus)
    }
  }, [])

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    setIsSubmitting(true)
    setActionSuccess(null)

    try {
      const delta =
        adjustmentAction === "add" || adjustmentAction === "return" ? quantity : -quantity

      const typeMap: Record<string, string> = {
        add: "RESTOCK",
        remove: "MANUAL_ADJUSTMENT",
        damaged: "DAMAGED_QUARANTINE",
        return: "RETURN_RESTOCK",
      }

      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: selectedItem.sku,
          delta,
          type: typeMap[adjustmentAction] || "MANUAL_ADJUSTMENT",
          reason: reason || `Manual adjustment (${adjustmentAction})`,
          location: selectedItem.location,
          user: "Admin",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to adjust stock")

      setActionSuccess(`Stock for ${selectedItem.sku} adjusted to ${data.newStocked} units.`)
      await fetchData()

      setTimeout(() => {
        setSelectedItem(null)
        setActionSuccess(null)
        setQuantity(10)
        setReason("")
      }, 1500)
    } catch (err: any) {
      alert(`Adjustment error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const lowStockItems = matrix.filter((i) => i.status === "Low Stock")
  const outOfStockItems = matrix.filter((i) => i.status === "Out of Stock")

  // Columns for Inventory by Variant
  const variantColumns: Column<InventoryItem>[] = [
    {
      header: "Garment & Variant",
      accessor: (item) => (
        <div className="flex items-center gap-3">
          {item.thumbnail && (
            <img
              src={item.thumbnail}
              alt={item.productTitle}
              className="h-10 w-10 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
            />
          )}
          <div>
            <span className="font-bold text-white block text-xs">{item.productTitle}</span>
            <span className="text-[11px] text-zinc-400">
              {item.variantTitle} {item.gsm ? `• ${item.gsm} GSM` : ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Size / Color",
      accessor: (item) => (
        <div>
          <span className="text-xs font-mono font-bold text-accent">{item.size}</span>
          <span className="text-[11px] text-zinc-400 block">{item.color}</span>
        </div>
      ),
    },
    {
      header: "SKU & Barcode",
      accessor: (item) => (
        <div>
          <span className="font-mono text-white text-xs font-bold">{item.sku}</span>
          <p className="text-[10px] font-mono text-zinc-500">{item.barcode}</p>
        </div>
      ),
    },
    {
      header: "Stocked Qty",
      accessor: (item) => (
        <span className="text-xs font-mono text-zinc-300 font-bold">{item.stockedQuantity}</span>
      ),
    },
    {
      header: "Reserved Qty",
      accessor: (item) => (
        <span className="text-xs font-mono text-amber-400">
          {item.reservedQuantity > 0 ? `${item.reservedQuantity} locked` : "0"}
        </span>
      ),
    },
    {
      header: "Available Qty",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-black text-sm font-mono ${
              item.availableQuantity === 0
                ? "text-red-400"
                : item.availableQuantity <= item.lowStockThreshold
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {item.availableQuantity}
          </span>
          {item.availableQuantity <= item.lowStockThreshold && item.availableQuantity > 0 && (
            <span className="p-0.5 rounded bg-amber-500/20 text-amber-400" title="Low stock threshold">
              <AlertTriangle className="h-3 w-3" />
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${
            item.status === "In Stock"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : item.status === "Low Stock"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Warehouse",
      accessor: (item) => (
        <span className="text-zinc-400 text-[11px] block truncate max-w-[130px]">
          {item.location}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (item) => (
        <button
          onClick={() => setSelectedItem(item)}
          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-xs transition-colors"
        >
          Adjust Stock
        </button>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Medusa v2 Inventory Management Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time synchronization across SKU variants, warehouse locations, and atomic reservations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Sync (3s)</span>
          </div>

          <button
            onClick={() => fetchData()}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              const firstItem = matrix[0]
              if (firstItem) setSelectedItem(firstItem)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase shadow-lg shadow-accent/20 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Quick Stock Adjustment
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800 text-xs scrollbar-none">
        {[
          { id: "overview", label: "Inventory Overview", count: null },
          { id: "by-product", label: "Inventory by Product", count: productGroups.length },
          { id: "by-variant", label: "Inventory by Variant", count: matrix.length },
          { id: "low-stock", label: "Low Stock Items", count: lowStockItems.length },
          { id: "out-of-stock", label: "Out of Stock", count: outOfStockItems.length },
          { id: "history", label: "Inventory History Log", count: historyLog.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-black shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  activeTab === tab.id
                    ? "bg-zinc-200 text-black"
                    : tab.id === "low-stock" && tab.count > 0
                    ? "bg-amber-500/20 text-amber-400"
                    : tab.id === "out-of-stock" && tab.count > 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* VIEW 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5 text-accent" /> Total Stocked Units
              </span>
              <p className="text-xl sm:text-2xl font-black text-white font-display">
                {kpis.totalStocked.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-500">Across {kpis.totalSkus} sellable SKU variants</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Active Checkout Sessions
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-400 font-display">
                {kpis.activeCheckoutSessions}
              </p>
              <p className="text-[10px] text-zinc-500">{kpis.totalReserved} reserved unit(s) locked in checkout</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> Sellable Available Stock
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
                {kpis.totalAvailable.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-500">Stocked minus reserved units</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Low / Out of Stock SKUs
              </span>
              <p className="text-xl sm:text-2xl font-black text-red-400 font-display">
                {kpis.lowStockCount + kpis.outOfStockCount}
              </p>
              <p className="text-[10px] text-zinc-500">
                {kpis.lowStockCount} Low Stock • {kpis.outOfStockCount} Out of Stock
              </p>
            </div>
          </div>

          {/* Warehouse Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-accent" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Primary Garment Fulfillment Hub (WH-1)
                  </h3>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Primary
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Tirupur Milled Garment Center, Tamil Nadu (PIN: 641652). Houses heavyweight 280 GSM single jerseys & 400 GSM French Terry Fleece.
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/60 font-mono">
                <span className="text-zinc-500">Stock Allocation:</span>
                <span className="text-white font-bold">{kpis.totalStocked} units</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Express Metro Distribution Hub (WH-2)
                  </h3>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Standby / Forward Staging
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Bhiwandi Logistics Hub, Mumbai, Maharashtra (PIN: 421302). Pre-staged for same-day and next-day Mumbai & Pune deliveries.
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/60 font-mono">
                <span className="text-zinc-500">Connected Gateways:</span>
                <span className="text-white font-bold">Bluedart Air • Delhivery Surface</span>
              </div>
            </div>
          </div>

          {/* Quick Matrix Snapshot */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" /> Active Sellable Variants ({matrix.length})
              </h3>
              <button
                onClick={() => setActiveTab("by-variant")}
                className="text-xs text-accent hover:underline font-bold flex items-center gap-1"
              >
                View Full Variant Table <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <AdminDataTable
              data={matrix.slice(0, 5)}
              columns={variantColumns}
              searchPlaceholder="Search top variants..."
              filterKey={(item, q) =>
                item.productTitle.toLowerCase().includes(q.toLowerCase()) ||
                item.sku.toLowerCase().includes(q.toLowerCase())
              }
            />
          </div>
        </div>
      )}

      {/* VIEW 2: Inventory by Parent Product */}
      {activeTab === "by-product" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productGroups.map((pg) => (
              <div
                key={pg.productId}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={pg.thumbnail}
                      alt={pg.title}
                      className="h-16 w-16 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                        {pg.category}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">{pg.title}</h3>
                      <span className="text-[11px] text-zinc-400 block">{pg.variantCount} Size/Color Variants</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Stocked</span>
                      <strong className="text-white text-xs font-bold">{pg.totalStocked}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-500 uppercase block font-sans">Reserved</span>
                      <strong className="text-amber-400 text-xs font-bold">{pg.totalReserved}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500 uppercase block font-sans">Available</span>
                      <strong className="text-emerald-400 text-xs font-bold">{pg.totalAvailable}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      pg.status === "Healthy"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : pg.status === "Low Stock"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {pg.status}
                  </span>

                  <button
                    onClick={() => setActiveTab("by-variant")}
                    className="text-xs text-white hover:text-accent font-bold"
                  >
                    Inspect Variants →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Inventory by Variant */}
      {activeTab === "by-variant" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <AdminDataTable
            data={matrix}
            columns={variantColumns}
            searchPlaceholder="Search by SKU, product, size, barcode..."
            filterKey={(item, q) =>
              item.productTitle.toLowerCase().includes(q.toLowerCase()) ||
              item.sku.toLowerCase().includes(q.toLowerCase()) ||
              item.size.toLowerCase().includes(q.toLowerCase()) ||
              item.color.toLowerCase().includes(q.toLowerCase()) ||
              item.barcode.includes(q)
            }
          />
        </div>
      )}

      {/* VIEW 4: Low Stock Items */}
      {activeTab === "low-stock" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              The following {lowStockItems.length} SKU variants have triggered the low-stock safety threshold ($\le$ 5 available units). Consider restocking.
            </span>
          </div>

          <AdminDataTable
            data={lowStockItems}
            columns={variantColumns}
            searchPlaceholder="Search low stock SKUs..."
            filterKey={(item, q) =>
              item.productTitle.toLowerCase().includes(q.toLowerCase()) ||
              item.sku.toLowerCase().includes(q.toLowerCase())
            }
          />
        </div>
      )}

      {/* VIEW 5: Out of Stock Items */}
      {activeTab === "out-of-stock" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>
              The following {outOfStockItems.length} SKU variants have 0 available units. Customer checkout is disabled for these variants to prevent overselling.
            </span>
          </div>

          <AdminDataTable
            data={outOfStockItems}
            columns={variantColumns}
            searchPlaceholder="Search out of stock SKUs..."
            filterKey={(item, q) =>
              item.productTitle.toLowerCase().includes(q.toLowerCase()) ||
              item.sku.toLowerCase().includes(q.toLowerCase())
            }
          />
        </div>
      )}

      {/* VIEW 6: Inventory History Audit Log */}
      {activeTab === "history" && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-white">
              <History className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Chronological Inventory Audit Trail ({historyLog.length})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">Immutable audit logs</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {historyLog.map((h, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white font-bold">{h.sku}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        h.type === "RESTOCK"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : h.type === "PURCHASE_DEDUCTION"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : h.type === "DAMAGED_QUARANTINE"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : h.type === "RETURN_RESTOCK"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {h.type}
                    </span>
                    <span className="text-zinc-500 text-[11px]">({h.productTitle})</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{h.reason}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {h.timestamp} • Location: {h.location} • Handled by: {h.user}
                  </p>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`font-black text-sm block ${
                      h.delta > 0 ? "text-emerald-400" : h.delta < 0 ? "text-red-400" : "text-zinc-400"
                    }`}
                  >
                    {h.delta > 0 ? `+${h.delta}` : h.delta} units
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    {h.previousStocked} → {h.newStocked} stocked
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <AdminModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Stock Adjustment: ${selectedItem.sku}`}
          subtitle={`${selectedItem.productTitle} (${selectedItem.variantTitle})`}
        >
          {actionSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          ) : (
            <form onSubmit={handleAdjust} className="space-y-4 text-xs">
              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-sans">Stocked</span>
                  <strong className="text-white text-sm font-bold">{selectedItem.stockedQuantity}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-amber-500 uppercase block font-sans">Reserved</span>
                  <strong className="text-amber-400 text-sm font-bold">{selectedItem.reservedQuantity}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-500 uppercase block font-sans">Available</span>
                  <strong className="text-emerald-400 text-sm font-bold">{selectedItem.availableQuantity}</strong>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {[
                    { id: "add", label: "Add Stock (Restock Intake)" },
                    { id: "remove", label: "Remove Stock (Correction)" },
                    { id: "damaged", label: "Mark Damaged (Quarantine)" },
                    { id: "return", label: "Record Customer Return" },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setAdjustmentAction(act.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        adjustmentAction === act.id
                          ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
                          : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block">Quantity Units</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block">Adjustment Note / Batch Code</label>
                <input
                  type="text"
                  placeholder="e.g. Tirupur Mill Batch #409 arrival inspection"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase rounded-xl transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Confirm & Save Adjustment"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </AdminModal>
      )}
    </div>
  )
}
