"use client"

export const dynamic = "force-dynamic"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useCustomer } from "@/components/providers/CustomerContext"
import {
  ArrowLeft,
  Check,
  Truck,
  User,
  MapPin,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Clock,
  CreditCard,
  Package,
} from "@/components/ui/Icons"
import { formatPrice, formatDate } from "@/lib/formatters"
import { EmptyState } from "@/components/ui/EmptyState"
import { getCarrierTrackingPortalUrl } from "@/lib/shipping/shipping-service"

export default function OrderDetailsPage() {
  const params = useParams()
  const id = (params?.id as string) || ""
  const { customer, isLoaded } = useCustomer()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !isLoaded || !customer) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`/api/customer/orders/${id}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setOrder(data.order)
        } else {
          setError(data.error || "Failed to load order details")
        }
      })
      .catch((err) => {
        setError("Network error loading order")
      })
      .finally(() => setLoading(false))
  }, [id, isLoaded, customer])

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="h-8 w-8 mx-auto border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase text-zinc-400 font-mono tracking-widest">
          Loading Order #{id}...
        </p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-[#9A0000]" />}
          title={error?.includes("permission") || error?.includes("IDOR") ? "Access Denied" : "Order Not Found"}
          description={error || "We could not find the requested order in your account."}
          actionLabel="Back to My Orders"
          actionHref="/account/orders"
        />
      </div>
    )
  }

  const awb = order.awb || ""
  const assignedCourier = awb ? order.courier : ""
  const subtotal = order.subtotal || order.total
  const discount = order.discountTotal || 0
  const shipping = order.shippingTotal || 0
  const tax = order.taxTotal || Math.round(order.total * 0.12)
  const total = order.total

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#9A0000] flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#9A0000]" /> Pan-India Logistics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-display mt-0.5">
            Order #{order.displayId}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Payment Status Badge */}
          <span
            className={`px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-wider border shadow-xs ${
              order.paymentStatus === "Captured"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                : order.paymentStatus === "Pending"
                ? "bg-amber-50 text-amber-800 border-amber-300/80 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
                : "bg-red-50 text-red-800 border-red-300/80 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
            }`}
          >
            Payment: {order.paymentStatus || "Captured"}
          </span>

          {/* Fulfillment Status Badge */}
          <span className="bg-zinc-100 text-zinc-700 border border-zinc-300/80 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-wider shadow-xs">
            Fulfillment: {order.fulfillmentStatus || order.status || "Processing"}
          </span>

          {/* Track Here CTA (Only if courier assigned) */}
          {assignedCourier ? (
            <a
              href={getCarrierTrackingPortalUrl(assignedCourier, awb)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#9A0000] hover:bg-[#7a0000] text-white font-black uppercase text-[10px] tracking-wider shadow-sm shadow-[#9A0000]/30 transition-all active:scale-95"
            >
              <span>Track Here</span>
              <ExternalLink className="h-3 w-3 stroke-[2.5]" />
            </a>
          ) : null}
        </div>
      </div>

      {/* Logistics & Tracking Bar */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#9A0000]" /> Logistics & Delivery Partner
          </h3>
          {awb ? (
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              AWB: <strong className="text-zinc-900 dark:text-white font-mono font-bold">{awb}</strong>
            </span>
          ) : null}
        </div>

        {/* 6-Stage Visual Stepper with Connected Progress Line */}
        {(() => {
          const steps = [
            { step: "Order Placed", done: true },
            { step: "Packed", done: order.status !== "Pending" },
            { step: "Shipped", done: order.status === "Shipped" || order.status === "Delivered" },
            { step: "In Transit", done: order.status === "Shipped" || order.status === "Delivered" },
            { step: "Out for Delivery", done: order.status === "Delivered" },
            { step: "Delivered", done: order.status === "Delivered" },
          ]
          const lastDoneIdx = steps.reduce((acc, curr, idx) => (curr.done ? idx : acc), 0)

          return (
            <div className="relative pt-1">
              {/* Horizontal Connecting Progress Track */}
              <div
                className="absolute top-[18px] -translate-y-1/2 h-[3px] bg-zinc-200 dark:bg-zinc-800 rounded-full z-0 pointer-events-none"
                style={{
                  left: "calc(100% / 12)",
                  width: "calc(100% * 5 / 6)",
                }}
              />
              <div
                className="absolute top-[18px] -translate-y-1/2 h-[3px] bg-[#9A0000] rounded-full z-0 transition-all duration-500 pointer-events-none"
                style={{
                  left: "calc(100% / 12)",
                  width: `calc(${lastDoneIdx} * 100% / 6)`,
                }}
              />

              <div className="grid grid-cols-6 relative z-10 text-center">
                {steps.map((item, idx) => {
                  const isCurrent = idx === lastDoneIdx
                  return (
                    <div key={idx} className="flex flex-col items-center space-y-2 px-0.5 sm:px-1">
                      <div className="h-9 w-full flex items-center justify-center">
                        <div
                          className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ring-4 ring-white dark:ring-zinc-900 ${
                            item.done
                              ? isCurrent
                                ? "bg-[#9A0000] text-white shadow-lg shadow-[#9A0000]/40 ring-4 ring-[#9A0000]/30 scale-105"
                                : "bg-[#9A0000] text-white shadow-sm"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 font-semibold"
                          }`}
                        >
                          {item.done ? (
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white stroke-[2.5]" />
                          ) : (
                            <span className="text-[11px] sm:text-xs">{idx + 1}</span>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-[9px] sm:text-[11px] uppercase tracking-wider leading-tight ${
                          item.done
                            ? isCurrent
                              ? "font-black text-[#9A0000]"
                              : "font-bold text-zinc-900 dark:text-white"
                            : "font-medium text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {item.step}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Assigned Courier Bar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Truck className="h-4 w-4 text-[#9A0000] shrink-0" />
            <span>
              Assigned Courier: <strong className="text-zinc-950 dark:text-white font-bold">{assignedCourier || "Not assigned yet"}</strong>
            </span>
          </div>
          {assignedCourier ? (
            <a
              href={getCarrierTrackingPortalUrl(assignedCourier, awb)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9A0000] hover:bg-[#7a0000] text-white font-black uppercase text-[10px] tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <span>Track Here</span>
              <ExternalLink className="h-3 w-3 stroke-[2.5]" />
            </a>
          ) : null}
        </div>
      </div>

      {/* Items Breakdown & Pricing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Line items (7 cols) */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Items in Parcel ({(order.items || []).length})
          </h3>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {(order.items || []).map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <div className="relative aspect-[3/4] w-14 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shrink-0">
                  {item.thumbnail ? (
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-700">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {item.variant || "Standard"} • Qty: {item.quantity}
                  </p>
                  {item.sku && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">SKU: {item.sku}</p>
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Ledger */}
          <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-mono font-medium">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Discount / Promo</span>
                <span className="font-mono">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping (Express Logistics)</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-mono font-medium">
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax (12% Included)</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-mono font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-800 pt-2">
              <span>Grand Total</span>
              <span className="text-[#9A0000] font-mono text-base font-black">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span>Payment Method</span>
              <span className="text-zinc-900 dark:text-white font-semibold">{order.paymentMethod || order.paymentMode}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address (5 cols) */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Delivery Destination
          </h3>
          <div className="space-y-1 text-zinc-600 dark:text-zinc-300">
            <p className="font-bold text-zinc-900 dark:text-white text-sm">
              {order.shippingAddress?.name || customer?.firstName}
            </p>
            <p>{order.shippingAddress?.phone || customer?.phone}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && (
              <p>{order.shippingAddress?.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
              <strong className="text-zinc-900 dark:text-white font-mono">{order.shippingAddress?.pincode}</strong>
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Authentic 100% Cotton Garment</span>
            </div>
            <Link
              href={`/return-refund-policy?orderId=${order.displayId}`}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-bold transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#9A0000]" /> Need to exchange or return this item?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
