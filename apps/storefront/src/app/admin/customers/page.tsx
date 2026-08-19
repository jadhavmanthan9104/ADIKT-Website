"use client"

import React, { useState } from "react"
import Link from "next/link"
import { AdminDataService, AdminCustomer } from "@/lib/admin-api"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice } from "@/lib/formatters"
import { Users, Eye, Mail, Phone, MapPin } from "lucide-react"

export default function AdminCustomersPage() {
  const [customers] = useState<AdminCustomer[]>(AdminDataService.getCustomers())

  const columns: Column<AdminCustomer>[] = [
    {
      header: "Customer",
      accessor: (c) => (
        <div>
          <Link
            href={`/admin/customers/${c.id}`}
            className="font-bold text-white hover:text-accent transition-colors block"
          >
            {c.name}
          </Link>
          <span className="text-[11px] text-zinc-400">{c.email}</span>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: (c) => (
        <span className="text-zinc-300">
          {c.city}, {c.state}
        </span>
      ),
    },
    {
      header: "Orders Placed",
      accessor: (c) => <span className="font-bold text-white">{c.orderCount} orders</span>,
    },
    {
      header: "Total Spend",
      accessor: (c) => (
        <div>
          <span className="font-bold text-white">{formatPrice(c.totalSpent)}</span>
          <p className="text-[11px] text-zinc-500">AOV: {formatPrice(c.aov)}</p>
        </div>
      ),
    },
    {
      header: "Tags",
      accessor: (c) => (
        <div className="flex gap-1 flex-wrap">
          {c.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Action",
      accessor: (c) => (
        <Link
          href={`/admin/customers/${c.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
        >
          <Eye className="h-3.5 w-3.5" /> 360 View
        </Link>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            Customer Directory & LTV
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Customers ({customers.length})
          </h1>
        </div>
      </div>

      <AdminDataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Search customer by name, email, phone, city..."
        filterKey={(c, q) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.email.toLowerCase().includes(q.toLowerCase()) ||
          c.city.toLowerCase().includes(q.toLowerCase())
        }
      />
    </div>
  )
}
