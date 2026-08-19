"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { StoreProduct, getProducts } from "@/lib/store-api"
import { CartContext } from "./CartContext"
import { CustomerContext } from "./CustomerContext"

export interface WishlistItem extends StoreProduct {
  selectedSize?: string
  selectedColor?: string
  isAvailable?: boolean
  isDeleted?: boolean
}

export interface WishlistContextType {
  wishlistIds: string[]
  wishlistItems: WishlistItem[]
  isInWishlist: (id: string) => boolean
  toggleWishlist: (product: StoreProduct, size?: string, color?: string) => void
  removeFromWishlist: (id: string) => void
  moveToCart: (product: WishlistItem, size?: string, color?: string) => boolean
  clearWishlist: () => void
  wishlistCount: number
  refreshAvailability: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const cartContext = useContext(CartContext)
  const customerContext = useContext(CustomerContext)
  const addToCart = cartContext?.addToCart
  const customer = customerContext?.customer
  const isAuthenticated = customerContext?.isAuthenticated || false

  // Load from local storage and sync with server API if customer logged in
  useEffect(() => {
    const loadWishlist = async () => {
      let items: WishlistItem[] = []
      try {
        const saved = localStorage.getItem("adikt_wishlist")
        if (saved) {
          items = JSON.parse(saved)
        }
      } catch (e) {
        // ignore
      }

      if (isAuthenticated && customer) {
        try {
          const res = await fetch("/api/customer/wishlist")
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data.wishlist)) {
              const allProducts = await getProducts()
              const mergedProducts: WishlistItem[] = []

              for (const pid of data.wishlist) {
                const found = allProducts.find((p) => p.id === pid || p.handle === pid)
                if (found) {
                  mergedProducts.push({
                    ...found,
                    isAvailable: found.sizes ? found.sizes.some((s) => s.inStock) : true,
                    isDeleted: false,
                  })
                } else {
                  // Retain from existing localStorage cache if product was custom created
                  const existing = items.find((i) => i.id === pid || i.handle === pid)
                  if (existing) {
                    mergedProducts.push({
                      ...existing,
                      isAvailable: existing.sizes ? existing.sizes.some((s) => s.inStock) : true,
                      isDeleted: false,
                    })
                  }
                }
              }

              if (mergedProducts.length > 0) {
                items = mergedProducts
              }
            }
          }
        } catch (e) {
          console.warn("Failed to sync customer wishlist:", e)
        }
      }

      setWishlistItems(items)
      setIsInitialized(true)
    }

    loadWishlist()
  }, [isAuthenticated, customer])

  // Sync to local storage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("adikt_wishlist", JSON.stringify(wishlistItems))
      } catch (e) {
        // ignore
      }
    }
  }, [wishlistItems, isInitialized])

  const refreshAvailability = useCallback(async () => {
    try {
      const allProducts = await getProducts()
      if (allProducts && allProducts.length > 0) {
        setWishlistItems((prev) =>
          prev.map((item) => {
            const live = allProducts.find(
              (p) => p.id === item.id || p.handle === item.handle || (item.title && p.title.toLowerCase() === item.title.toLowerCase())
            )
            if (live) {
              return {
                ...live,
                selectedSize: item.selectedSize || live.sizes?.find((s) => s.inStock)?.size || "L",
                selectedColor: item.selectedColor || live.colors?.[0]?.name || "Vintage Black",
                isDeleted: false,
                isAvailable: live.sizes ? live.sizes.some((s) => s.inStock) : true,
              }
            }
            // Keep the custom product alive and active
            return {
              ...item,
              isDeleted: false,
              isAvailable: item.isAvailable ?? true,
            }
          })
        )
      }
    } catch (err) {
      console.warn("Could not refresh wishlist availability:", err)
    }
  }, [])

  const wishlistIds = wishlistItems.map((item) => item.id)

  const isInWishlist = (id: string) => wishlistIds.includes(id)

  const toggleWishlist = async (product: StoreProduct, size?: string, color?: string) => {
    const isAlreadySaved = wishlistItems.some(
      (item) => item.id === product.id || item.handle === product.handle
    )

    if (isAlreadySaved) {
      if (typeof window !== "undefined") {
        import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
          AnalyticsHub.wishlistRemove({
            id: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
          })
        })
      }
    } else {
      if (typeof window !== "undefined") {
        import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
          AnalyticsHub.wishlistAdd({
            id: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
          })
        })
      }
    }

    setWishlistItems((prev) => {
      if (isAlreadySaved) {
        return prev.filter((item) => item.id !== product.id && item.handle !== product.handle)
      }
      const newItem: WishlistItem = {
        ...product,
        selectedSize: size || product.sizes?.find((s) => s.inStock)?.size || product.sizes?.[0]?.size || "L",
        selectedColor: color || product.colors?.[0]?.name || "Vintage Black",
        isAvailable: product.sizes ? product.sizes.some((s) => s.inStock) : true,
        isDeleted: false,
      }
      return [...prev, newItem]
    })

    // Sync with API if authenticated
    if (isAuthenticated) {
      try {
        await fetch("/api/customer/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        })
      } catch (err) {
        console.warn("Could not sync wishlist toggle with account:", err)
      }
    }
  }

  const removeFromWishlist = async (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id))

    if (isAuthenticated) {
      try {
        await fetch("/api/customer/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id }),
        })
      } catch (err) {
        console.warn("Could not sync wishlist removal with account:", err)
      }
    }
  }

  const moveToCart = (product: WishlistItem, size?: string, color?: string): boolean => {
    const finalSize = size || product.selectedSize || product.sizes.find((s) => s.inStock)?.size || "L"
    const finalColor = color || product.selectedColor || product.colors[0]?.name || "Vintage Black"

    // Check if variant is available
    const sizeObj = product.sizes?.find((s) => s.size === finalSize)
    if (sizeObj && !sizeObj.inStock) {
      return false
    }

    if (addToCart) {
      addToCart({
        id: product.id,
        productId: product.id,
        title: product.title,
        price: product.price,
        size: finalSize,
        color: finalColor,
        thumbnail: product.images[0] || "",
      } as any)
    }

    removeFromWishlist(product.id)
    return true
  }

  const clearWishlist = () => {
    setWishlistItems([])
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        clearWishlist,
        wishlistCount: wishlistItems.length,
        refreshAvailability,
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
