"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ShoppingBag, Search, User, Menu, X, Heart } from "@/components/ui/Icons"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { useCart } from "@/components/providers/CartContext"
import { useWishlist } from "@/components/providers/WishlistContext"
import { useCustomer } from "@/components/providers/CustomerContext"
import { useContent } from "@/components/providers/ContentContext"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { content } = useContent()
  const announcement = content?.announcement || { active: false, text: "" }

  // Dynamic Header Menus with fallback
  const leftMenuItems = (content?.navigation?.leftMenuItems || [
    { id: "nav_shop", label: "Shop All", url: "/shop", position: "left" as const, enabled: true },
    { id: "nav_tees", label: "Tees", url: "/shop?category=tees", position: "left" as const, badge: "280 GSM", enabled: true },
    { id: "nav_hoodies", label: "Hoodies", url: "/shop?category=hoodies", position: "left" as const, badge: "400 GSM", enabled: true },
    { id: "nav_cargos", label: "Cargos", url: "/shop?category=cargos", position: "left" as const, enabled: true },
  ]).filter((item) => item.enabled !== false)

  const rightMenuItems = (content?.navigation?.rightMenuItems || [
    { id: "nav_core", label: "Core Series", url: "/collections/core-heavyweight", position: "right" as const, badge: "Signature", enabled: true },
    { id: "nav_craft", label: "The Craft", url: "/about", position: "right" as const, enabled: true },
    { id: "nav_help", label: "Help", url: "/faq", position: "right" as const, enabled: true },
  ]).filter((item) => item.enabled !== false)

  const router = useRouter()
  const pathname = usePathname()
  const { openDrawer, itemCount, isCartBouncing } = useCart()
  const { wishlistCount } = useWishlist()
  const { isAuthenticated, logout } = useCustomer()

  if (pathname?.startsWith("/admin")) return null

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (query) {
      if (typeof window !== "undefined") {
        import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
          AnalyticsHub.search(query)
        })
      }
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      {/* Dynamic Announcement Bar */}
      {announcement.active && announcement.text && (
        announcement.link ? (
          <Link
            href={announcement.link}
            className="block bg-[#9A0000] text-white text-[11px] py-1.5 px-4 text-center font-bold tracking-wider uppercase transition-all hover:bg-[#7a0000] shadow-sm"
          >
            {announcement.text}
          </Link>
        ) : (
          <div className="bg-[#9A0000] text-white text-[11px] py-1.5 px-4 text-center font-bold tracking-wider uppercase transition-all shadow-sm">
            {announcement.text}
          </div>
        )
      )}

      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        {/* Left Side: Mobile Menu Button (Mobile) & Dynamic Category Navigation Links (Desktop) */}
        <div className="flex items-center gap-5 sm:gap-6 flex-1">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2 -ml-2 hover:text-accent transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Left Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-bold uppercase tracking-wider text-zinc-300">
            {leftMenuItems.map((item) => {
              const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-1.5 hover:text-accent transition-colors ${
                    isActive ? "text-accent font-extrabold" : "text-zinc-300"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-extrabold tracking-normal px-1.5 py-0.2 rounded bg-accent/15 text-accent border border-accent/30 lowercase font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Center: Prominent Centered Brand Logo */}
        <div className="flex items-center justify-center shrink-0 px-2 sm:px-4">
          <BrandLogo size="lg" href="/" />
        </div>

        {/* Right Side: Editorial Links & Action Icons */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 flex-1">
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-bold uppercase tracking-wider text-zinc-300 mr-2 sm:mr-4">
            {rightMenuItems.map((item) => {
              const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-1.5 hover:text-accent transition-colors ${
                    isActive ? "text-accent font-extrabold" : "text-zinc-400"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-extrabold tracking-normal px-1.5 py-0.2 rounded bg-accent/15 text-accent border border-accent/30 lowercase font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Quick Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-zinc-300 hover:text-accent p-2 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Customer Account */}
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            className="text-zinc-300 hover:text-accent p-2 hidden sm:block transition-colors"
            aria-label="Customer Account"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Wishlist Counter */}
          <Link
            href="/account/wishlist"
            className="relative text-zinc-300 hover:text-accent p-2 hidden sm:block transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span suppressHydrationWarning className="absolute top-1 right-1 bg-zinc-800 text-[10px] font-bold text-white h-4 w-4 rounded-full flex items-center justify-center border border-zinc-700">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag & Quick Drawer Opener */}
          <button
            id="header-cart-btn"
            onClick={openDrawer}
            className={`relative text-zinc-300 hover:text-white p-2 transition-all duration-300 ${
              isCartBouncing ? "scale-125 text-white" : ""
            }`}
            aria-label="Shopping Bag"
          >
            <ShoppingBag className={`h-5 w-5 transition-transform duration-300 ${isCartBouncing ? "rotate-12 stroke-[2.5]" : ""}`} />
            {itemCount > 0 && (
              <span
                suppressHydrationWarning
                className={`absolute top-1 right-1 bg-[#9A0000] text-[10px] font-black text-white h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                  isCartBouncing ? "scale-125 ring-4 ring-[#9A0000]/50 animate-bounce" : ""
                }`}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {isSearchOpen && (
        <div className="border-t border-zinc-800 bg-zinc-900/95 px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search by fabric, fit, GSM, or silhouette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-lg"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-4 pb-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent px-1">
              Silhouettes & Drops
            </span>
            <div className="space-y-1 pt-1">
              {leftMenuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-1 text-sm font-medium text-zinc-200 hover:text-white"
                >
                  <span className="font-bold uppercase text-xs tracking-wider">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {rightMenuItems.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 px-1">
                The Brand
              </span>
              <div className="space-y-1 pt-1">
                {rightMenuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-1.5 px-1 text-sm font-medium text-zinc-300 hover:text-white"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-zinc-800 grid grid-cols-2 gap-2 text-xs font-bold uppercase">
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg bg-zinc-900 text-center text-white hover:bg-zinc-800"
                >
                  My Account
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                    router.push("/login")
                  }}
                  className="py-2.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center text-red-400 font-bold hover:bg-red-950/30"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg bg-zinc-900 text-center text-white col-span-2 hover:bg-zinc-800"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
