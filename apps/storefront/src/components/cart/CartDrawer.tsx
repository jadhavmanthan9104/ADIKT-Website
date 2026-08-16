"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/providers/CartContext"
import { formatPrice } from "@/lib/formatters"
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "@/components/ui/Icons"
import { FreeShippingBar } from "./FreeShippingBar"

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    subtotal,
    discount,
    total,
    itemCount,
    updateQuantity,
    removeItem,
  } = useCart()

  if (!isDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 text-white flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" />
              <h2 className="text-base font-bold uppercase tracking-wider">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <FreeShippingBar />

            {items.length > 0 ? (
              <div className="divide-y divide-zinc-800/80">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 items-center">
                    <div className="relative aspect-[3/4] w-16 sm:w-20 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        {item.size} • {item.color}
                      </p>
                      <p className="text-xs font-bold text-white">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <div className="inline-flex items-center border border-zinc-800 rounded bg-zinc-900">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-zinc-400 hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-[11px] font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-zinc-400 hover:text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-500 hover:text-accent p-1"
                          aria-label="Delete item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm font-semibold text-zinc-400">Your bag is empty</p>
                <button
                  onClick={closeDrawer}
                  className="text-xs font-bold uppercase text-accent underline"
                >
                  Explore Current Drop
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-900/40 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Discount (WELCOME10)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Estimated Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="py-3 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white text-center font-bold text-xs uppercase"
                >
                  View Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="py-3 rounded-lg bg-white hover:bg-zinc-200 text-black text-center font-black text-xs uppercase flex items-center justify-center gap-1.5"
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
