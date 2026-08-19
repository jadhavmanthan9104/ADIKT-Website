"use client"

import React from "react"
import { CartProvider } from "./CartContext"
import { CustomerProvider } from "./CustomerContext"
import { WishlistProvider } from "./WishlistContext"
import { ThemeProvider } from "./ThemeProvider"
import { ContentProvider } from "./ContentContext"
import { AdminContentItem } from "@/lib/content-store"

export function StoreProvider({
  children,
  initialContent,
}: {
  children: React.ReactNode
  initialContent?: AdminContentItem
}) {
  return (
    <ThemeProvider>
      <ContentProvider initialContent={initialContent}>
        <CustomerProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </CustomerProvider>
      </ContentProvider>
    </ThemeProvider>
  )
}
