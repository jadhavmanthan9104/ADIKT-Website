export const dynamic = "force-dynamic"

import React from "react"
import { Truck } from "@/components/ui/Icons"
import { contentStore } from "@/lib/content-store"

export const metadata = {
  title: "Shipping & Delivery Policy | ADIKT Clothing Co.",
  description: "Pan-India express delivery timelines, Bluedart/Delhivery shipping rates, and Cash on Delivery policy.",
}

export default function ShippingPolicyPage() {
  const content = contentStore.getContent()
  const shipping = content.pages?.shipping || {
    title: "Shipping & Delivery Policy",
    subtitle: "Fast, tracked air express delivery across all 26,000+ Indian PIN codes.",
    badge: "Express Nationwide Logistics",
    lastUpdated: "August 2026",
    sections: [
      {
        id: "shp_1",
        title: "1. Order Processing & Dispatch",
        content:
          "All orders placed before 2:00 PM IST on business days are dispatched the same day from our primary warehouse in Tirupur, Tamil Nadu.",
      },
    ],
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          {shipping.badge || "Logistics Policy"}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
          {shipping.title}
        </h1>
        <p className="text-xs text-zinc-400">Last updated: {shipping.lastUpdated}</p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {shipping.subtitle && (
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-3 text-accent font-bold text-sm uppercase">
              <Truck className="h-5 w-5" /> Express Pan-India Delivery
            </div>
            <p className="text-zinc-300">{shipping.subtitle}</p>
          </div>
        )}

        {shipping.sections?.map((section, idx) => (
          <div key={section.id || idx} className="space-y-3 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800">
            <h2 className="text-base font-black text-white uppercase font-display">{section.title}</h2>
            <div className="text-zinc-400 whitespace-pre-line leading-relaxed">{section.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
