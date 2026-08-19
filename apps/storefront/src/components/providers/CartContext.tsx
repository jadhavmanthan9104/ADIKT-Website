"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

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
  isGstIncluded?: boolean
  gstType?: "percentage" | "amount"
  gstRate?: number
}

export interface CartContextType {
  cartId: string
  items: CartItem[]
  isDrawerOpen: boolean
  lastAddedId: string | null
  isCartBouncing: boolean
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  itemCount: number
  promoCode: string
  promoMessage: string | null
  isFreeShipping: boolean
  shippingThreshold: number
  expressDeliveryFee: number
  standardDeliveryFee: number
  refreshShippingConfig: () => Promise<void>
  openDrawer: () => void
  closeDrawer: () => void
  addToCart: (
    item: Omit<CartItem, "id">,
    openDrawer?: boolean,
    startCoords?: { x: number; y: number }
  ) => void
  updateQuantity: (id: string, delta: number) => void
  removeItem: (id: string) => void
  applyPromoCode: (code: string) => Promise<boolean>
  removePromoCode: () => void
  clearCart: () => void
  trackAbandonedCart: (email: string, name?: string, phone?: string, consent?: boolean) => Promise<void>
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const [isCartBouncing, setIsCartBouncing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoMessage, setPromoMessage] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [isFreeShipping, setIsFreeShipping] = useState<boolean>(false)
  const [shippingThreshold, setShippingThreshold] = useState<number>(1999)
  const [standardDeliveryFee, setStandardDeliveryFee] = useState<number>(49)
  const [expressDeliveryFee, setExpressDeliveryFee] = useState<number>(99)
  const [isInitialized, setIsInitialized] = useState(false)
  const [cartId, setCartId] = useState<string>("")

  // Fetch dynamic shipping config from admin dashboard
  const refreshShippingConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/shipping/config")
      if (res.ok) {
        const data = await res.json()
        if (data?.config) {
          if (typeof data.config.freeShippingThreshold === "number") {
            setShippingThreshold(data.config.freeShippingThreshold)
          }
          if (typeof data.config.standardDeliveryFee === "number") {
            setStandardDeliveryFee(data.config.standardDeliveryFee)
          }
          if (typeof data.config.expressDeliveryFee === "number") {
            setExpressDeliveryFee(data.config.expressDeliveryFee)
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load shipping configuration:", err)
    }
  }, [])

  // Sync shipping config on mount and listen to updates
  useEffect(() => {
    refreshShippingConfig()
    const handleUpdate = () => {
      refreshShippingConfig()
    }
    window.addEventListener("shipping-config-updated", handleUpdate)
    window.addEventListener("focus", handleUpdate)
    return () => {
      window.removeEventListener("shipping-config-updated", handleUpdate)
      window.removeEventListener("focus", handleUpdate)
    }
  }, [refreshShippingConfig])

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adikt_cart")
      if (saved) {
        setItems(JSON.parse(saved))
      }
      let existingCartId = localStorage.getItem("adikt_cart_id")
      if (!existingCartId) {
        existingCartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        localStorage.setItem("adikt_cart_id", existingCartId)
      }
      setCartId(existingCartId)
    } catch (e) {
      // ignore
    }
    setIsInitialized(true)
  }, [])

  // Sync cart contents to local storage and clear any stale holds when empty.
  useEffect(() => {
    if (!isInitialized) return

    try {
      localStorage.setItem("adikt_cart", JSON.stringify(items))
    } catch (e) {
      // ignore
    }

    if (!cartId) return

    if (items.length === 0) {
      fetch("/api/inventory/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId }),
      }).catch(() => {})
    }

    // Check for stored customer session token in cookies or localStorage and auto-sync abandoned cart
    try {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.customer?.email && items.length > 0) {
            const customer = data.customer
            const name = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Shopper"
            trackAbandonedCart(customer.email, name, customer.phone, true)
          }
        })
        .catch(() => {})
    } catch {}
  }, [items, cartId, isInitialized])

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // Re-validate active promo code when subtotal / items change
  const revalidatePromo = useCallback(
    async (code: string) => {
      if (!code) return
      try {
        const res = await fetch("/api/discounts/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            subtotal,
            items,
          }),
        })
        const data = await res.json()
        if (data.valid) {
          setDiscountAmount(data.discountAmount || 0)
          setIsFreeShipping(Boolean(data.isFreeShipping))
        } else {
          setDiscountAmount(0)
          setIsFreeShipping(false)
          setPromoMessage(`❌ ${data.error || "Coupon conditions no longer met."}`)
        }
      } catch (err) {
        console.warn("Failed to revalidate promo code:", err)
      }
    },
    [subtotal, items]
  )

  useEffect(() => {
    if (promoCode && isInitialized) {
      revalidatePromo(promoCode)
    }
  }, [subtotal, items.length, promoCode, isInitialized, revalidatePromo])

  // Calculate total extra GST / Tax for items where GST is NOT included in retail pricing
  const tax = items.reduce((acc, item) => {
    if (item.isGstIncluded === false && item.gstRate && item.gstRate > 0) {
      if (item.gstType === "amount") {
        return acc + item.gstRate * item.quantity
      } else {
        return acc + Math.round(((item.price * item.gstRate) / 100) * item.quantity)
      }
    }
    return acc
  }, 0)

  const shipping =
    isFreeShipping || subtotal >= shippingThreshold || items.length === 0
      ? 0
      : expressDeliveryFee
  const total = Math.max(0, subtotal - discountAmount + tax + shipping)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  const addToCart = (
    newItem: Omit<CartItem, "id">,
    openDrawer = true,
    startCoords?: { x: number; y: number }
  ) => {
    // 1. Trigger realistic product flight animation
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("fly-to-cart", {
          detail: {
            thumbnail: newItem.thumbnail,
            startX: startCoords?.x ?? window.innerWidth / 2,
            startY: startCoords?.y ?? window.innerHeight / 2,
          },
        })
      )
    }

    const generatedId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    let targetId = generatedId

    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === newItem.productId &&
          item.size === newItem.size &&
          item.color === newItem.color
      )

      if (existing) {
        targetId = existing.id
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        )
      }

      return [
        ...prev,
        {
          ...newItem,
          id: generatedId,
          quantity: newItem.quantity || 1,
        },
      ]
    })

    setLastAddedId(targetId)

    // Trigger cart impact bounce & drawer slide-in upon flying item arrival (~650ms)
    setTimeout(() => {
      setIsCartBouncing(true)
      setTimeout(() => {
        setIsCartBouncing(false)
      }, 1000)

      if (openDrawer) {
        setIsDrawerOpen(true)
      }
    }, 650)

    if (!openDrawer) {
      setIsDrawerOpen(false)
    }

    setTimeout(() => {
      setLastAddedId((current) => (current === targetId ? null : current))
    }, 3000)

    // Analytics: add_to_cart
    if (typeof window !== "undefined") {
      import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
        AnalyticsHub.addToCart({
          id: newItem.productId,
          title: newItem.title,
          price: newItem.price,
          quantity: newItem.quantity || 1,
          variant: `${newItem.size} / ${newItem.color}`,
          cartValue: subtotal + newItem.price * (newItem.quantity || 1),
        })
      })
    }
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
    const itemToRemove = items.find((i) => i.id === id)
    setItems((prev) => prev.filter((item) => item.id !== id))

    if (itemToRemove && typeof window !== "undefined") {
      import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
        AnalyticsHub.removeFromCart({
          id: itemToRemove.productId,
          title: itemToRemove.title,
          price: itemToRemove.price,
          quantity: itemToRemove.quantity,
          cartValue: Math.max(0, subtotal - itemToRemove.price * itemToRemove.quantity),
        })
      })
    }
  }

  const applyPromoCode = async (code: string): Promise<boolean> => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setPromoMessage("Please enter a valid coupon code.")
      return false
    }

    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmed,
          subtotal,
          items,
        }),
      })

      const data = await res.json()

      if (!data.valid) {
        setDiscountAmount(0)
        setIsFreeShipping(false)
        setPromoMessage(`❌ ${data.error || "Invalid coupon code."}`)
        return false
      }

      setPromoCode(data.code)
      setDiscountAmount(data.discountAmount || 0)
      setIsFreeShipping(Boolean(data.isFreeShipping))
      setPromoMessage(
        `✅ ${data.code} applied (${
          data.description ||
          (data.discountAmount ? `₹${data.discountAmount.toLocaleString()} OFF` : "Free Shipping")
        })`
      )

      if (typeof window !== "undefined") {
        import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
          AnalyticsHub.couponApply(data.code, data.discountAmount || 0, subtotal)
        })
      }
      return true
    } catch (err) {
      setPromoMessage("❌ Failed to validate coupon code.")
      return false
    }
  }

  const removePromoCode = () => {
    const prevCode = promoCode
    setPromoCode("")
    setDiscountAmount(0)
    setIsFreeShipping(false)
    setPromoMessage(null)

    if (prevCode && typeof window !== "undefined") {
      import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
        AnalyticsHub.couponRemove(prevCode, subtotal)
      })
    }
  }

  const clearCart = () => {
    setItems([])
    setPromoCode("")
    setDiscountAmount(0)
    setIsFreeShipping(false)
    setPromoMessage(null)
  }

  const trackAbandonedCart = async (
    email: string,
    name?: string,
    phone?: string,
    consent: boolean = true
  ) => {
    if (!email || items.length === 0) return
    try {
      await fetch("/api/marketing/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cartId || `cart_${Date.now()}`,
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          marketingConsent: consent,
          cartValue: total,
          items: items.map((i) => ({
            id: i.id,
            productId: i.productId,
            title: i.title,
            size: i.size,
            color: i.color,
            price: i.price,
            quantity: i.quantity,
            thumbnail: i.thumbnail,
          })),
        }),
      })
    } catch (err) {
      console.warn("Failed to track abandoned cart:", err)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartId,
        items,
        isDrawerOpen,
        lastAddedId,
        isCartBouncing,
        subtotal,
        discount: discountAmount,
        tax,
        shipping,
        total,
        itemCount,
        promoCode,
        promoMessage,
        isFreeShipping,
        shippingThreshold,
        expressDeliveryFee,
        standardDeliveryFee,
        refreshShippingConfig,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        applyPromoCode,
        removePromoCode,
        clearCart,
        trackAbandonedCart,
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
