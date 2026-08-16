"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { StoreProduct } from "@/lib/store-api"

export interface WishlistContextType {
  wishlistIds: string[]
  wishlistItems: StoreProduct[]
  isInWishlist: (id: string) => boolean
  toggleWishlist: (product: StoreProduct) => void
  removeFromWishlist: (id: string) => void
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<StoreProduct[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adikt_wishlist")
      if (saved) {
        setWishlistItems(JSON.parse(saved))
      }
    } catch (e) {
      // ignore
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("adikt_wishlist", JSON.stringify(wishlistItems))
      } catch (e) {
        // ignore
      }
    }
  }, [wishlistItems, isInitialized])

  const wishlistIds = wishlistItems.map((item) => item.id)

  const isInWishlist = (id: string) => wishlistIds.includes(id)

  const toggleWishlist = (product: StoreProduct) => {
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        wishlistCount: wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
