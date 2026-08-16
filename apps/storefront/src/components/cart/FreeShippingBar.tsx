"use client"

import React from "react"
import { useCart } from "@/components/providers/CartContext"
import { formatPrice } from "@/lib/formatters"

export function FreeShippingBar() {
  const { subtotal, shippingThreshold } = useCart()
  const isUnlocked = subtotal >= shippingThreshold
  const percentage = Math.min(100, Math.round((subtotal / shippingThreshold) * 100))
  const remaining = shippingThreshold - subtotal

  return (
    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
      <div className="flex justify-between font-semibold">
        <span className={isUnlocked ? "text-green-400 font-bold" : "text-zinc-300"}>
          {isUnlocked
            ? "⚡ FREE EXPRESS SHIPPING UNLOCKED"
            : `Add ${formatPrice(remaining)} more for Free Express Delivery`}
        </span>
        <span className="text-zinc-400">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isUnlocked ? "bg-green-500" : "bg-accent"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
