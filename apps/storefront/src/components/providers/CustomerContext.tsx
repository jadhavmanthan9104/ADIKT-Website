"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

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
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled"
  total: number
  paymentMode: string
  courier: string
  awb: string
  estimatedDelivery: string
  shippingAddress: CustomerAddress
  items: {
    title: string
    variant: string
    quantity: number
    price: number
    thumbnail: string
  }[]
}

export interface CustomerProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
}

export interface CustomerContextType {
  customer: CustomerProfile | null
  isAuthenticated: boolean
  isLoaded: boolean
  addresses: CustomerAddress[]
  orders: CustomerOrder[]
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<CustomerProfile>) => Promise<boolean>
  addAddress: (address: Omit<CustomerAddress, "id">) => void
  updateAddress: (id: string, address: Partial<CustomerAddress>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
}

const DEFAULT_DEMO_CUSTOMER: CustomerProfile = {
  id: "cus_01JADIKT0928374",
  email: "aditya.sharma@example.com",
  firstName: "Aditya",
  lastName: "Sharma",
  phone: "+91 98765 43210",
}

const INITIAL_ADDRESSES: CustomerAddress[] = [
  {
    id: "addr_1",
    name: "Aditya Sharma",
    phone: "+91 98765 43210",
    addressLine1: "B-402, Highline Residences, Linking Road",
    addressLine2: "Near Turner Road Junction, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    isDefault: true,
  },
  {
    id: "addr_2",
    name: "Aditya Sharma (Office)",
    phone: "+91 98765 43210",
    addressLine1: "WeWork Oberoi Commerz II, International Business Park",
    addressLine2: "Goregaon East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400063",
    isDefault: false,
  },
]

const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: "order_10492",
    displayId: "ADKT-10492",
    createdAt: "2026-08-16T14:30:00Z",
    status: "Processing",
    total: 4948,
    paymentMode: "Razorpay Online (Prepaid)",
    courier: "Delhivery Express",
    awb: "14328909871",
    estimatedDelivery: "Aug 19, 2026",
    shippingAddress: INITIAL_ADDRESSES[0],
    items: [
      {
        title: "280 GSM Boxy Heavyweight Tee",
        variant: "L / Vintage Black",
        quantity: 1,
        price: 1999,
        thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      },
      {
        title: "400 GSM French Terry Drop-Shoulder Hoodie",
        variant: "XL / Olive",
        quantity: 1,
        price: 3499,
        thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "order_10388",
    displayId: "ADKT-10388",
    createdAt: "2026-08-02T10:15:00Z",
    status: "Delivered",
    total: 2999,
    paymentMode: "Razorpay Online (Prepaid)",
    courier: "Bluedart Surface",
    awb: "18923019283",
    estimatedDelivery: "Aug 05, 2026",
    shippingAddress: INITIAL_ADDRESSES[0],
    items: [
      {
        title: "Multi-Pocket Parachute Utility Cargo Pants",
        variant: "L / Charcoal",
        quantity: 1,
        price: 2999,
        thumbnail: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
]

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [addresses, setAddresses] = useState<CustomerAddress[]>(INITIAL_ADDRESSES)
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("adikt_customer_session")
      if (stored) {
        setCustomer(JSON.parse(stored))
      } else {
        // Default initial session for demo experience
        setCustomer(DEFAULT_DEMO_CUSTOMER)
        localStorage.setItem("adikt_customer_session", JSON.stringify(DEFAULT_DEMO_CUSTOMER))
      }
    } catch (e) {
      setCustomer(DEFAULT_DEMO_CUSTOMER)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const login = async (email: string): Promise<boolean> => {
    const profile: CustomerProfile = {
      ...DEFAULT_DEMO_CUSTOMER,
      email: email.trim(),
      firstName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
    }
    setCustomer(profile)
    try {
      localStorage.setItem("adikt_customer_session", JSON.stringify(profile))
    } catch (e) {
      // ignore
    }
    return true
  }

  const logout = () => {
    setCustomer(null)
    try {
      localStorage.removeItem("adikt_customer_session")
    } catch (e) {
      // ignore
    }
  }

  const updateProfile = async (data: Partial<CustomerProfile>): Promise<boolean> => {
    if (customer) {
      const updated = { ...customer, ...data }
      setCustomer(updated)
      try {
        localStorage.setItem("adikt_customer_session", JSON.stringify(updated))
      } catch (e) {
        // ignore
      }
    }
    return true
  }

  const addAddress = (newAddr: Omit<CustomerAddress, "id">) => {
    const created: CustomerAddress = {
      ...newAddr,
      id: `addr_${Date.now()}`,
    }
    setAddresses((prev) => [...prev, created])
  }

  const updateAddress = (id: string, updated: Partial<CustomerAddress>) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, ...updated } : addr))
    )
  }

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id))
  }

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    )
  }

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoaded,
        addresses,
        orders,
        login,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
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
