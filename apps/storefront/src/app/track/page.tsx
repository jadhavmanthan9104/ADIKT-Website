"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  ExternalLink,
} from "@/components/ui/Icons"
import { formatPrice } from "@/lib/formatters"
import { getCarrierTrackingPortalUrl } from "@/lib/shipping/shipping-service"

interface TrackingCheckpoint {
  status: string
  title: string
  location: string
  timestamp: string
  description: string
}

interface TrackingData {
  shipment: any
  checkpoints: TrackingCheckpoint[]
  status: string
  courier: string
  courierCode: string
  officialPortalUrl: string
  awb: string
  estimatedDelivery: string
}

const LIFECYCLE_STEPS = [
  "Order Placed",
  "Packed",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
]

function TrackContent() {
  const searchParams = useSearchParams()
  const initialAwb = searchParams.get("awb") || searchParams.get("orderId") || "889123041"

  const [query, setQuery] = useState(initialAwb)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTracking = async (awbToFetch: string) => {
    if (!awbToFetch || !awbToFetch.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const cleanAwb = awbToFetch.trim()
      const res = await fetch(`/api/shipping/track/${encodeURIComponent(cleanAwb)}`)
      const data = await res.json()

      if (!res.ok || !data.success || !data.tracking) {
        throw new Error(data?.error || "Unable to locate shipment for the provided tracking number.")
      }

      setTrackingData(data.tracking)
    } catch (err: any) {
      setError(err.message || "Failed to load tracking data.")
      setTrackingData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialAwb) {
      fetchTracking(initialAwb)
    }
  }, [initialAwb])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTracking(query)
  }

  const activeStepIndex = trackingData
    ? LIFECYCLE_STEPS.indexOf(trackingData.status)
    : -1

  const officialPortalUrl = trackingData
    ? getCarrierTrackingPortalUrl(trackingData.courier, trackingData.awb)
    : "https://www.bluedart.com/tracking"

  // Calculate current stage index in LIFECYCLE_STEPS
  const getStepIndex = (status: string) => {
    if (status === "Delivered") return 5
    if (status === "Out for Delivery") return 4
    if (status === "In Transit") return 3
    if (status === "Shipped") return 2
    if (status === "Packed") return 1
    return 0
  }

  const currentStepIdx = trackingData ? getStepIndex(trackingData.status) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#9A0000] flex items-center justify-center gap-1.5">
          <Truck className="h-4 w-4 text-[#9A0000]" /> Pan-India Express Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-display">
          Live Parcel Tracking
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Track your heavyweight garment delivery in real-time across Bluedart, Delhivery, DTDC, DHL, and Shadowfax air networks.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="pt-4 flex gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Enter AWB (e.g. 889123041) or Order # (ADKT-10492)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#9A0000] shadow-sm dark:shadow-lg"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#9A0000] hover:bg-[#7a0000] text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-[#9A0000]/30"
          >
            {isLoading ? "Tracking..." : "Track"}
          </button>
        </form>

        {/* Sample Quick Links for Major Indian Carriers */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-500 pt-1">
          <span className="font-semibold text-zinc-600 dark:text-zinc-400">Live Demos:</span>
          <button
            onClick={() => {
              setQuery("889123041")
              fetchTracking("889123041")
            }}
            className="text-[#9A0000] hover:underline font-mono font-bold"
          >
            889123041 (Bluedart)
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setQuery("771239084120")
              fetchTracking("771239084120")
            }}
            className="text-[#9A0000] hover:underline font-mono font-bold"
          >
            771239084120 (Delhivery)
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setQuery("992384715")
              fetchTracking("992384715")
            }}
            className="text-[#9A0000] hover:underline font-mono font-bold"
          >
            992384715 (DTDC)
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setQuery("5542109832")
              fetchTracking("5542109832")
            }}
            className="text-[#9A0000] hover:underline font-mono font-bold"
          >
            5542109832 (DHL)
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 text-xs flex items-center gap-3 max-w-2xl mx-auto shadow-xs">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Tracking Result View */}
      {trackingData && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Status Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-6 dark:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-zinc-500 dark:text-zinc-400 text-xs font-bold">
                    AWB: <strong className="text-zinc-900 dark:text-white font-mono">{trackingData.awb}</strong>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#9A0000] text-white border border-[#9A0000] shadow-sm">
                    {trackingData.courier}
                  </span>
                  {officialPortalUrl && (
                    <a
                      href={officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 hover:text-[#9A0000] dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 px-2.5 py-0.5 rounded-full transition-colors shadow-2xs"
                    >
                      <span>Official Gateway Portal</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-display uppercase tracking-tight mt-1">
                  {trackingData.status}
                </h2>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">Estimated Delivery</span>
                <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                  {trackingData.estimatedDelivery}
                </span>
              </div>
            </div>

            {/* Lifecycle Progress Stepper */}
            <div className="space-y-4 pt-1">
              <div className="relative">
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
                    width: `calc(${currentStepIdx} * 100% / 6)`,
                  }}
                />

                <div className="grid grid-cols-6 relative z-10 text-center">
                  {LIFECYCLE_STEPS.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx
                    const isCurrent = idx === currentStepIdx

                    return (
                      <div key={step} className="flex flex-col items-center space-y-2 px-0.5 sm:px-1">
                        <div className="h-9 w-full flex items-center justify-center">
                          <div
                            className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ring-4 ring-white dark:ring-zinc-900 ${
                              isCurrent
                                ? "bg-[#9A0000] text-white ring-4 ring-[#9A0000]/30 shadow-lg shadow-[#9A0000]/40 scale-105"
                                : isPassed
                                ? "bg-[#9A0000] text-white shadow-sm"
                                : "bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 font-bold"
                            }`}
                          >
                            {isPassed ? (
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            ) : (
                              <span className="text-[11px] sm:text-xs">{idx + 1}</span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] sm:text-[11px] uppercase tracking-wider leading-tight ${
                            isCurrent
                              ? "text-[#9A0000] font-black"
                              : isPassed
                              ? "text-zinc-900 dark:text-white font-bold"
                              : "text-zinc-500 dark:text-zinc-400 font-medium"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid: Checkpoint Timeline (7 cols) + Shipment Details (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Checkpoints Timeline */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#9A0000]" /> Live Carrier Activity Log
              </h3>

              <div className="space-y-0 pt-1">
                {trackingData.checkpoints.map((cp, idx) => {
                  const isLatest = idx === 0
                  const isLast = idx === trackingData.checkpoints.length - 1

                  return (
                    <div key={idx} className="flex gap-4 group">
                      {/* Left Column: Center-aligned Marker Dot + Connecting Track */}
                      <div className="flex flex-col items-center shrink-0">
                        {/* Status Marker Dot */}
                        <div
                          className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                            isLatest
                              ? "bg-[#9A0000] ring-4 ring-[#9A0000]/25 shadow-md shadow-[#9A0000]/40 scale-105"
                              : "bg-zinc-300 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900"
                          }`}
                        >
                          {isLatest && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          )}
                        </div>

                        {/* Connecting Line (Only between consecutive nodes) */}
                        {!isLast && (
                          <div className="w-[2px] flex-1 bg-zinc-200 dark:bg-zinc-800 my-1 group-last:hidden min-h-[44px]" />
                        )}
                      </div>

                      {/* Right Column: Checkpoint Details */}
                      <div className={`flex-1 ${!isLast ? "pb-6" : "pb-1"} space-y-1.5 text-xs`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className={`font-bold text-sm ${isLatest ? "text-zinc-950 dark:text-white" : "text-zinc-700 dark:text-zinc-300"}`}>
                            {cp.title}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-medium">
                            {cp.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-[#9A0000] shrink-0" />
                          <span>{cp.location}</span>
                        </div>

                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                          {cp.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Destination & Package Information */}
            <div className="lg:col-span-5 space-y-6">
              {/* Recipient Destination Card */}
              {trackingData.shipment?.shippingAddress && (
                <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4 text-xs">
                  <h3 className="font-bold uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Delivery Destination
                  </h3>
                  <div className="space-y-1 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{trackingData.shipment.shippingAddress.name}</p>
                    <p>{trackingData.shipment.shippingAddress.addressLine1}</p>
                    {trackingData.shipment.shippingAddress.addressLine2 && (
                      <p>{trackingData.shipment.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {trackingData.shipment.shippingAddress.city}, {trackingData.shipment.shippingAddress.state} -{" "}
                      <span className="font-mono text-zinc-900 dark:text-white font-bold">{trackingData.shipment.shippingAddress.pincode}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Items in Package Card */}
              {trackingData.shipment?.items && trackingData.shipment.items.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4 text-xs">
                  <h3 className="font-bold uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#9A0000]" /> Garments in Parcel ({trackingData.shipment.items.length})
                  </h3>

                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {trackingData.shipment.items.map((item: any, idx: number) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{item.title}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.variant} • Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-white font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500 text-xs">Loading live tracker...</div>}>
      <TrackContent />
    </Suspense>
  )
}
