"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AdminOrder } from "@/lib/admin-api"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  ShoppingBag,
  Eye,
  Truck,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  Banknote,
  CheckCircle2,
  X,
} from "lucide-react"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>("")

  // COD Modal State
  const [selectedCodOrder, setSelectedCodOrder] = useState<AdminOrder | null>(null)
  const [codNote, setCodNote] = useState("")
  const [isSettling, setIsSettling] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders")
      if (res.ok) {
        const data = await res.json()
        if (data.orders) {
          setOrders(data.orders)
          setLastSyncTime(new Date().toLocaleTimeString())
        }
      }
    } catch (err) {
      console.warn("Failed to fetch admin orders:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // 3-Second Live Auto-Refresh Polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
    }, 3000)

    const handleFocus = () => fetchOrders()
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleFocus)
    }
  }, [fetchOrders])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchOrders()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleQuickDeliver = async (order: AdminOrder) => {
    const isCod =
      order.paymentMethod?.toLowerCase().includes("cod") ||
      order.paymentMethod?.toLowerCase().includes("cash on delivery") ||
      order.paymentStatus === "Pending"

    if (isCod && order.paymentStatus !== "Captured" && order.paymentStatus !== "Settled") {
      setSelectedCodOrder(order)
      setCodNote("")
    } else {
      try {
        const res = await fetch(`/api/admin/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Delivered" }),
        })
        if (res.ok) fetchOrders()
      } catch (err) {
        console.warn("Failed to update status:", err)
      }
    }
  }

  const handleConfirmCodCollection = async () => {
    if (!selectedCodOrder) return
    setIsSettling(true)
    try {
      const res = await fetch(`/api/admin/orders/${selectedCodOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Delivered",
          isCodCollected: true,
          collectionNote: codNote.trim() || `Cash collected (₹${selectedCodOrder.total}) by courier delivery agent.`,
        }),
      })
      if (res.ok) {
        setSelectedCodOrder(null)
        await fetchOrders()
      }
    } catch (err) {
      console.warn("Failed to confirm COD collection:", err)
    } finally {
      setIsSettling(false)
    }
  }

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase())

  const columns: Column<AdminOrder>[] = [
    {
      header: "Order Reference",
      accessor: (o) => (
        <div>
          <Link
            href={`/admin/orders/${o.id}`}
            className="font-bold text-white font-mono hover:text-accent transition-colors block"
          >
            #{o.displayId}
          </Link>
          <span className="text-[11px] text-zinc-500">{formatDate(o.createdAt)}</span>
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: (o) => (
        <div>
          <span className="font-bold text-white block">{o.customer?.name || "Customer"}</span>
          <span className="text-[11px] text-zinc-400">{o.customer?.email}</span>
        </div>
      ),
    },
    {
      header: "Payment",
      accessor: (o) => {
        const isCod =
          o.paymentMethod?.toLowerCase().includes("cod") ||
          o.paymentMethod?.toLowerCase().includes("cash on delivery")

        return (
          <div>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                o.paymentStatus === "Captured" || o.paymentStatus === "Settled"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {o.paymentStatus}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
              {isCod && <Banknote className="h-3 w-3 text-amber-400" />}
              {isCod ? "Cash on Delivery" : "Razorpay Online"}
            </p>
          </div>
        )
      },
    },
    {
      header: "Fulfillment Status",
      accessor: (o) => (
        <div>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              o.status === "Delivered"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : o.status === "Shipped"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : o.status === "Processing" || o.status === "Packed"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-zinc-800 text-zinc-300 border-zinc-700"
            }`}
          >
            {o.status}
          </span>
          {o.awb && (
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5 truncate max-w-[120px]">
              AWB: {o.awb}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Total",
      accessor: (o) => (
        <div>
          <span className="font-bold text-white">{formatPrice(o.total)}</span>
          <p className="text-[11px] text-zinc-500">{(o.items || []).length} items</p>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (o) => (
        <div className="flex items-center justify-end gap-2">
          {o.status !== "Delivered" && (
            <button
              onClick={() => handleQuickDeliver(o)}
              title="Mark as Delivered"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5" /> Deliver
            </button>
          )}
          <Link
            href={`/admin/orders/${o.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
          >
            <Eye className="h-3.5 w-3.5" /> Manage
          </Link>
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Order Operations & Fulfillment
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync (3s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Orders ({orders.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["all", "processing", "packed", "shipped", "delivered", "pending"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors border ${
                  statusFilter === st
                    ? "bg-accent text-white border-accent shadow-sm shadow-accent/20"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            title={`Last synchronized at ${lastSyncTime || "now"}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
          </button>
        </div>
      </div>

      <AdminDataTable
        data={filteredOrders}
        columns={columns}
        searchPlaceholder="Search by order #ADKT, customer name, email, AWB..."
        filterKey={(o, q) =>
          o.displayId.toLowerCase().includes(q.toLowerCase()) ||
          Boolean(o.customer?.name?.toLowerCase().includes(q.toLowerCase())) ||
          Boolean(o.customer?.email?.toLowerCase().includes(q.toLowerCase())) ||
          Boolean(o.awb && o.awb.toLowerCase().includes(q.toLowerCase()))
        }
      />

      {/* Quick COD Collection Confirmation Modal */}
      {selectedCodOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-amber-500/30 p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCodOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Banknote className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Confirm Cash Collection on Delivery
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Order <strong className="text-white font-mono">#{selectedCodOrder.displayId}</strong> is a Cash on Delivery shipment. Confirming delivery will automatically capture and settle the payments ledger.
                </p>
              </div>
            </div>

            {/* Collection Summary Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-zinc-400">Total Cash to Collect:</span>
                <span className="text-base font-black text-amber-400 font-display">
                  {formatPrice(selectedCodOrder.total || 0)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Customer:</span>
                <span className="font-semibold text-white">
                  {selectedCodOrder.customer?.name} ({selectedCodOrder.customer?.phone || "N/A"})
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Assigned Courier:</span>
                <span className="font-semibold text-white">{selectedCodOrder.courier || "None (Unassigned)"}</span>
              </div>
              {selectedCodOrder.awb && (
                <div className="flex justify-between text-zinc-400">
                  <span>Tracking AWB:</span>
                  <span className="font-mono text-zinc-300">{selectedCodOrder.awb}</span>
                </div>
              )}
            </div>

            {/* Collection Receipt Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Delivery Receipt / Agent Verification Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cash collected by delivery agent. Receipt #DLV-9801"
                value={codNote}
                onChange={(e) => setCodNote(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCodOrder(null)}
                disabled={isSettling}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors"
              >
                No, Cash Not Collected
              </button>
              <button
                type="button"
                onClick={handleConfirmCodCollection}
                disabled={isSettling}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase transition-all flex items-center gap-2 shadow-lg shadow-emerald-950"
              >
                {isSettling ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Settling...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Yes, Cash Collected ({formatPrice(selectedCodOrder.total || 0)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
