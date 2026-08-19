"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface CustomerAddress {
  id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface CustomerOrder {
  id: string
  displayId: string
  createdAt: string
  status: "Pending" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Refunded"
  paymentStatus: "Captured" | "Pending" | "Refunded" | "Failed"
  fulfillmentStatus: "Unfulfilled" | "Fulfilled" | "Partially Fulfilled" | "Returned"
  total: number
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  paymentMethod: string
  courier: string
  awb?: string
  shippingAddress: {
    name: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  items: {
    id: string
    title: string
    variant: string
    sku: string
    quantity: number
    price: number
    thumbnail: string
  }[]
  timeline?: {
    id: string
    time: string
    title: string
    description: string
    user?: string
  }[]
}

export interface CustomerProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  addresses: CustomerAddress[]
  wishlist: string[]
  createdAt: string
}

export interface CustomerContextType {
  customer: CustomerProfile | null
  isAuthenticated: boolean
  isLoaded: boolean
  addresses: CustomerAddress[]
  orders: CustomerOrder[]
  wishlist: string[]
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName?: string
    phone?: string
  }) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (data: {
    firstName?: string
    lastName?: string
    phone?: string
    newPassword?: string
    currentPassword?: string
  }) => Promise<boolean>
  addAddress: (address: Omit<CustomerAddress, "id">) => Promise<CustomerAddress | null>
  updateAddress: (id: string, address: Partial<CustomerAddress>) => Promise<boolean>
  deleteAddress: (id: string) => Promise<boolean>
  setDefaultAddress: (id: string) => Promise<boolean>
  toggleWishlist: (productId: string) => Promise<boolean>
  refreshCustomer: () => Promise<void>
  refreshOrders: () => Promise<void>
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setCustomer(data.customer)
        setAddresses(data.customer?.addresses || [])
        setWishlist(data.customer?.wishlist || [])
        if (data.orders) setOrders(data.orders)
      } else {
        setCustomer(null)
        setAddresses([])
        setOrders([])
        setWishlist([])
      }
    } catch (err) {
      console.warn("Failed to fetch customer session:", err)
      setCustomer(null)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.warn("Failed to fetch orders:", err)
    }
  }, [])

  // Check authentication session on mount
  useEffect(() => {
    refreshCustomer()
  }, [refreshCustomer])

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Invalid email or password")
    }

    const data = await res.json()
    setCustomer(data.customer)
    setAddresses(data.customer?.addresses || [])
    setWishlist(data.customer?.wishlist || [])
    await refreshOrders()

    if (data.customer?.id && typeof window !== "undefined") {
      import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
        AnalyticsHub.login(data.customer.id, "email")
      })
    }
    return true
  }

  const register = async (regData: {
    email: string
    password: string
    firstName: string
    lastName?: string
    phone?: string
  }): Promise<boolean> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Registration failed")
    }

    const data = await res.json()
    setCustomer(data.customer)
    setAddresses(data.customer?.addresses || [])
    setWishlist(data.customer?.wishlist || [])

    if (data.customer?.id && typeof window !== "undefined") {
      import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
        AnalyticsHub.signup(data.customer.id, "email")
      })
    }
    return true
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {}
    setCustomer(null)
    setAddresses([])
    setOrders([])
    setWishlist([])
  }

  const updateProfile = async (data: {
    firstName?: string
    lastName?: string
    phone?: string
    newPassword?: string
    currentPassword?: string
  }): Promise<boolean> => {
    const res = await fetch("/api/customer/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to update profile")
    }

    const resData = await res.json()
    setCustomer(resData.customer)
    return true
  }

  const addAddress = async (newAddr: Omit<CustomerAddress, "id">): Promise<CustomerAddress | null> => {
    const res = await fetch("/api/customer/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddr),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to add address")
    }

    const resData = await res.json()
    setAddresses(resData.addresses || [])
    return resData.address
  }

  const updateAddress = async (id: string, updated: Partial<CustomerAddress>): Promise<boolean> => {
    const res = await fetch(`/api/customer/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to update address")
    }

    const resData = await res.json()
    setAddresses(resData.addresses || [])
    return true
  }

  const deleteAddress = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/customer/addresses/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to delete address")
    }

    const resData = await res.json()
    setAddresses(resData.addresses || [])
    return true
  }

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    return updateAddress(id, { isDefault: true })
  }

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    const res = await fetch("/api/customer/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })

    if (!res.ok) return false

    const data = await res.json()
    setWishlist(data.wishlist || [])
    return data.isSaved
  }

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoaded,
        addresses,
        orders,
        wishlist,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        toggleWishlist,
        refreshCustomer,
        refreshOrders,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider")
  }
  return context
}
