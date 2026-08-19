"use client"

export const dynamic = "force-dynamic"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { AdminOrder } from "@/lib/admin-api"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  ArrowLeft,
  Truck,
  Check,
  Package,
  RotateCcw,
  XCircle,
  MessageSquare,
  Printer,
  ShieldCheck,
  Send,
  Banknote,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react"
import { getCarrierTrackingPortalUrl } from "@/lib/shipping/shipping-service"

export default function AdminOrderDetailPage() {
  const params = useParams()
  const id = (params?.id as string) || "order_10492"
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [newAwb, setNewAwb] = useState("")
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(true)

  // COD Cash Collection Modal State
  const [showCodModal, setShowCodModal] = useState(false)
  const [codCollectionNote, setCodCollectionNote] = useState("")
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          if (data.order) {
            setOrder(data.order)
            if (data.order.awb) setNewAwb(data.order.awb)
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch admin order:", err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !order) {
    return (
      <div className="p-8 text-white text-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Loading order record...</span>
        </div>
      </div>
    )
  }

  const items = order.items || []
  const timeline = order.timeline || []
  const notes = order.notes || []
  const shippingAddress = order.shippingAddress || {
    name: "Customer",
    phone: "",
    addressLine1: "Address on file",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  }
  const customer = order.customer || {
    id: "cus_unknown",
    name: "Customer",
    email: "customer@example.com",
    phone: "",
  }

  const isCodOrder =
    order.paymentMethod?.toLowerCase().includes("cod") ||
    order.paymentMethod?.toLowerCase().includes("cash on delivery") ||
    order.paymentStatus === "Pending"

  const generateCarrierAwb = (courierName?: string) => {
    const name = (courierName || "").toLowerCase()
    if (name.includes("blue") || name.includes("dart")) {
      return `88${Math.floor(1000000 + Math.random() * 9000000)}`
    }
    if (name.includes("dtdc")) {
      return `99${Math.floor(1000000 + Math.random() * 9000000)}`
    }
    if (name.includes("dhl")) {
      return `55${Math.floor(10000000 + Math.random() * 90000000)}`
    }
    if (name.includes("shadow")) {
      return `31${Math.floor(100000 + Math.random() * 900000)}`
    }
    // Default Delhivery (12-digit consignment)
    return `77${Math.floor(1000000000 + Math.random() * 9000000000)}`
  }

  const handleCarrierChange = async (newCourier: string) => {
    setOrder((prev) => (prev ? { ...prev, courier: newCourier } : null))
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courier: newCourier }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.order) setOrder(data.order)
      }
    } catch (err) {
      console.warn("Failed to persist courier change:", err)
    }
  }

  const handleStatusChange = async (
    status: AdminOrder["status"],
    awb?: string,
    isCodCollected?: boolean,
    collectionNote?: string,
    courier?: string
  ) => {
    try {
      setIsSubmittingDelivery(true)
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          awb: awb || order.awb || "",
          courier: courier !== undefined ? courier : (order.courier || ""),
          isCodCollected,
          collectionNote,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.order) {
          setOrder(data.order)
          setShowCodModal(false)
        }
      }
    } catch (err) {
      console.warn("Failed to update status:", err)
    } finally {
      setIsSubmittingDelivery(false)
    }
  }

  const handleMarkDeliveredClick = () => {
    if (isCodOrder && order.paymentStatus !== "Captured" && order.paymentStatus !== "Settled") {
      setShowCodModal(true)
    } else {
      handleStatusChange("Delivered")
    }
  }

  const handleConfirmCodCollection = () => {
    handleStatusChange(
      "Delivered",
      undefined,
      true,
      codCollectionNote.trim() || `Cash collected (₹${order.total}) by courier delivery agent upon delivery.`
    )
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      try {
        const res = await fetch(`/api/admin/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: newNote.trim() }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.order) setOrder(data.order)
          setNewNote("")
        }
      } catch (err) {
        console.warn("Failed to add note:", err)
      }
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
                Fulfillment Workspace
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  order.status === "Delivered"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : order.status === "Shipped"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700"
                }`}
              >
                {order.status || "Processing"}
              </span>
              {isCodOrder && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Banknote className="h-3 w-3" /> COD
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-display">
              Order #{order.displayId}
            </h1>
          </div>
        </div>

        {/* Quick Fulfillment Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase inline-flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Print Invoice
          </button>

          {order.status !== "Shipped" && order.status !== "Delivered" && (
            <button
              onClick={() => {
                const assignedCourier = order.courier || ""
                const finalAwb = newAwb.trim() || (assignedCourier ? generateCarrierAwb(assignedCourier) : "")
                handleStatusChange("Shipped", finalAwb, undefined, undefined, assignedCourier)
              }}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase inline-flex items-center gap-1.5 shadow-lg shadow-accent/20"
            >
              <Truck className="h-3.5 w-3.5" /> Dispatch Order
            </button>
          )}

          {order.status !== "Delivered" && (
            <button
              onClick={handleMarkDeliveredClick}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase inline-flex items-center gap-1.5 shadow-lg shadow-emerald-950"
            >
              <Check className="h-3.5 w-3.5" /> Mark Delivered
            </button>
          )}

          {order.status === "Delivered" && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-bold uppercase inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Order Completed
            </span>
          )}

          {order.status !== "Delivered" && order.status !== "Cancelled" && (
            <button
              onClick={() => handleStatusChange("Cancelled")}
              className="px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-400 text-xs font-bold uppercase"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Items, Timeline, Courier Assignment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">
              Line Items in Shipment ({items.length})
            </h3>

            {items.length === 0 ? (
              <p className="text-zinc-500 text-xs italic">No items listed in order.</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative aspect-[3/4] w-12 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
                            No Img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        <p className="text-[11px] text-zinc-400">
                          {item.variant} • SKU: <span className="font-mono text-zinc-300">{item.sku}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                      <p className="text-[11px] text-zinc-400">{item.quantity} × {formatPrice(item.price || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Totals */}
            <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(order.subtotal || order.total || 0)}</span>
              </div>
              {(order.discountTotal || 0) > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(order.discountTotal || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Pan-India Shipping</span>
                <span className="text-emerald-400 font-bold">
                  {(order.shippingTotal || 0) === 0 ? "FREE" : formatPrice(order.shippingTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (Included)</span>
                <span>{formatPrice(order.taxTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white border-t border-zinc-800 pt-2">
                <div className="flex items-center gap-2">
                  <span>Total Settled</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      order.paymentStatus === "Captured" || order.paymentStatus === "Settled"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <span>{formatPrice(order.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Courier & AWB Assignment Bar */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                Logistics & Courier Assignment
              </h3>
              {order.courier ? (
                <a
                  href={getCarrierTrackingPortalUrl(order.courier, newAwb || order.awb)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
                >
                  <span>Track on Carrier Website</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Assigned Carrier</label>
                <select
                  value={order.courier || ""}
                  onChange={(e) => handleCarrierChange(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">-- None (Unassigned) --</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="Bluedart Express">Bluedart Express</option>
                  <option value="DTDC">DTDC</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="Shadowfax">Shadowfax Local</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Tracking AWB Number</label>
                <input
                  type="text"
                  placeholder="Enter AWB from courier portal"
                  value={newAwb}
                  onChange={(e) => setNewAwb(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Order Activity Timeline */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">
              Audit Timeline
            </h3>

            <div className="space-y-4">
              {timeline.length === 0 ? (
                <p className="text-zinc-500 text-xs italic">No timeline entries recorded.</p>
              ) : (
                timeline.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white">{t.title}</strong>
                        <span className="text-[10px] text-zinc-500 font-mono">{t.time}</span>
                      </div>
                      <p className="text-zinc-400">{t.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Customer, Delivery Address, Staff Notes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Profile Card */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
            <h3 className="font-bold uppercase text-white tracking-wider">
              Customer Information
            </h3>
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">{customer.name}</p>
              <p className="text-zinc-400">{customer.email}</p>
              {customer.phone && <p className="text-zinc-400">{customer.phone}</p>}
            </div>
            {customer.id && customer.id !== "cus_unknown" && (
              <div className="pt-2 border-t border-zinc-800">
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="text-xs font-bold text-accent hover:underline"
                >
                  View Customer 360 Profile →
                </Link>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
            <h3 className="font-bold uppercase text-white tracking-wider">
              Delivery Destination
            </h3>
            <div className="space-y-1 text-zinc-300 leading-relaxed">
              <p className="font-bold text-white">{shippingAddress.name}</p>
              {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state} -{" "}
                <span className="font-mono text-white font-bold">{shippingAddress.pincode}</span>
              </p>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
            <h3 className="font-bold uppercase text-white tracking-wider">
              Internal Staff Notes
            </h3>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notes.length > 0 ? (
                notes.map((note, idx) => (
                  <div key={idx} className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 text-zinc-300">
                    {note}
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 italic">No notes added.</p>
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-xs"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* COD Cash Collection Confirmation Modal */}
      {showCodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-amber-500/30 p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowCodModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Banknote className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Confirm Cash on Delivery Collection
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Order <strong className="text-white font-mono">#{order.displayId}</strong> is a Cash on Delivery shipment. Confirming delivery will automatically capture and settle the payment ledger.
                </p>
              </div>
            </div>

            {/* Collection Summary Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-zinc-400">Total Cash to Collect:</span>
                <span className="text-base font-black text-amber-400 font-display">
                  {formatPrice(order.total || 0)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Customer:</span>
                <span className="font-semibold text-white">{customer.name} ({customer.phone})</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Assigned Courier:</span>
                <span className="font-semibold text-white">{order.courier || "None (Unassigned)"}</span>
              </div>
              {order.awb && (
                <div className="flex justify-between text-zinc-400">
                  <span>Tracking AWB:</span>
                  <span className="font-mono text-zinc-300">{order.awb}</span>
                </div>
              )}
            </div>

            {/* Collection Receipt Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Delivery Receipt / Agent Verification Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cash received by delivery agent. Receipt #DLV-4029"
                value={codCollectionNote}
                onChange={(e) => setCodCollectionNote(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCodModal(false)}
                disabled={isSubmittingDelivery}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors"
              >
                No, Cash Not Collected
              </button>
              <button
                type="button"
                onClick={handleConfirmCodCollection}
                disabled={isSubmittingDelivery}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase transition-all flex items-center gap-2 shadow-lg shadow-emerald-950"
              >
                {isSubmittingDelivery ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Settling...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Yes, Cash Collected ({formatPrice(order.total || 0)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
