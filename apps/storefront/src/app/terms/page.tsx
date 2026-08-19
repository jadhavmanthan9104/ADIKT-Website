export const dynamic = "force-dynamic"

import React from "react"
import { contentStore } from "@/lib/content-store"

export const metadata = {
  title: "Terms of Service | ADIKT Clothing Co.",
  description: "Official terms and conditions for orders, pricing, and policies at ADIKT Clothing Co.",
}

export default function TermsOfServicePage() {
  const content = contentStore.getContent()
  const terms = content.pages?.terms || {
    title: "Terms of Service",
    subtitle: "Legal agreement governing your use of ADIKT Clothing Co. store and purchases.",
    lastUpdated: "August 2026",
    sections: [
      {
        id: "trm_1",
        title: "1. Agreement to Terms",
        content:
          "By accessing or purchasing from adiktclothing.com, you agree to be bound by these Terms of Service.",
      },
    ],
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Customer Terms</span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
          {terms.title}
        </h1>
        <p className="text-xs text-zinc-400">Last updated: {terms.lastUpdated}</p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {terms.subtitle && (
          <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800">
            {terms.subtitle}
          </p>
        )}

        {terms.sections?.map((section, idx) => (
          <div key={section.id || idx} className="space-y-3 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800">
            <h2 className="text-base font-black text-white uppercase font-display">{section.title}</h2>
            <div className="text-zinc-400 whitespace-pre-line leading-relaxed">{section.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
