"use client"

export const dynamic = "force-dynamic"

import React, { useState, useMemo } from "react"
import { ChevronDown, Plus, Minus, Search, Sparkles } from "@/components/ui/Icons"
import { useContent } from "@/components/providers/ContentContext"

export default function FAQPage() {
  const { content } = useContent()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "0-0": true,
    "1-0": true,
  })
  const [searchQuery, setSearchQuery] = useState("")

  const faqData = content.pages?.faq || {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about our custom milling, high-GSM fabrics, orders, and returns.",
    items: content.faqItems || [],
  }

  const allItems = (faqData.items && faqData.items.length > 0) ? faqData.items : (content.faqItems || [])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems
    const q = searchQuery.toLowerCase()
    return allItems.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [allItems, searchQuery])

  const groupedFaqs = useMemo(() => {
    const map = new Map<string, { q: string; a: string; id: string }[]>()
    for (const item of filteredItems) {
      const cat = item.category || "General"
      if (!map.has(cat)) {
        map.set(cat, [])
      }
      map.get(cat)!.push({ q: item.question, a: item.answer, id: item.id })
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
  }, [filteredItems])

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Help & Knowledge Base</span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
          {faqData.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">{faqData.subtitle}</p>

        {/* Search FAQs */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by topic (e.g. GSM, wash care, COD, refunds)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {groupedFaqs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8 space-y-2">
            <p className="text-sm font-bold text-white uppercase">No matching questions found</p>
            <p className="text-xs text-zinc-400">Try searching for a different keyword or contact customer support directly.</p>
          </div>
        ) : (
          groupedFaqs.map((group, groupIdx) => (
            <div key={group.category} className="space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-accent flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {group.category}
              </h2>

              <div className="space-y-3">
                {group.items.map((item, itemIdx) => {
                  const key = `${groupIdx}-${itemIdx}`
                  const isOpen = !!openItems[key]

                  return (
                    <div
                      key={item.id || itemIdx}
                      className="rounded-2xl bg-zinc-900 border border-zinc-800 transition-colors overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full p-5 flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-white hover:text-accent transition-colors"
                      >
                        <span>{item.q}</span>
                        <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                          {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-4">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
