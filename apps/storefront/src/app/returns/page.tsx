import React from "react"
import { RefreshCw, CheckCircle2 } from "@/components/ui/Icons"

export const metadata = {
  title: "7-Day Returns & Exchanges Policy | ADIKT Clothing Co.",
  description: "Learn about ADIKT's 7-day hassle-free reverse pickup, size exchange policy, and direct refund processing.",
}

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Customer Assurance</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          7-Day Return & Exchange Policy
        </h1>
        <p className="text-xs text-zinc-400">Hassle-free doorstep reverse pickups across India</p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-3 text-accent font-bold text-sm uppercase">
            <RefreshCw className="h-5 w-5" /> 7-Day Doorstep Guarantee
          </div>
          <p>
            We take extreme pride in the weight, fabric, and construction of our garments. If a piece does not fit your silhouette or you wish to exchange for a different size or colorway, you can request a return or exchange within <strong>7 days of delivery</strong>.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">1. Return & Exchange Eligibility</h2>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
            <li>Garments must be unworn, unwashed, and free from perfume, stains, or deodorant marks.</li>
            <li>Original ADIKT brand tags and fabric spec labels must remain intact and attached.</li>
            <li>Pieces must be packed in their original branded zip bag.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">2. Reverse Pickup Process</h2>
          <p className="text-zinc-400">
            Once a return or exchange request is placed via your Customer Dashboard or by emailing <strong>support@adiktclothing.com</strong>, our logistics partner will arrange a doorstep reverse pickup within 24 to 48 hours.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">3. Refund Processing Timelines</h2>
          <p className="text-zinc-400">
            • <strong>Prepaid Orders (Razorpay UPI/Cards)</strong>: Refund is initiated back to your original payment method within 24 hours of warehouse quality check (settles in 3–5 bank days).<br />
            • <strong>COD Orders</strong>: Refund is processed instantly via UPI transfer to your provided VPA or issued as non-expiring store credit.
          </p>
        </div>
      </div>
    </div>
  )
}
