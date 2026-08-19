export const dynamic = "force-dynamic"

import React from "react"
import { contentStore } from "@/lib/content-store"

export const metadata = {
  title: "Privacy Policy | ADIKT Clothing Co.",
  description: "Indian Information Technology Act compliant privacy policy of ADIKT Clothing Co.",
}

export default function PrivacyPolicyPage() {
  const content = contentStore.getContent()
  const privacy = content.pages?.privacy || {
    title: "Privacy & Data Protection Policy",
    subtitle:
      "How ADIKT collects, uses, and secures your personal and order data under the Digital Personal Data Protection Act (DPDPA).",
    lastUpdated: "August 2026",
    sections: [
      {
        id: "prv_1",
        title: "1. Information We Collect",
        content:
          "We collect name, email address, mobile number, delivery address, order history, and device telemetry when you use our website or place an order.",
      },
    ],
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Legal & Compliance</span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
          {privacy.title}
        </h1>
        <p className="text-xs text-zinc-400">Effective Date: {privacy.lastUpdated} | Compliant with Indian IT Act & DPDPA</p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {privacy.subtitle && (
          <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800">
            {privacy.subtitle}
          </p>
        )}

        {privacy.sections?.map((section, idx) => (
          <div key={section.id || idx} className="space-y-3 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800">
            <h2 className="text-base font-black text-white uppercase font-display">{section.title}</h2>
            <div className="text-zinc-400 whitespace-pre-line leading-relaxed">{section.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
