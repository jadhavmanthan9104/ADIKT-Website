"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import type { MarketingCampaign } from "@/lib/campaigns-db"
import type { DiscountRule } from "@/lib/discounts-db"
import type { CustomerSegment } from "@/lib/segments-service"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  Send,
  Plus,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  Tag,
  Users,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Check,
  Percent,
} from "lucide-react"

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [discounts, setDiscounts] = useState<DiscountRule[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // New Campaign Form
  const [name, setName] = useState("")
  const [channel, setChannel] = useState<MarketingCampaign["channel"]>("SMS & WhatsApp")
  const [targetSegment, setTargetSegment] = useState<string>("all")
  const [discountCode, setDiscountCode] = useState<string>("")
  const [message, setMessage] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [campRes, segRes, discRes] = await Promise.all([
        fetch("/api/admin/campaigns"),
        fetch("/api/admin/segments"),
        fetch("/api/admin/discounts"),
      ])

      if (campRes.ok) {
        const campData = await campRes.json()
        if (campData.campaigns) setCampaigns(campData.campaigns)
      }
      if (segRes.ok) {
        const segData = await segRes.json()
        if (segData.segments) setSegments(segData.segments)
      }
      if (discRes.ok) {
        const discData = await discRes.json()
        if (discData.discounts) setDiscounts(discData.discounts)
      }
      setLastSyncTime(new Date().toLocaleTimeString())
    } catch (err) {
      console.warn("Failed to fetch marketing data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 3-second live sync polling
  useEffect(() => {
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
  }, [fetchData])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim() || !message.trim()) {
      setFormError("Please provide a campaign name and message content.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          channel,
          targetSegment,
          discountCode: discountCode || undefined,
          message: message.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setIsCreating(false)
        setName("")
        setMessage("")
        setDiscountCode("")
        await fetchData()
      } else {
        setFormError(data.error || "Failed to create campaign.")
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to submit campaign.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAttributedRevenue = campaigns.reduce((acc, c) => acc + (c.attributedRevenue || 0), 0)
  const totalAttributedOrders = campaigns.reduce((acc, c) => acc + (c.attributedOrders || 0), 0)

  const columns: Column<MarketingCampaign>[] = [
    {
      header: "Campaign Name & Channel",
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-accent shrink-0">
            {c.channel === "Email Broadcast" ? (
              <Mail className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </div>
          <div>
            <span className="font-bold text-white block text-sm">{c.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-zinc-400">{c.channel}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-[10px] font-bold text-accent px-1.5 py-0.2 rounded bg-accent/10 border border-accent/20">
                {c.targetSegmentName || c.targetSegment}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Attached Coupon",
      accessor: (c) =>
        c.discountCode ? (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-white px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
            <Tag className="h-3 w-3 text-accent" /> {c.discountCode}
          </span>
        ) : (
          <span className="text-xs text-zinc-500 italic">None attached</span>
        ),
    },
    {
      header: "Recipients",
      accessor: (c) => (
        <span className="font-bold text-white text-xs font-mono">
          {c.recipientsCount.toLocaleString()} members
        </span>
      ),
    },
    {
      header: "Engagement",
      accessor: (c) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span>Open: {c.openRate}</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            Click: {c.clickRate || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Attributed Orders & Revenue",
      accessor: (c) => (
        <div>
          <span className="font-mono font-bold text-white text-xs block">
            {formatPrice(c.attributedRevenue)}
          </span>
          <span className="text-[10px] text-zinc-500">
            {c.attributedOrders} orders converted
          </span>
        </div>
      ),
    },
    {
      header: "Sent Date",
      accessor: (c) => (
        <span className="text-zinc-400 text-xs font-mono">{formatDate(c.sentAt)}</span>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Direct-to-Consumer Growth Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync (3s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Marketing & Broadcasts ({campaigns.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-all"
          >
            <Plus className="h-4 w-4" /> {isCreating ? "Cancel" : "New Broadcast Campaign"}
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Total Broadcasts Dispatched
          </span>
          <p className="text-3xl font-black text-white font-display">{campaigns.length}</p>
          <p className="text-[11px] text-zinc-500">Across SMS, WhatsApp, and Email</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Total Attributed Revenue
          </span>
          <p className="text-3xl font-black text-emerald-400 font-display">
            {formatPrice(totalAttributedRevenue)}
          </p>
          <p className="text-[11px] text-zinc-500">Directly generated from promotional links</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Attributed Orders
          </span>
          <p className="text-3xl font-black text-white font-display">{totalAttributedOrders}</p>
          <p className="text-[11px] text-zinc-500">Completed drop checkout orders</p>
        </div>
      </div>

      {/* Campaign Creation Card */}
      {isCreating && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
              Broadcast Dispatcher
            </span>
            <h3 className="text-xl font-black uppercase text-white font-display">
              Launch Segmented Campaign
            </h3>
            <p className="text-xs text-zinc-400">
              Deliver targeted product drop announcements, restock alerts, and personalized discount codes.
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
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drop 04 Early Access Push"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              {/* Channel */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Dispatch Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="SMS & WhatsApp">SMS & WhatsApp (92%+ Open Rate)</option>
                  <option value="Email Broadcast">Email Broadcast</option>
                  <option value="Push Notification">Push Notification</option>
                </select>
              </div>

              {/* Target Segment */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Target Audience Segment</label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  {segments.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} ({s.memberCount} members)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Attached Coupon */}
              <div>
                <label className="text-xs font-bold text-zinc-300">Attach Discount Code (Optional)</label>
                <select
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent"
                >
                  <option value="">No coupon attached</option>
                  {discounts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} ({d.type === "percentage" ? `${d.value}% Off` : d.type === "fixed_amount" ? `₹${d.value} Off` : "Free Shipping"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Compliance Notice */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-400">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Consent verification active: Broadcasts are automatically filtered to shoppers with legal opt-in marketing consent.
                </p>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-bold text-zinc-300">Broadcast Message Body *</label>
              <textarea
                required
                rows={3}
                placeholder="Hey {first_name}, our newest heavyweight drop is now live. Use your exclusive code {discount_code} for early access."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
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
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <span>Send Broadcast Campaign</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns Table */}
      <AdminDataTable
        data={campaigns}
        columns={columns}
        searchPlaceholder="Search marketing broadcasts by name, segment, coupon..."
        filterKey={(c, q) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.channel.toLowerCase().includes(q.toLowerCase()) ||
          c.targetSegment.toLowerCase().includes(q.toLowerCase()) ||
          Boolean(c.discountCode && c.discountCode.toLowerCase().includes(q.toLowerCase()))
        }
      />
    </div>
  )
}
