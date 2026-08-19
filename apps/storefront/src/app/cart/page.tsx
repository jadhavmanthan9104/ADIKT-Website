"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/formatters"
import { useCart } from "@/components/providers/CartContext"
import { FreeShippingBar } from "@/components/cart/FreeShippingBar"
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from "@/components/ui/Icons"
import { EmptyState } from "@/components/ui/EmptyState"

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    tax,
    shipping,
    total,
    itemCount,
    promoCode,
    promoMessage,
    updateQuantity,
    removeItem,
    applyPromoCode,
    removePromoCode,
  } = useCart()

  const [inputCode, setInputCode] = useState("")
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const handleDeleteItem = (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id))
    setTimeout(() => {
      removeItem(id)
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 320)
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputCode.trim()) {
      applyPromoCode(inputCode.trim())
      setInputCode("")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Review Bag</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Your Shopping Bag ({itemCount})
          </h1>
        </div>
        <Link href="/shop" className="text-xs font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1">
          Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Line Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <FreeShippingBar />

            <div className="divide-y divide-zinc-800 border-y border-zinc-800">
              {items.map((item) => {
                const isDeleting = deletingIds.has(item.id)

                return (
                  <div
                    key={item.id}
                    style={{
                      maxHeight: isDeleting ? "0px" : "200px",
                      opacity: isDeleting ? 0 : 1,
                      transform: isDeleting ? "translateX(40px) scale(0.95)" : "translateX(0) scale(1)",
                      paddingTop: isDeleting ? "0px" : "1.5rem",
                      paddingBottom: isDeleting ? "0px" : "1.5rem",
                      marginTop: isDeleting ? "0px" : undefined,
                      marginBottom: isDeleting ? "0px" : undefined,
                    }}
                    className="flex gap-4 sm:gap-6 items-center transition-all duration-300 ease-in-out overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.handle}`}
                      className="relative aspect-[3/4] w-20 sm:w-24 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shrink-0"
                    >
                      <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link href={`/products/${item.handle}`}>
                        <h3 className="text-sm sm:text-base font-bold text-white hover:text-accent transition-colors truncate">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-zinc-400">
                        Size: <strong className="text-white">{item.size}</strong> • Color:{" "}
                        <strong className="text-white">{item.color}</strong>
                      </p>
                      <p className="text-sm font-bold text-white sm:hidden">{formatPrice(item.price)}</p>

                      {/* Quantity & Delete Controls */}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="inline-flex items-center border border-zinc-800 rounded-lg bg-zinc-900">
                          <button
                            onClick={() => {
                              if (item.quantity <= 1) {
                                handleDeleteItem(item.id)
                              } else {
                                updateQuantity(item.id, -1)
                              }
                            }}
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={isDeleting}
                          className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all active:scale-90"
                          aria-label="Remove item"
                        >
                          <Trash2 className={`h-4 w-4 ${isDeleting ? "text-red-500 animate-spin" : ""}`} />
                        </button>
                      </div>
                    </div>

                  {/* Desktop Price */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-base font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-zinc-500">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              )
            })}
            </div>
          </div>

          {/* Right: Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Order Summary
              </h2>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Coupon (WELCOME10)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs uppercase text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#9A0000] hover:bg-[#7a0000] text-white rounded-lg text-xs font-bold uppercase shrink-0 transition-colors shadow-sm"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span>{promoMessage}</span>
                    {promoCode && (
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-[10px] text-zinc-500 hover:text-accent underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm border-t border-zinc-800 pt-4">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent font-semibold">
                    <span>Coupon Discount</span>
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
                  <span>GST / Tax</span>
                  <span className="text-white font-medium">
                    {tax > 0 ? `+${formatPrice(tax)}` : "Included in MRP"}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white border-t border-zinc-800 pt-3">
                  <span>Total Amount</span>
                  <span className="text-lg font-black">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full py-4 rounded-xl bg-[#9A0000] hover:bg-[#7a0000] text-white font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-xl shadow-[#9A0000]/25"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-zinc-400" />
                <span>256-Bit SSL Encrypted & Razorpay Verified</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Your Shopping Bag is Empty"
          description="Explore our latest 280-400 GSM heavyweight drops, hoodies, and parachute cargos."
          actionLabel="Explore New Drops"
          actionHref="/shop"
        />
      )}
    </div>
  )
}
