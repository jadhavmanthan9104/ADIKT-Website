"use client"

import React, { useState } from "react"
import { ChevronDown, Plus, Minus } from "@/components/ui/Icons"

interface FAQItem {
  q: string
  a: string
}

const FAQS: { category: string; items: FAQItem[] }[] = [
  {
    category: "Fabric, GSM & Quality",
    items: [
      {
        q: "What does 280 GSM vs 400 GSM mean?",
        a: "GSM stands for Grams per Square Meter. Standard commercial t-shirts are 140–180 GSM. ADIKT 280 GSM tees are double the density, offering an architectural boxy drape that holds its structure. Our 400 GSM loopback French Terry fleece provides substantial thermal weight and premium hand feel.",
      },
      {
        q: "Will the garments shrink after washing?",
        a: "No. All ADIKT fabrics undergo a rigorous pre-shrunk bio-wash bath during milling in Tirupur. Post-wash shrinkage is under 1% when following our cold wash instructions.",
      },
      {
        q: "How should I wash and care for high-density puff prints?",
        a: "Machine wash cold inside out with mild detergent. Never iron directly over 3D puff or screen prints. Lay flat to dry in shade to prevent hanger distortion.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "What are your delivery timelines across India?",
        a: "Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad) receive orders within 2 to 3 business days via Bluedart/Delhivery Air. Rest of India takes 3 to 5 business days.",
      },
      {
        q: "Is Cash on Delivery (COD) available?",
        a: "Yes! Cash on Delivery is available across 26,000+ PIN codes in India.",
      },
      {
        q: "How do I track my order?",
        a: "Once dispatched from our Tirupur warehouse, you will receive a tracking link via SMS and WhatsApp. You can also view live tracking anytime under My Account > My Orders.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day doorstep return and exchange policy from the date of delivery. Items must be unworn, unwashed, and in their original packaging with tags intact.",
      },
      {
        q: "How are refunds processed?",
        a: "Prepaid orders (Razorpay/UPI/Cards) are refunded directly to the original payment source within 3–5 business days. COD orders are refunded via instant UPI transfer or store credit.",
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "0-0": true,
    "1-0": true,
  })

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Help Center</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-zinc-400">Everything you need to know about sizing, GSM fabrics, and orders</p>
      </div>

      <div className="space-y-8">
        {FAQS.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-accent">
              {group.category}
            </h2>

            <div className="space-y-3">
              {group.items.map((item, itemIdx) => {
                const key = `${groupIdx}-${itemIdx}`
                const isOpen = !!openItems[key]

                return (
                  <div
                    key={itemIdx}
                    className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 transition-colors"
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full text-left flex justify-between items-center gap-4"
                    >
                      <span className="text-sm font-bold text-white uppercase">{item.q}</span>
                      <span className="p-1 rounded bg-zinc-800 text-zinc-400">
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <p className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800/80 leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
