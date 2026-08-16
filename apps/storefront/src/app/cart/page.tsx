"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/formatters"
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from "@/components/ui/Icons"

export default function CartPage() {
  const [items, setItems] = useState([
    {
      id: "item_1",
      title: "280 GSM Boxy Heavyweight Tee",
      variantTitle: "L / Vintage Black",
      price: 1999,
      quantity: 1,
      thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "item_2",
      title: "400 GSM French Terry Drop-Shoulder Hoodie",
      variantTitle: "XL / Olive",
      price: 3499,
      quantity: 1,
      thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    },
  ])

  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState<string | null>(null)

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shippingThreshold = 1999
  const shipping = subtotal >= shippingThreshold ? 0 : 150
  const total = Math.max(0, subtotal - discount + shipping)

  const handleUpdateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as typeof items
    )
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      const discountVal = Math.round(subtotal * 0.1)
      setDiscount(discountVal)
      setPromoMessage(`✅ WELCOME10 applied: 10% OFF (-₹${discountVal})`)
    } else {
      setPromoMessage("❌ Invalid coupon code. Try WELCOME10")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display">
        Your Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
      </h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free shipping progress */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-300">
                <span>
                  {subtotal >= shippingThreshold
                    ? "🎉 You have unlocked Free Express Shipping!"
                    : `Add ₹${shippingThreshold - subtotal} more for Free Shipping`}
                </span>
                <span>{Math.min(100, Math.round((subtotal / shippingThreshold) * 100))}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-zinc-800 border-y border-zinc-800">
              {items.map((item) => (
                <div key={item.id} className="py-6 flex gap-4 sm:gap-6 items-center">
                  <div className="relative aspect-[3/4] w-20 sm:w-24 overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400">{item.variantTitle}</p>
                    <p className="text-sm font-bold text-white sm:hidden">{formatPrice(item.price)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-4 pt-2">
                      <div className="inline-flex items-center border border-zinc-800 rounded-lg bg-zinc-900">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="p-1.5 text-zinc-400 hover:text-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="p-1.5 text-zinc-400 hover:text-white"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleUpdateQty(item.id, -item.quantity)}
                        className="text-zinc-500 hover:text-accent transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:block text-right">
                    <p className="text-base font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-zinc-500">₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-white">
                Order Summary
              </h2>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Discount code (WELCOME10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs uppercase text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold uppercase"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && <p className="text-xs text-zinc-300">{promoMessage}</p>}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm border-t border-zinc-800 pt-4">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Estimated Shipping</span>
                  <span className="text-white font-medium">
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>GST / Taxes</span>
                  <span className="text-white font-medium">Included</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white border-t border-zinc-800 pt-3">
                  <span>Total Amount</span>
                  <span className="text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Proceed to Checkout */}
              <Link
                href="/checkout"
                className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-zinc-400" />
                <span>256-bit SSL Encrypted & Razorpay Verified</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 space-y-6">
          <p className="text-xl font-bold text-white">Your shopping bag is empty</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase rounded-lg text-xs"
          >
            Explore Heavyweight Drops <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
