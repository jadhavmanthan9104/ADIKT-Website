"use client"

import React, { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCustomer } from "@/components/providers/CustomerContext"
import { ArrowLeft, Check, Truck, User } from "@/components/ui/Icons"
import { formatPrice, formatDate } from "@/lib/formatters"
import { EmptyState } from "@/components/ui/EmptyState"

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { customer, orders, isLoaded } = useCustomer()

  if (isLoaded && !customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <EmptyState
          icon={<User className="h-12 w-12 text-zinc-600" />}
          title="Sign In Required"
          description="Please sign in to your account to view this order."
          actionLabel="Sign In"
          actionHref="/login"
        />
      </div>
    )
  }

  const order = orders.find((o) => o.id === id) || orders[0]

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <EmptyState
          title="Order Not Found"
          description="We could not find the requested order in your account."
          actionLabel="View All Orders"
          actionHref="/account/orders"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to All Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Order Details</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Order #{order.displayId}
          </h1>
          <p className="text-xs text-zinc-400">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-bold uppercase text-xs">
            {order.status}
          </span>
        </div>
      </div>

      {/* 4-Step Visual Tracking Timeline */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
          Fulfillment & Delivery Timeline
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { step: "Confirmed", date: "Aug 16", done: true },
            { step: "Dispatched", date: "Aug 17", done: true },
            { step: "In Transit", date: "Aug 18", done: true },
            { step: "Delivered", date: "Est. Aug 19", done: false },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2 relative">
              <div
                className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                  item.done
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {item.done ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <p className={`font-bold uppercase text-[11px] ${item.done ? "text-white" : "text-zinc-500"}`}>
                {item.step}
              </p>
              <p className="text-[10px] text-zinc-400">{item.date}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Truck className="h-4 w-4 text-accent shrink-0" />
            <span>
              Courier: <strong className="text-white">{order.courier}</strong> (AWB:{" "}
              <span className="font-mono text-white">{order.awb}</span>)
            </span>
          </div>
        </div>
      </div>

      {/* Items Breakdown & Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Line items (7 cols) */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Items in Parcel ({order.items.length})
          </h3>

          <div className="divide-y divide-zinc-800">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <div className="relative aspect-[3/4] w-14 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-zinc-400">
                    {item.variant} • Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-bold text-white">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs text-zinc-400 border-t border-zinc-800 pt-3">
            <div className="flex justify-between">
              <span>Total Paid</span>
              <span className="font-bold text-white text-sm">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="text-white">{order.paymentMode}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address (5 cols) */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-white">
            Delivery Destination
          </h3>
          <div className="space-y-1 text-zinc-300">
            <p className="font-bold text-white">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
