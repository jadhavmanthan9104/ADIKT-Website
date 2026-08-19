"use client"

import React, { useState, useEffect, useCallback } from "react"
import type { DiscountRule } from "@/lib/discounts-db"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  Plus,
  Tag,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Trash2,
  Calendar,
  Layers,
  Users,
  Percent,
  Banknote,
  Truck,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountRule[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>("")

  // Form State
  const [code, setCode] = useState("")
  const [type, setType] = useState<"percentage" | "fixed_amount" | "free_shipping">("percentage")
  const [value, setValue] = useState<number>(10)
  const [minOrderValue, setMinOrderValue] = useState<number>(999)
  const [maxDiscount, setMaxDiscount] = useState<string>("")
  const [usageLimit, setUsageLimit] = useState<string>("")
  const [customerUsageLimit, setCustomerUsageLimit] = useState<number>(1)
  const [startsAt, setStartsAt] = useState<string>(new Date().toISOString().substring(0, 10))
  const [endsAt, setEndsAt] = useState<string>("")
  const [applicableTo, setApplicableTo] = useState<"all" | "products" | "collections">("all")
  const [description, setDescription] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDiscounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/discounts")
      if (res.ok) {
        const data = await res.json()
        if (data.discounts) {
          setDiscounts(data.discounts)
          setLastSyncTime(new Date().toLocaleTimeString())
        }
      }
    } catch (err) {
      console.warn("Failed to fetch admin discounts:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDiscounts()
  }, [fetchDiscounts])

  // 3-second live sync polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDiscounts()
    }, 3000)

    const handleFocus = () => fetchDiscounts()
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleFocus)
    }
  }, [fetchDiscounts])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchDiscounts()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!code.trim()) {
      setFormError("Please provide a valid coupon code.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: Number(value) || 0,
          minOrderValue: Number(minOrderValue) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          customerUsageLimit: Number(customerUsageLimit) || 1,
          startsAt: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
          applicableTo,
          description: description.trim(),
          status: "Active",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Failed to create discount.")
        setIsSubmitting(false)
        return
      }

      setIsAdding(false)
      setCode("")
      setValue(10)
      setMinOrderValue(999)
      setMaxDiscount("")
      setUsageLimit("")
      setDescription("")
      await fetchDiscounts()
    } catch (err: any) {
      setFormError(err.message || "Failed to submit coupon.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: DiscountRule["status"]) => {
    const nextStatus = currentStatus === "Active" ? "Disabled" : "Active"
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) fetchDiscounts()
    } catch (err) {
      console.warn("Failed to toggle discount:", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this discount coupon?")) return
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: "DELETE",
      })
      if (res.ok) fetchDiscounts()
    } catch (err) {
      console.warn("Failed to delete discount:", err)
    }
  }

  const columns: Column<DiscountRule>[] = [
    {
      header: "Coupon Code & Details",
      accessor: (d) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-accent shrink-0">
            {d.type === "percentage" ? (
              <Percent className="h-4 w-4" />
            ) : d.type === "fixed_amount" ? (
              <Banknote className="h-4 w-4" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-white text-sm tracking-wider block">
                {d.code}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                {d.type.replace("_", " ")}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
              {d.description || (d.type === "percentage" ? `${d.value}% Off` : d.type === "fixed_amount" ? `₹${d.value} Off` : "Free Shipping")}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Rules & Limits",
      accessor: (d) => (
        <div className="space-y-0.5 text-xs text-zinc-300">
          <div>
            Min Order: <strong className="text-white">₹{d.minOrderValue.toLocaleString()}</strong>
          </div>
          {d.maxDiscount && (
            <div className="text-[11px] text-zinc-400">
              Max Cap: <span className="font-mono text-zinc-300">₹{d.maxDiscount}</span>
            </div>
          )}
          <div className="text-[11px] text-zinc-500">
            Limit: {d.customerUsageLimit ? `${d.customerUsageLimit}/customer` : "1/customer"}
          </div>
        </div>
      ),
    },
    {
      header: "Validity",
      accessor: (d) => (
        <div className="text-xs space-y-0.5">
          <div className="text-zinc-300 font-mono text-[11px]">
            {d.endsAt ? `Until ${formatDate(d.endsAt)}` : "No Expiration"}
          </div>
          <div className="text-[11px] text-zinc-500">
            From {formatDate(d.startsAt)}
          </div>
        </div>
      ),
    },
    {
      header: "Redemptions",
      accessor: (d) => (
        <div>
          <span className="font-black text-white text-xs">{d.usageCount} used</span>
          {d.usageLimit && (
            <p className="text-[10px] text-zinc-500 font-mono">of {d.usageLimit} max</p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (d) => (
        <span
          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
            d.status === "Active"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-zinc-800 text-zinc-500 border-zinc-700"
          }`}
        >
          {d.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (d) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => handleToggle(d.id, d.status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              d.status === "Active"
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {d.status === "Active" ? "Disable" : "Enable"}
          </button>
          <button
            onClick={() => handleDelete(d.id)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 transition-colors"
            title="Delete coupon"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
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
              Revenue & Conversion Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync (3s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Discount Rules & Coupons ({discounts.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-all"
          >
            <Plus className="h-4 w-4" /> {isAdding ? "Cancel" : "Create Discount Rule"}
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            title={`Last synchronized at ${lastSyncTime || "now"}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
          </button>
        </div>
      </div>

      {/* Rich Discount Rule Creator Modal / Expandable Card */}
      {isAdding && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
              New Rule Builder
            </span>
            <h3 className="text-xl font-black uppercase text-white font-display">
              Configure Promotional Coupon
            </h3>
            <p className="text-xs text-zinc-400">
              Set minimum order value, start/end validity dates, usage limits, and custom customer caps.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Code */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DROP15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-accent uppercase"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="percentage">Percentage Off (%)</option>
                  <option value="fixed_amount">Fixed Amount Off (₹)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="text-xs font-bold text-zinc-300">
                  {type === "percentage" ? "Percentage Value (%)" : type === "fixed_amount" ? "Discount Amount (₹)" : "Value"}
                </label>
                <input
                  type="number"
                  disabled={type === "free_shipping"}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Min Order Value */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Min Cart Value (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1499"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              {/* Max Discount Cap */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Max Discount Cap (₹ Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              {/* Customer Usage Limit */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Per-Customer Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  value={customerUsageLimit}
                  onChange={(e) => setCustomerUsageLimit(Number(e.target.value))}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Starts At */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Valid From Date</label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              {/* Ends At */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Valid Until Date (Optional)</label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              {/* Global Usage Limit */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Total Global Limit (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-zinc-300">Offer Summary / Campaign Description</label>
              <input
                type="text"
                placeholder="e.g. 15% off for early access drop VIPs"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Creating Rule...</span>
                  </>
                ) : (
                  <span>Publish Discount Code</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts Data Table */}
      <AdminDataTable
        data={discounts}
        columns={columns}
        searchPlaceholder="Search coupon codes, descriptions, limits..."
        filterKey={(d, q) =>
          d.code.toLowerCase().includes(q.toLowerCase()) ||
          Boolean(d.description && d.description.toLowerCase().includes(q.toLowerCase())) ||
          d.type.toLowerCase().includes(q.toLowerCase())
        }
      />
    </div>
  )
}
