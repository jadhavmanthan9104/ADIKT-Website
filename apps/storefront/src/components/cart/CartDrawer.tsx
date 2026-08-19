"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/providers/CartContext"
import { formatPrice } from "@/lib/formatters"
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "@/components/ui/Icons"
import { FreeShippingBar } from "@/components/cart/FreeShippingBar"

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    tax,
    total,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    lastAddedId,
  } = useCart()

  // Track item IDs currently undergoing deletion animation
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const handleDeleteItem = (id: string) => {
    if (deletingIds.has(id)) return
    // 1. Mark as deleting to trigger smooth height/padding collapse + slide-out
    setDeletingIds((prev) => new Set(prev).add(id))

    // 2. Remove from actual state after animation completes
    setTimeout(() => {
      removeItem(id)
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 280)
  }

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDrawerOpen, closeDrawer])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDrawerOpen])

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
        isDrawerOpen
          ? "opacity-100 pointer-events-auto visible"
          : "opacity-0 pointer-events-none invisible delay-300"
      }`}
    >
      {/* Smooth Fade In/Out Backdrop */}
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Slide-In / Slide-Out Panel from Right */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div
          className={`w-screen max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white flex flex-col shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#9A0000]" />
              <h2 className="text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <FreeShippingBar />

            {items.length > 0 ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {items.map((item) => {
                  const isJustAdded = lastAddedId === item.id
                  const isDeleting = deletingIds.has(item.id)

                  return (
                    <div
                      key={item.id}
                      style={{
                        maxHeight: isDeleting ? "0px" : "180px",
                        opacity: isDeleting ? 0 : 1,
                        transform: isDeleting ? "translateX(40px) scale(0.92)" : "translateX(0) scale(1)",
                        paddingTop: isDeleting ? "0px" : "1rem",
                        paddingBottom: isDeleting ? "0px" : "1rem",
                        marginTop: isDeleting ? "0px" : undefined,
                        marginBottom: isDeleting ? "0px" : undefined,
                      }}
                      className={`px-2.5 -mx-2.5 rounded-xl flex gap-4 items-center transition-all duration-300 ease-in-out overflow-hidden ${
                        isJustAdded
                          ? "bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 shadow-sm scale-[1.01] ring-1 ring-red-400/40 dark:ring-red-500/20"
                          : "hover:bg-zinc-100/70 dark:hover:bg-zinc-900/40"
                      }`}
                    >
                      <div className="relative aspect-[3/4] w-16 sm:w-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {item.size} • {item.color}
                      </p>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <div className="inline-flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-xs">
                          <button
                            onClick={() => {
                              if (item.quantity <= 1) {
                                handleDeleteItem(item.id)
                              } else {
                                updateQuantity(item.id, -1)
                              }
                            }}
                            className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-[11px] font-bold text-zinc-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={isDeleting}
                          className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-all active:scale-90"
                          aria-label="Delete item"
                        >
                          <Trash2 className={`h-3.5 w-3.5 ${isDeleting ? "text-red-500 animate-spin" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Your bag is empty</p>
                <button
                  onClick={closeDrawer}
                  className="text-xs font-bold uppercase text-[#9A0000] underline hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Explore Current Drop
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 dark:text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#9A0000]">
                    <span>Discount (WELCOME10)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST / Tax</span>
                  <span className="text-zinc-900 dark:text-white font-medium">
                    {tax > 0 ? `+${formatPrice(tax)}` : "Included in MRP"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-zinc-900 dark:text-white font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Estimated Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white text-center font-bold text-xs uppercase transition-colors"
                >
                  View Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="cart-checkout-btn py-3 rounded-xl bg-[#9A0000] hover:bg-[#7a0000] text-white text-center font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-[#9A0000]/25"
                >
                  Checkout <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
