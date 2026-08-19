"use client"

import React, { useState, useEffect, useCallback } from "react"
import type { ReviewRecord } from "@/lib/reviews-db"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatDate } from "@/lib/formatters"
import {
  Star,
  Check,
  X,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Clock,
  AlertTriangle,
  MessageSquare,
} from "lucide-react"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>("")

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews?admin=true")
      if (res.ok) {
        const data = await res.json()
        if (data.reviews) {
          setReviews(data.reviews)
          setLastSyncTime(new Date().toLocaleTimeString())
        }
      }
    } catch (err) {
      console.warn("Failed to fetch admin reviews:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // 3-second live polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReviews()
    }, 3000)

    const handleFocus = () => fetchReviews()
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleFocus)
    }
  }, [fetchReviews])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchReviews()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleUpdateStatus = async (id: string, status: ReviewRecord["status"]) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        await fetchReviews()
      }
    } catch (err) {
      console.warn("Failed to update review status:", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        await fetchReviews()
      }
    } catch (err) {
      console.warn("Failed to delete review:", err)
    }
  }

  const pendingCount = reviews.filter((r) => r.status === "Pending").length
  const approvedCount = reviews.filter((r) => r.status === "Approved").length
  const rejectedCount = reviews.filter((r) => r.status === "Rejected").length

  const filteredReviews = statusFilter === "all"
    ? reviews
    : reviews.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase())

  const columns: Column<ReviewRecord>[] = [
    {
      header: "Garment Reviewed",
      accessor: (r) => (
        <div>
          <span className="font-bold text-white block">{r.productTitle}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < r.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                }`}
              />
            ))}
            {r.fitFeedback && (
              <span className="text-[10px] font-bold text-zinc-400 ml-1">({r.fitFeedback})</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Customer & Feedback",
      accessor: (r) => (
        <div className="space-y-1 max-w-md">
          <div className="flex items-center gap-1.5 flex-wrap">
            <strong className="text-white text-xs">{r.customerName}</strong>
            <span className="text-[10px] text-zinc-500">({r.customerEmail})</span>
            {r.verifiedPurchase && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-2.5 w-2.5" /> Verified Buyer
              </span>
            )}
          </div>
          <p className="font-bold text-white text-[11px]">&quot;{r.title}&quot;</p>
          <p className="text-zinc-400 text-[11px] line-clamp-2">{r.comment}</p>
          {r.images && r.images.length > 0 && (
            <span className="text-[10px] text-accent font-semibold">
              📷 {r.images.length} Attached {r.images.length === 1 ? "Photo" : "Photos"}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (r) => (
        <span className="text-[11px] text-zinc-400 font-mono">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (r) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            r.status === "Approved"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : r.status === "Rejected"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      header: "Moderation Actions",
      accessor: (r) => (
        <div className="flex items-center gap-1.5 justify-end">
          {r.status !== "Approved" && (
            <button
              onClick={() => handleUpdateStatus(r.id, "Approved")}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white transition-colors"
              title="Approve Review"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          {r.status !== "Rejected" && (
            <button
              onClick={() => handleUpdateStatus(r.id, "Rejected")}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-600 text-zinc-300 hover:text-white transition-colors"
              title="Reject Review"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => handleDelete(r.id)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 transition-colors"
            title="Delete Review"
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
              Social Proof & Moderation Portal
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync (3s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Customer Reviews ({reviews.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { key: "all", label: `All (${reviews.length})` },
              { key: "pending", label: `Pending (${pendingCount})` },
              { key: "approved", label: `Approved (${approvedCount})` },
              { key: "rejected", label: `Rejected (${rejectedCount})` },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors border ${
                  statusFilter === st.key
                    ? "bg-accent text-white border-accent shadow-sm shadow-accent/20"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                {st.label}
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
        data={filteredReviews}
        columns={columns}
        searchPlaceholder="Search reviews by garment, customer, text..."
        filterKey={(r, q) =>
          r.productTitle.toLowerCase().includes(q.toLowerCase()) ||
          r.customerName.toLowerCase().includes(q.toLowerCase()) ||
          r.customerEmail.toLowerCase().includes(q.toLowerCase()) ||
          r.comment.toLowerCase().includes(q.toLowerCase()) ||
          r.title.toLowerCase().includes(q.toLowerCase())
        }
      />
    </div>
  )
}
