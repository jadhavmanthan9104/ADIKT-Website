export const dynamic = "force-dynamic"

import React from "react"
import { RefreshCw } from "@/components/ui/Icons"
import { contentStore } from "@/lib/content-store"

export const metadata = {
  title: "7-Day Returns & Exchanges Policy | ADIKT Clothing Co.",
  description: "Learn about ADIKT's 7-day hassle-free reverse pickup, size exchange policy, and direct refund processing.",
}

export default function ReturnsPolicyPage() {
  const content = contentStore.getContent()
  const returns = content.pages?.returns || {
    title: "Returns & Exchange Policy",
    subtitle: "7-Day doorstep pickup and automated instant exchanges.",
    badge: "Hassle-Free Doorstep Reverse Logistics",
    lastUpdated: "August 2026",
    sections: [
      {
        id: "ret_1",
        title: "1. 7-Day Doorstep Returns & Exchanges",
        content:
          "We offer a 7-day return and exchange window from the exact delivery timestamp.",
      },
    ],
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          {returns.badge || "Customer Assurance"}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
          {returns.title}
        </h1>
        <p className="text-xs text-zinc-400">Last updated: {returns.lastUpdated}</p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {returns.subtitle && (
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-3 text-accent font-bold text-sm uppercase">
              <RefreshCw className="h-5 w-5" /> 7-Day Doorstep Guarantee
            </div>
            <p className="text-zinc-300">{returns.subtitle}</p>
          </div>
        )}

        {returns.sections?.map((section, idx) => (
          <div key={section.id || idx} className="space-y-3 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800">
            <h2 className="text-base font-black text-white uppercase font-display">{section.title}</h2>
            <div className="text-zinc-400 whitespace-pre-line leading-relaxed">{section.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
