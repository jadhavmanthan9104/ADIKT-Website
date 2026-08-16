"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, Search, User, Menu, X, Heart } from "@/components/ui/Icons"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { useCart } from "@/components/providers/CartContext"
import { useWishlist } from "@/components/providers/WishlistContext"
import { useCustomer } from "@/components/providers/CustomerContext"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const router = useRouter()
  const { openDrawer, itemCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { isAuthenticated } = useCustomer()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      {/* Announcement Bar */}
      <div className="bg-accent text-white text-[11px] py-1.5 px-4 text-center font-bold tracking-wider uppercase">
        ⚡ FREE EXPRESS SHIPPING ON ORDERS OVER ₹1,999 | CRAFTED IN INDIA WITH 280-400 GSM FABRICS
      </div>

      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-white p-2 -ml-2 hover:text-accent"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <BrandLogo size="md" href="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <Link href="/shop" className="hover:text-white transition-colors">
              All Drops
            </Link>
            <Link href="/shop?category=tees" className="hover:text-white transition-colors">
              Heavyweight Tees
            </Link>
            <Link href="/shop?category=hoodies" className="hover:text-white transition-colors">
              French Terry Hoodies
            </Link>
            <Link href="/shop?category=cargos" className="hover:text-white transition-colors">
              Parachute Cargos
            </Link>
            <Link href="/collections/core-heavyweight" className="hover:text-white transition-colors">
              Core Series
            </Link>
            <Link href="/about" className="hover:text-white transition-colors text-zinc-400">
              The Craft
            </Link>
          </nav>
        </div>

        {/* Action Icons (Search, Account, Wishlist, Bag) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-zinc-300 hover:text-white p-2"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Customer Account */}
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            className="text-zinc-300 hover:text-white p-2 hidden sm:block"
            aria-label="Customer Account"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Wishlist Counter */}
          <Link
            href="/account/wishlist"
            className="relative text-zinc-300 hover:text-white p-2 hidden sm:block"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-zinc-800 text-[10px] font-bold text-white h-4 w-4 rounded-full flex items-center justify-center border border-zinc-700">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag & Quick Drawer Opener */}
          <button
            onClick={openDrawer}
            className="relative text-zinc-300 hover:text-white p-2"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-accent text-[10px] font-bold text-white h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
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
        <div className="lg:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold uppercase text-white hover:text-accent"
          >
            All Drops
          </Link>
          <Link
            href="/shop?category=tees"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
          >
            Heavyweight Tees (280 GSM)
          </Link>
          <Link
            href="/shop?category=hoodies"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
          >
            French Terry Hoodies (400 GSM)
          </Link>
          <Link
            href="/shop?category=cargos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
          >
            Parachute & Utility Cargos
          </Link>
          <Link
            href="/collections/core-heavyweight"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
          >
            Core Heavyweight Series
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-zinc-400 hover:text-white"
          >
            About ADIKT Craft
          </Link>

          <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2 text-xs font-bold uppercase">
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg bg-zinc-900 text-center text-white"
            >
              {isAuthenticated ? "My Account" : "Sign In"}
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg bg-zinc-900 text-center text-white"
            >
              Wishlist ({wishlistCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
