"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Truck, ArrowRight, Package, ShieldCheck, CreditCard, Banknote } from "@/components/ui/Icons"
import { formatPrice } from "@/lib/formatters"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || "ADKT-10492"
  const paymentId = searchParams.get("paymentId")
  const mode = searchParams.get("mode") || "razorpay"
  const rawAmount = searchParams.get("amount")
  const amount = rawAmount ? Number(rawAmount) : null

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      {/* Luxury Animated Checkmark */}
      <div className="relative inline-flex items-center justify-center mx-auto animate-success-pop">
        {/* Pulsing Emerald Halo */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-2xl animate-success-glow pointer-events-none" />

        {/* Outer Frosted Glass Ring */}
        <div className="relative p-3.5 sm:p-4 rounded-full bg-emerald-950/80 border border-emerald-500/40 shadow-2xl shadow-emerald-950/80 backdrop-blur-md">
          <svg
            className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Track */}
            <circle
              cx="26"
              cy="26"
              r="24"
              className="stroke-emerald-500/20"
              strokeWidth="2.5"
            />
            {/* Smooth Drawing Circle */}
            <circle
              cx="26"
              cy="26"
              r="24"
              className="stroke-emerald-400 animate-success-circle"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Smooth Drawing Checkmark Path */}
            <path
              d="M15 27.5L22.5 35L37 19"
              className="stroke-emerald-400 animate-success-check"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-accent flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Order Placed & Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Thank You For Your Order
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Your order <strong className="text-white">#{orderId}</strong> has been secured and sent to our garment fulfillment hub in Tirupur.
        </p>
      </div>

      {/* Order Snapshot Card */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-4 text-xs shadow-lg">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
          <span className="font-bold text-white uppercase tracking-wider">Order Reference</span>
          <span className="bg-zinc-800 text-white font-mono font-bold px-2.5 py-1 rounded-lg text-xs border border-zinc-700">
            #{orderId}
          </span>
        </div>

        {paymentId && (
          <div className="flex justify-between items-center text-zinc-300">
            <span>Gateway Transaction ID</span>
            <span className="font-mono text-zinc-400 text-[11px]">{paymentId}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-zinc-300">
          <span>Payment Method</span>
          <span className="font-bold text-white flex items-center gap-1.5">
            {mode === "cod" ? (
              <>
                <Banknote className="h-3.5 w-3.5 text-amber-400" /> Cash on Delivery (COD)
              </>
            ) : (
              <>
                <CreditCard className="h-3.5 w-3.5 text-accent" /> Razorpay Online (Prepaid)
              </>
            )}
          </span>
        </div>

        {amount && (
          <div className="flex justify-between items-center text-zinc-300">
            <span>Total Paid / Due</span>
            <span className="font-extrabold text-white text-sm">{formatPrice(amount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-zinc-300">
          <span>Estimated Delivery</span>
          <span className="font-bold text-emerald-400">2-3 Business Days (Express)</span>
        </div>

        <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center gap-3">
          <Truck className="h-5 w-5 text-accent shrink-0" />
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            We will send real-time SMS & WhatsApp alerts with your Bluedart/Delhivery AWB number once dispatched.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/account/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-xl text-xs transition-colors shadow-md active:scale-95"
        >
          <Package className="h-4 w-4" /> View In Order History
        </Link>
        <Link
          href="/shop"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold uppercase rounded-xl text-xs transition-colors"
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
