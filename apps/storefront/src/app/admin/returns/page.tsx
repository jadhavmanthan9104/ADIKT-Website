"use client"

import React, { useState } from "react"
import { AdminDataService, AdminReturn } from "@/lib/admin-api"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice } from "@/lib/formatters"
import { RefreshCw, Check, X, PackageCheck } from "lucide-react"

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<AdminReturn[]>(AdminDataService.getReturns())

  const handleUpdate = (id: string, status: AdminReturn["status"]) => {
    AdminDataService.updateReturnStatus(id, status)
    setReturns([...AdminDataService.getReturns()])
  }

  const columns: Column<AdminReturn>[] = [
    {
      header: "RMA Reference",
      accessor: (r) => (
        <div>
          <span className="font-mono font-bold text-white block">RMA-#{r.id.split("_")[1]}</span>
          <span className="text-[11px] text-zinc-500">Order #{r.orderDisplayId}</span>
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: (r) => (
        <div>
          <span className="font-bold text-white block">{r.customerName}</span>
          <span className="text-[11px] text-zinc-400">{r.customerEmail}</span>
        </div>
      ),
    },
    {
      header: "Reason",
      accessor: (r) => (
        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold text-xs">
          {r.reason}
        </span>
      ),
    },
    {
      header: "Refund Amount",
      accessor: (r) => <span className="font-bold text-white">{formatPrice(r.totalRefund)}</span>,
    },
    {
      header: "Status",
      accessor: (r) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            r.status === "Received & Restocked" || r.status === "Approved"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : r.status === "Rejected"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (r) => (
        <div className="flex items-center gap-1.5 justify-end">
          {r.status === "Requested" && (
            <>
              <button
                onClick={() => handleUpdate(r.id, "Approved")}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdate(r.id, "Rejected")}
                className="px-2.5 py-1 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 font-bold text-xs"
              >
                Reject
              </button>
            </>
          )}

          {r.status === "Approved" && (
            <button
              onClick={() => handleUpdate(r.id, "Received & Restocked")}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs inline-flex items-center gap-1"
            >
              <PackageCheck className="h-3.5 w-3.5 text-accent" /> Restock & Refund
            </button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            Reverse Logistics & RMA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Returns Management ({returns.length})
          </h1>
        </div>
      </div>

      <AdminDataTable
        data={returns}
        columns={columns}
        searchPlaceholder="Search by RMA, order, customer name..."
        filterKey={(r, q) =>
          r.orderDisplayId.toLowerCase().includes(q.toLowerCase()) ||
          r.customerName.toLowerCase().includes(q.toLowerCase())
        }
      />
    </div>
  )
}
