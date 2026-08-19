"use client"

import React, { useState } from "react"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { Plus, Sparkles, Calendar, Tag } from "lucide-react"

interface PromotionItem {
  id: string
  name: string
  rule: string
  audience: string
  startDate: string
  endDate: string
  status: "Active" | "Scheduled" | "Ended"
}

const INITIAL_PROMOTIONS: PromotionItem[] = [
  { id: "promo_1", name: "Free Express Shipping Across India", rule: "Automatic free courier on orders ≥ ₹1,999", audience: "All Customers", startDate: "2026-01-01", endDate: "2026-12-31", status: "Active" },
  { id: "promo_2", name: "Drop 04 Capsule Bundle Discount", rule: "Buy Any Heavyweight Tee + Cargo for ₹4,499", audience: "All Customers", startDate: "2026-08-15", endDate: "2026-08-31", status: "Active" },
  { id: "promo_3", name: "Pre-Paid Payment Incentive", rule: "Instant ₹100 Cashback on UPI/Prepaid orders", audience: "Online Payers", startDate: "2026-08-01", endDate: "2026-09-30", status: "Active" },
]

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState(INITIAL_PROMOTIONS)

  const columns: Column<PromotionItem>[] = [
    {
      header: "Campaign Name",
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-accent">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-white block">{p.name}</span>
            <span className="text-[11px] text-zinc-400">{p.rule}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Target Audience",
      accessor: (p) => <span className="text-zinc-300 font-medium">{p.audience}</span>,
    },
    {
      header: "Schedule",
      accessor: (p) => (
        <span className="text-zinc-400 text-xs">
          {p.startDate} to {p.endDate}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (p) => (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {p.status}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            Automated Marketing Campaigns
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Promotions ({promotions.length})
          </h1>
        </div>
      </div>

      <AdminDataTable
        data={promotions}
        columns={columns}
        searchPlaceholder="Search campaigns..."
        filterKey={(p, q) => p.name.toLowerCase().includes(q.toLowerCase())}
      />
    </div>
  )
}
