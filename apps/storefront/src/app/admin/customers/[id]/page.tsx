"use client"

export const dynamic = "force-dynamic"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AdminDataService, AdminCustomer, AdminOrder } from "@/lib/admin-api"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  ArrowLeft,
  User,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CreditCard,
} from "lucide-react"

export default function CustomerProfilePage() {
  const params = useParams()
  const id = (params?.id as string) || "cus_1"
  const [customer, setCustomer] = useState<AdminCustomer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([])

  useEffect(() => {
    const c = AdminDataService.getCustomerById(id) || AdminDataService.getCustomers()[0]
    setCustomer(c)

    fetch("/api/admin/orders")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          if (data.orders) {
            const filtered = data.orders.filter(
              (o: AdminOrder) =>
                (c?.email && o.customer?.email?.toLowerCase() === c.email.toLowerCase()) ||
                (c?.id && o.customer?.id === c.id)
            )
            setCustomerOrders(filtered)
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch customer orders:", err))
  }, [id])

  if (!customer) {
    return (
      <div className="p-8 text-white text-xs">
        Loading customer profile...
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Customer 360 View
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-display">
              {customer.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold uppercase text-zinc-400">Total Lifetime Value</span>
          <p className="text-2xl font-black text-white font-display">{formatPrice(customer.totalSpent || 0)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold uppercase text-zinc-400">Orders Completed</span>
          <p className="text-2xl font-black text-white font-display">{customer.orderCount || customerOrders.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold uppercase text-zinc-400">Average Order Value</span>
          <p className="text-2xl font-black text-white font-display">{formatPrice(customer.aov || 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Order History */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold uppercase text-white tracking-wider">
            Order History ({customerOrders.length})
          </h3>

          <div className="space-y-3">
            {customerOrders.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-zinc-500 text-xs">
                No orders recorded yet for this customer.
              </div>
            ) : (
              customerOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-bold text-white font-mono hover:text-accent"
                    >
                      #{o.displayId}
                    </Link>
                    <p className="text-zinc-400 mt-0.5">
                      {formatDate(o.createdAt)} • {(o.items || []).length} items
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white text-sm">{formatPrice(o.total)}</span>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase mt-0.5">{o.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Contact & Tags */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
            <h3 className="font-bold uppercase text-white tracking-wider">
              Contact Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="h-4 w-4 text-zinc-500" /> {customer.email}
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="h-4 w-4 text-zinc-500" /> {customer.phone}
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="h-4 w-4 text-zinc-500" /> {customer.city}, {customer.state}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
            <h3 className="font-bold uppercase text-white tracking-wider">
              Segments & Tags
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              {(customer.tags || []).map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
