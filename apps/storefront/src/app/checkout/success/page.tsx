"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Truck, ArrowRight, Package } from "@/components/ui/Icons"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || "ADKT-10492"
  const mode = searchParams.get("mode") || "razorpay"

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="inline-flex p-4 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 animate-bounce">
        <CheckCircle2 className="h-12 w-12" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Order Confirmed</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Thank You For Your Order
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Your order <strong className="text-white">#{orderId}</strong> has been received and sent to our fulfillment hub in Tirupur.
        </p>
      </div>

      {/* Order Snapshot Card */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-4 text-xs">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
          <span className="font-bold text-white uppercase tracking-wider">Order Reference</span>
          <span className="bg-zinc-800 text-zinc-300 font-mono px-2.5 py-1 rounded text-xs">
            #{orderId}
          </span>
        </div>

        <div className="flex justify-between items-center text-zinc-300">
          <span>Payment Method</span>
          <span className="font-bold text-white">
            {mode === "cod" ? "Cash On Delivery (COD)" : "Razorpay Online (Prepaid)"}
          </span>
        </div>

        <div className="flex justify-between items-center text-zinc-300">
          <span>Estimated Delivery</span>
          <span className="font-bold text-green-400">2-3 Business Days</span>
        </div>

        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center gap-3">
          <Truck className="h-5 w-5 text-accent shrink-0" />
          <p className="text-[11px] text-zinc-400">
            We will send real-time WhatsApp & SMS notifications with your Bluedart/Delhivery AWB number once dispatched.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/account/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-extrabold uppercase rounded-xl text-xs"
        >
          <Package className="h-4 w-4" /> View In Order History
        </Link>
        <Link
          href="/shop"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold uppercase rounded-xl text-xs"
        >
          Explore More Drops <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500 text-xs">Loading order confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
