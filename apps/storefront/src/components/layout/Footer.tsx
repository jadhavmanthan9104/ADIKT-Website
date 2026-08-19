"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check } from "@/components/ui/Icons"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { contentStore, AdminContentItem } from "@/lib/content-store"

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TwitterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

function YoutubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

export function Footer() {
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [content, setContent] = useState<AdminContentItem>(contentStore.getContent())

  useEffect(() => {
    // Initial fetch from API
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) setContent(data.content)
      })
      .catch(() => {})

    return contentStore.subscribe(() => {
      setContent(contentStore.getContent())
    })
  }, [])

  if (pathname?.startsWith("/admin")) return null

  const footer = content.footer || {
    brandBio:
      "Direct-to-consumer luxury streetwear engineered with 280–400 GSM custom fabrics, raw hems, and architectural drape. Crafted in India.",
    locationText: "Tirupur Textile Mills & Bandra Design Studio, Mumbai",
    newsletterTitle: "Be First To Access 400 GSM Drops & Archival Releases",
    newsletterSubtitle: "Zero spam. Direct SMS & email notifications 30 minutes before public launch.",
    socialLinks: {
      instagram: "https://instagram.com/adiktclothing",
      twitter: "https://twitter.com/adiktclothing",
      youtube: "https://youtube.com/@adiktclothing",
      discord: "https://discord.gg/adikt",
    },
    contactInfo: {
      email: "support@adiktclothing.com",
      phone: "+91 98765 43210",
      address: "ADIKT Apparel Works Pvt Ltd, Linking Road, Bandra West, Mumbai, MH 400050",
      hours: "Mon – Sat: 10:00 AM – 7:00 PM IST",
    },
    linkColumns: [],
  }

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
              Early Drop Access
            </span>
            <h3 className="text-xl font-bold uppercase text-white font-display">
              {footer.newsletterTitle || "Be First To Access 400 GSM Drops & Archival Releases"}
            </h3>
            <p className="text-xs text-zinc-400">
              {footer.newsletterSubtitle || "Zero spam. Direct SMS & email notifications 30 minutes before public launch."}
            </p>
          </div>

          <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold uppercase">
                <Check className="h-4 w-4" /> You&apos;re on the exclusive list
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
              {footer.brandBio}
            </p>
            {Boolean(footer.locationText?.trim()) && (
              <div className="pt-2 text-xs text-zinc-500">
                <p>📍 {footer.locationText.trim()}</p>
              </div>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {footer.socialLinks?.instagram && (
                <a
                  href={footer.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {footer.socialLinks?.twitter && (
                <a
                  href={footer.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Twitter / X"
                >
                  <TwitterIcon className="h-4 w-4" />
                </a>
              )}
              {footer.socialLinks?.youtube && (
                <a
                  href={footer.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {footer.linkColumns && footer.linkColumns.length > 0 ? (
            footer.linkColumns.map((col, idx) => (
              <div key={col.id || idx} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-xs">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link href={link.url} className="hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              {/* Fallback Silhouettes */}
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

              {/* Fallback Customer Care */}
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

              {/* Fallback Legal */}
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
            </>
          )}
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© 2026 ADIKT Clothing Co. All rights reserved.</p>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-3">
              <span>🇮🇳 Made In India</span>
              <span>•</span>
              <span>100% Combed Cotton</span>
            </div>
          </div>

          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
