"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import type { AbandonedCartRecord } from "@/lib/abandoned-carts-db"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  ShoppingBag,
  Send,
  CheckCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Mail,
  RefreshCw,
  AlertCircle,
  Check,
  Percent,
} from "lucide-react"

export default function AdminAbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCartRecord[]>([])
  const [summary, setSummary] = useState({
    totalCarts: 0,
    totalAbandonedValue: 0,
    recoveredRevenue: 0,
    recoveryRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>("")
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchCarts = useCallback(async () => {
    try {
      const res = await fetch("/api/marketing/abandoned-carts")
      if (res.ok) {
        const data = await res.json()
        if (data.carts) setCarts(data.carts)
        if (data.summary) setSummary(data.summary)
        setLastSyncTime(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.warn("Failed to fetch abandoned carts:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCarts()
  }, [fetchCarts])

  // 3-second live sync polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCarts()
    }, 3000)

    const handleFocus = () => fetchCarts()
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleFocus)
    }
  }, [fetchCarts])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchCarts()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleSendRecovery = async (cart: AbandonedCartRecord) => {
    if (cart.marketingConsent === false) {
      setActionNotice({
        type: "error",
        text: `Cannot dispatch marketing broadcast: ${cart.customerName} (${cart.customerEmail}) has opted out of marketing communications.`,
      })
      setTimeout(() => setActionNotice(null), 4000)
      return
    }

    setSendingId(cart.id)
    try {
      const res = await fetch("/api/marketing/abandoned-carts/send-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          discountCode: "COMEBACK10",
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setActionNotice({
          type: "success",
          text: `Recovery email with 10% coupon (COMEBACK10) sent to ${cart.customerEmail}!`,
        })
        await fetchCarts()
      } else {
        setActionNotice({
          type: "error",
          text: data.error || "Failed to send recovery message.",
        })
      }
    } catch (err: any) {
      setActionNotice({
        type: "error",
        text: err.message || "Failed to send recovery email.",
      })
    } finally {
      setSendingId(null)
      setTimeout(() => setActionNotice(null), 4000)
    }
  }

  const columns: Column<AbandonedCartRecord>[] = [
    {
      header: "Shopper & Contact",
      accessor: (c) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-xs">{c.customerName}</span>
            {c.marketingConsent ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-2.5 w-2.5" /> Opted In
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                <ShieldAlert className="h-2.5 w-2.5" /> Opted Out
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">{c.customerEmail}</p>
          {c.customerPhone && <p className="text-[10px] text-zinc-500">{c.customerPhone}</p>}
        </div>
      ),
    },
    {
      header: "Abandoned Items",
      accessor: (c) => (
        <div className="space-y-1.5 max-w-xs">
          <div className="flex items-center gap-2">
            {c.items.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square w-9 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0"
              >
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800" />
                )}
              </div>
            ))}
            {c.items.length > 3 && (
              <span className="text-[10px] font-bold text-zinc-500">+{c.items.length - 3}</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-300 line-clamp-1">
            {c.items.map((i) => `${i.quantity}x ${i.title}`).join(", ")}
          </p>
        </div>
      ),
    },
    {
      header: "Cart Value",
      accessor: (c) => (
        <div>
          <span className="font-mono font-bold text-white text-xs">{formatPrice(c.cartValue)}</span>
          <p className="text-[10px] text-zinc-500">{c.items.length} {c.items.length === 1 ? "item" : "items"}</p>
        </div>
      ),
    },
    {
      header: "Last Activity",
      accessor: (c) => (
        <div className="text-xs space-y-0.5 font-mono">
          <span className="text-zinc-300 text-[11px]">{formatDate(c.lastActivityAt)}</span>
          <p className="text-[10px] text-zinc-500">Created: {formatDate(c.createdAt)}</p>
        </div>
      ),
    },
    {
      header: "Recovery Status",
      accessor: (c) => (
        <span
          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
            c.recoveryStatus === "Recovered"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : c.recoveryStatus === "Email Sent"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {c.recoveryStatus}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (c) => (
        <div className="flex items-center justify-end gap-2">
          {c.recoveryStatus === "Recovered" ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
              <CheckCircle className="h-3.5 w-3.5" /> Converted
            </span>
          ) : (
            <button
              onClick={() => handleSendRecovery(c)}
              disabled={sendingId === c.id || c.marketingConsent === false}
              title={c.marketingConsent === false ? "Customer has opted out of marketing" : "Send 10% recovery coupon"}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                c.marketingConsent === false
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800"
                  : "bg-accent hover:bg-accent-hover text-white shadow-sm shadow-accent/20"
              }`}
            >
              {sendingId === c.id ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              <span>{c.recoveryStatus === "Email Sent" ? "Resend" : "Recover"}</span>
            </button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Revenue Recovery System
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync (3s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Abandoned Checkouts ({carts.length})
          </h1>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors self-start sm:self-auto"
          title={`Last synchronized at ${lastSyncTime || "now"}`}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
        </button>
      </div>

      {/* Action Toast Alert */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
            actionNotice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {actionNotice.type === "success" ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* KPI Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Unrecovered Pipeline
          </span>
          <p className="text-3xl font-black text-white font-display">
            {formatPrice(summary.totalAbandonedValue)}
          </p>
          <p className="text-[11px] text-zinc-500">Across active and notified checkout drop-offs</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Recovered Revenue
          </span>
          <p className="text-3xl font-black text-emerald-400 font-display">
            {formatPrice(summary.recoveredRevenue)}
          </p>
          <p className="text-[11px] text-zinc-500">Attributed directly to recovery campaigns</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Recovery Conversion Rate
          </span>
          <p className="text-3xl font-black text-white font-display">
            {summary.recoveryRate}%
          </p>
          <p className="text-[11px] text-zinc-500">Target benchmark: 15–25%</p>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <AdminDataTable
        data={carts}
        columns={columns}
        searchPlaceholder="Search abandoned checkouts by shopper, email, items..."
        filterKey={(c, q) =>
          c.customerName.toLowerCase().includes(q.toLowerCase()) ||
          c.customerEmail.toLowerCase().includes(q.toLowerCase()) ||
          Boolean(c.customerPhone && c.customerPhone.includes(q)) ||
          c.items.some((i) => i.title.toLowerCase().includes(q.toLowerCase()))
        }
      />
    </div>
  )
}
