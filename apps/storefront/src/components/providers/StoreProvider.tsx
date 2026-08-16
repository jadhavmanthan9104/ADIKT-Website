"use client"

import React from "react"
import { CartProvider } from "./CartContext"
import { CustomerProvider } from "./CustomerContext"
import { WishlistProvider } from "./WishlistContext"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </WishlistProvider>
    </CustomerProvider>
  )
}
