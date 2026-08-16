import React from "react"
import { Truck, ShieldCheck, Clock } from "@/components/ui/Icons"

export const metadata = {
  title: "Shipping & Delivery Policy | ADIKT Clothing Co.",
  description: "Pan-India express delivery timelines, Bluedart/Delhivery shipping rates, and Cash on Delivery policy.",
}

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Logistics Policy</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-zinc-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-3 text-accent font-bold text-sm uppercase">
            <Truck className="h-5 w-5" /> Express Pan-India Delivery
          </div>
          <p>
            All ADIKT orders are dispatched from our primary manufacturing and fulfillment center in Tirupur, Tamil Nadu. We partner exclusively with premium express carriers—<strong>Bluedart Express, Delhivery Air, and DTDC</strong>—to ensure swift, damage-free delivery.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">1. Delivery Timelines</h2>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
            <li><strong>Tier 1 Metros</strong> (Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata): <strong>2–3 Business Days</strong></li>
            <li><strong>Tier 2 & Rest of India</strong>: <strong>3–5 Business Days</strong></li>
            <li><strong>North East & Special Regions</strong>: <strong>5–7 Business Days</strong></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">2. Shipping Charges</h2>
          <p className="text-zinc-400">
            • <strong>Prepaid Orders over ₹1,999</strong>: 100% Free Express Shipping.<br />
            • <strong>Orders under ₹1,999</strong>: Nominal standard shipping fee of ₹150 applies at checkout.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">3. Cash On Delivery (COD)</h2>
          <p className="text-zinc-400">
            Cash On Delivery is available across 26,000+ PIN codes in India. Please ensure the exact cash amount is ready at the time of delivery to avoid doorstep redelivery attempts.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">4. Real-Time Order Tracking</h2>
          <p className="text-zinc-400">
            As soon as your parcel is scanned into the carrier hub, you will receive an automated WhatsApp notification and SMS with your live AWB tracking link. You can also view live status in your Customer Dashboard under <strong>My Orders</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
