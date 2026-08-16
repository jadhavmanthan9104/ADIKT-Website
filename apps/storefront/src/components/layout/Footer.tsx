"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Check } from "@/components/ui/Icons"
import { BrandLogo } from "@/components/ui/BrandLogo"

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
    }
  }

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      {/* Newsletter Signup Banner */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              VIP Drop Access
            </span>
            <h3 className="text-xl font-bold uppercase text-white font-display">
              Be First To Access 400 GSM Drops & Archival Releases
            </h3>
            <p className="text-xs text-zinc-400">
              Zero spam. Direct SMS & email notifications 30 minutes before public launch.
            </p>
          </div>

          <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold uppercase">
                <Check className="h-4 w-4" /> You&apos;re on the VIP list
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent w-full md:w-64"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase rounded-lg shrink-0"
                >
                  Join List
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <BrandLogo size="lg" href="/" />
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              Engineered luxury streetwear & high-GSM silhouettes. Designed, milled, and manufactured with uncompromising craftsmanship in India.
            </p>
            <div className="pt-2 text-xs text-zinc-500 space-y-1">
              <p>📍 Tirupur Manufacturing Facility & Mumbai Design Studio</p>
              <p>⚡ Powered by self-hosted Medusa v2 & Next.js</p>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Silhouettes
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=tees" className="hover:text-white transition-colors">Heavyweight Tees (280 GSM)</Link></li>
              <li><Link href="/shop?category=hoodies" className="hover:text-white transition-colors">French Terry Hoodies (400 GSM)</Link></li>
              <li><Link href="/shop?category=cargos" className="hover:text-white transition-colors">Parachute Cargos</Link></li>
              <li><Link href="/collections/core-heavyweight" className="hover:text-white transition-colors">Core Series</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Concierge
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/account" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">7-Day Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ & Size Guide</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors">Brand Story & Heritage</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li className="text-[11px] text-zinc-500 pt-3">
                🔒 256-bit SSL encrypted payments via Razorpay. UPI, Cards & Cash on Delivery.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} ADIKT Clothing Co. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>🇮🇳 Proudly Made In India</span>
            <span>•</span>
            <span>Zero Synthetic Polyester Blends</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
