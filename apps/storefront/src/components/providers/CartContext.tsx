"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
  id: string
  productId: string
  title: string
  handle: string
  variantTitle: string
  size: string
  color: string
  price: number
  originalPrice?: number
  quantity: number
  thumbnail: string
}

export interface CartContextType {
  items: CartItem[]
  isDrawerOpen: boolean
  subtotal: number
  discount: number
  shipping: number
  total: number
  itemCount: number
  promoCode: string
  promoMessage: string | null
  shippingThreshold: number
  openDrawer: () => void
  closeDrawer: () => void
  addToCart: (item: Omit<CartItem, "id">) => void
  updateQuantity: (id: string, delta: number) => void
  removeItem: (id: string) => void
  applyPromoCode: (code: string) => boolean
  removePromoCode: () => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const INITIAL_ITEMS: CartItem[] = [
  {
    id: "item_1",
    productId: "prod_1",
    title: "280 GSM Boxy Heavyweight Tee",
    handle: "boxy-heavyweight-tee-vintage-black",
    variantTitle: "L / Vintage Black",
    size: "L",
    color: "Vintage Black",
    price: 1999,
    originalPrice: 2499,
    quantity: 1,
    thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  },
]

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [promoCode, setPromoCode] = useState("WELCOME10")
  const [promoMessage, setPromoMessage] = useState<string | null>("WELCOME10 Applied (10% OFF)")
  const [isInitialized, setIsInitialized] = useState(false)

  const shippingThreshold = 1999

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adikt_cart")
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      // ignore
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("adikt_cart", JSON.stringify(items))
      } catch (e) {
        // ignore
      }
    }
  }, [items, isInitialized])

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const discount = promoCode.toUpperCase() === "WELCOME10" ? Math.round(subtotal * 0.1) : 0
  const shipping = subtotal >= shippingThreshold || items.length === 0 ? 0 : 150
  const total = Math.max(0, subtotal - discount + shipping)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.size === newItem.size &&
          i.color === newItem.color
      )
      if (existingIdx > -1) {
        const updated = [...prev]
        updated[existingIdx].quantity += newItem.quantity
        return updated
      }
      return [
        ...prev,
        {
          ...newItem,
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        },
      ]
    })
    setIsDrawerOpen(true)
  }

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const applyPromoCode = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed === "WELCOME10") {
      setPromoCode("WELCOME10")
      setPromoMessage("✅ WELCOME10 applied (10% OFF)")
      return true
    } else if (trimmed === "ADIKT20") {
      setPromoCode("ADIKT20")
      setPromoMessage("✅ ADIKT20 applied (20% OFF)")
      return true
    } else {
      setPromoMessage("❌ Invalid coupon code. Try WELCOME10")
      return false
    }
  }

  const removePromoCode = () => {
    setPromoCode("")
    setPromoMessage(null)
  }

  const clearCart = () => {
    setItems([])
    setPromoCode("")
    setPromoMessage(null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        subtotal,
        discount,
        shipping,
        total,
        itemCount,
        promoCode,
        promoMessage,
        shippingThreshold,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        applyPromoCode,
        removePromoCode,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
