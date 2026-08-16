"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Search, User, Menu, X, Heart } from "@/components/ui/Icons"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      {/* Announcement Bar */}
      <div className="bg-accent text-white text-xs py-1.5 px-4 text-center font-medium tracking-wider uppercase">
        ⚡ FREE EXPRESS SHIPPING ON ALL PREPAID ORDERS OVER ₹1,999 | CRAFTED IN INDIA
      </div>

      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-foreground p-2 -ml-2"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter uppercase font-display">
            ADIKT<span className="text-accent">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link href="/shop" className="hover:text-accent transition-colors">
              Shop All
            </Link>
            <Link href="/shop?category=tees" className="hover:text-accent transition-colors">
              Heavyweight Tees
            </Link>
            <Link href="/shop?category=hoodies" className="hover:text-accent transition-colors">
              Hoodies & Sweats
            </Link>
            <Link href="/shop?category=cargos" className="hover:text-accent transition-colors">
              Parachute Cargos
            </Link>
            <Link href="/about" className="hover:text-accent transition-colors">
              The Craft
            </Link>
          </nav>
        </div>

        {/* Actions (Search, Account, Wishlist, Bag) */}
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-foreground/80 hover:text-foreground p-2" aria-label="Search catalog">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/account" className="text-foreground/80 hover:text-foreground p-2 hidden sm:block" aria-label="Customer account">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/account?tab=wishlist" className="text-foreground/80 hover:text-foreground p-2 hidden sm:block" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="relative text-foreground/80 hover:text-foreground p-2" aria-label="Shopping bag">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-accent text-[10px] font-bold text-white h-4 w-4 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium hover:text-accent"
          >
            Shop All
          </Link>
          <Link
            href="/shop?category=tees"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium hover:text-accent"
          >
            Heavyweight Tees (240-280 GSM)
          </Link>
          <Link
            href="/shop?category=hoodies"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium hover:text-accent"
          >
            French Terry Hoodies (400 GSM)
          </Link>
          <Link
            href="/shop?category=cargos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium hover:text-accent"
          >
            Parachute & Utility Cargos
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium hover:text-accent"
          >
            About ADIKT Craft
          </Link>
          <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
            <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)}>Support & FAQ</Link>
          </div>
        </div>
      )}
    </header>
  )
}
