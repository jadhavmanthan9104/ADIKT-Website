"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import type { CustomerSegment, CustomerSegmentMember } from "@/lib/segments-service"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  Users,
  UserCheck,
  UserPlus,
  Crown,
  Moon,
  ShoppingBag,
  Send,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  RefreshCw,
} from "lucide-react"

export default function AdminSegmentsPage() {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [activeSegmentSlug, setActiveSegmentSlug] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchSegments = async () => {
    try {
      const res = await fetch("/api/admin/segments")
      if (res.ok) {
        const data = await res.json()
        if (data.segments) setSegments(data.segments)
      }
    } catch (err) {
      console.warn("Failed to fetch customer segments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSegments()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSegments()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const activeSegment = segments.find((s) => s.slug === activeSegmentSlug) || segments[0]
  const members = activeSegment?.members || []

  const columns: Column<CustomerSegmentMember>[] = [
    {
      header: "Customer",
      accessor: (m) => (
        <div>
          <span className="font-bold text-white block">{m.name}</span>
          <span className="text-[11px] text-zinc-400">{m.email}</span>
          {m.phone && <p className="text-[10px] text-zinc-500">{m.phone}</p>}
        </div>
      ),
    },
    {
      header: "Orders Completed",
      accessor: (m) => (
        <div>
          <span className="font-bold text-white text-xs">{m.orderCount} orders</span>
          {m.lastOrderDate && (
            <p className="text-[10px] text-zinc-500">Last: {formatDate(m.lastOrderDate)}</p>
          )}
        </div>
      ),
    },
    {
      header: "Lifetime Value (LTV)",
      accessor: (m) => (
        <div>
          <span className="font-mono font-bold text-white text-xs">{formatPrice(m.totalSpend)}</span>
          <p className="text-[10px] text-zinc-500">AOV: {formatPrice(m.avgOrderValue)}</p>
        </div>
      ),
    },
    {
      header: "Marketing Consent",
      accessor: (m) => (
        <div>
          {m.marketingConsent ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" /> Opted In
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="h-3 w-3" /> Opted Out
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Joined Date",
      accessor: (m) => (
        <span className="text-zinc-400 text-xs font-mono">{formatDate(m.registeredAt)}</span>
      ),
      className: "text-right",
    },
  ]

  const getSegmentIcon = (slug: string) => {
    switch (slug) {
      case "new":
        return <UserPlus className="h-4 w-4 text-emerald-400" />
      case "returning":
        return <UserCheck className="h-4 w-4 text-blue-400" />
      case "high-value":
        return <Crown className="h-4 w-4 text-amber-400" />
      case "inactive":
        return <Moon className="h-4 w-4 text-zinc-500" />
      case "no-purchase":
        return <Users className="h-4 w-4 text-purple-400" />
      case "multiple-purchases":
        return <ShoppingBag className="h-4 w-4 text-accent" />
      default:
        return <TrendingUp className="h-4 w-4 text-zinc-300" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Audience Intelligence
            </span>
            <span className="text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
              7 Dynamic Segments
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Customer Segments
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/marketing"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-all"
          >
            <Send className="h-4 w-4" /> Broadcast Campaign
          </Link>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
          </button>
        </div>
      </div>

      {/* Segment Selector Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {segments.map((seg) => (
          <button
            key={seg.slug}
            onClick={() => setActiveSegmentSlug(seg.slug)}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
              activeSegmentSlug === seg.slug
                ? "bg-accent/15 border-accent shadow-md shadow-accent/10"
                : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between">
              {getSegmentIcon(seg.slug)}
              <span className="text-[11px] font-black text-white font-mono">
                {seg.memberCount}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate">{seg.name}</p>
              <p className="text-[10px] text-zinc-500 font-medium">{seg.percentageOfTotal}% share</p>
            </div>
          </button>
        ))}
      </div>

      {/* Active Segment Summary Banner */}
      {activeSegment && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
              Active Segment
            </span>
            <h3 className="text-lg font-black uppercase text-white font-display mt-0.5">
              {activeSegment.name}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">{activeSegment.description}</p>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-zinc-800 sm:pl-6">
            <div>
              <span className="text-xs text-zinc-500 font-semibold block">Total Segment Members</span>
              <span className="text-2xl font-black text-white font-display">
                {activeSegment.memberCount} Shoppers
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-zinc-800 sm:pl-6">
            <div>
              <span className="text-xs text-zinc-500 font-semibold block">Average Lifetime Value</span>
              <span className="text-2xl font-black text-emerald-400 font-display">
                {formatPrice(activeSegment.avgLtv)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Segment Member Table */}
      <AdminDataTable
        data={members}
        columns={columns}
        searchPlaceholder={`Search ${activeSegment?.name || "segment"} members by name, email, phone...`}
        filterKey={(m, q) =>
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          m.email.toLowerCase().includes(q.toLowerCase()) ||
          Boolean(m.phone && m.phone.includes(q))
        }
      />
    </div>
  )
}
