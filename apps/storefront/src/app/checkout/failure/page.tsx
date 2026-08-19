"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle, RefreshCw, ArrowLeft, ShieldCheck, HelpCircle } from "@/components/ui/Icons"

function FailureContent() {
  const searchParams = useSearchParams()
  const reason =
    searchParams.get("reason") ||
    "Payment was declined by the bank or authorization window timed out."

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="inline-flex p-4 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
        <AlertCircle className="h-12 w-12" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
          Transaction Incomplete
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Payment Was Not Completed
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          No charges were finalized on your bank account. Your shopping bag items have been preserved.
        </p>
      </div>

      {/* Failure Diagnostic Box */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-4 text-xs shadow-lg">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
          <span className="font-bold text-white uppercase tracking-wider">Diagnostic Reason</span>
          <span className="bg-red-950/80 text-red-300 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-red-800/60">
            Payment Failed
          </span>
        </div>

        <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
          {reason}
        </p>

        <div className="space-y-1.5 text-[11px] text-zinc-400 pt-1">
          <p className="font-bold text-zinc-300">Recommended Steps:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Ensure sufficient balance or UPI daily limit is not exceeded</li>
            <li>Retry with an alternative payment method (Google Pay, Cards, or NetBanking)</li>
            <li>Select Cash on Delivery (COD) for zero upfront payment</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/checkout"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-xl text-xs transition-colors shadow-md active:scale-95"
        >
          <RefreshCw className="h-4 w-4" /> Retry Checkout
        </Link>
        <Link
          href="/faq"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold uppercase rounded-xl text-xs transition-colors"
        >
          <HelpCircle className="h-4 w-4" /> Payment FAQ & Help
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500 text-xs">Loading diagnostics...</div>}>
      <FailureContent />
    </Suspense>
  )
}
