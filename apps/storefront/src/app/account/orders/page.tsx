"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCustomer } from "@/components/providers/CustomerContext"
import { ArrowLeft, Truck, Package, User, ExternalLink } from "@/components/ui/Icons"
import { formatPrice, formatDate } from "@/lib/formatters"
import { EmptyState } from "@/components/ui/EmptyState"
import { getCarrierTrackingPortalUrl } from "@/lib/shipping/shipping-service"

export default function OrdersHistoryPage() {
  const { customer, orders, isLoaded } = useCustomer()

  if (isLoaded && !customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <EmptyState
          icon={<User className="h-12 w-12 text-zinc-600" />}
          title="Sign In Required"
          description="Please sign in to your account to view your order history and live parcel tracking."
          actionLabel="Sign In"
          actionHref="/login"
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <Link href="/account" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Purchase History</span>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
          My Orders & Live Tracking
        </h1>
        <p className="text-xs text-zinc-400">View detailed status, items, and Delhivery/Bluedart tracking info</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4"
            >
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800 text-xs">
                <div>
                  <span className="font-bold text-white text-sm mr-3 font-mono">
                    #{order.displayId}
                  </span>
                  <span className="text-zinc-400">Placed on {formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                    {order.status}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-zinc-800/60">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-4">
                    <div className="relative aspect-[3/4] w-12 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
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

              {/* Logistics & Tracking Bar */}
              {(() => {
                const assignedCourier = order.awb ? order.courier : ""

                return (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Truck className="h-4 w-4 text-accent shrink-0" />
                  <span>
                    Carrier:{" "}
                    <strong className="text-white">{assignedCourier || "Not assigned yet"}</strong>
                    {order.awb ? (
                      <>
                        {" "}(AWB: <span className="font-mono text-white">{order.awb}</span>)
                      </>
                    ) : null}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {assignedCourier ? (
                    <a
                      href={getCarrierTrackingPortalUrl(assignedCourier, order.awb)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-[#9A0000] hover:bg-[#7a0000] text-white px-2.5 py-1 rounded-lg font-black text-[10px] uppercase transition-colors"
                    >
                      <span>Track Here</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ) : null}
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-accent hover:underline font-bold text-xs"
                  >
                    View Timeline →
                  </Link>
                </div>
              </div>
                )
              })()}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title="No Orders Found"
          description="You have not placed any orders yet. Discover our latest heavyweight drops."
          actionLabel="Explore Catalog"
          actionHref="/shop"
        />
      )}
    </div>
  )
}
