"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/formatters"
import { useCart } from "@/components/providers/CartContext"
import { useCustomer } from "@/components/providers/CustomerContext"
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowLeft,
  Truck,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  Sparkles,
  MapPin,
  RefreshCw,
  X,
} from "@/components/ui/Icons"

export interface PaymentFailureDetails {
  title?: string
  reason?: string
  code?: string
  description?: string
  orderId?: string
  paymentId?: string
  source?: string
  step?: string
  amount?: number
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const {
    cartId,
    items,
    subtotal,
    discount,
    tax,
    shipping,
    total,
    itemCount,
    shippingThreshold,
    refreshShippingConfig,
    promoCode,
    promoMessage,
    applyPromoCode,
    removePromoCode,
    clearCart,
    trackAbandonedCart,
  } = useCart()
  const { customer, addresses } = useCustomer()

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr ? defaultAddr.id : "custom"
  )

  const [formData, setFormData] = useState({
    email: customer?.email || "",
    phone: (defaultAddr?.phone || customer?.phone) || "",
    firstName: defaultAddr?.name ? defaultAddr.name.split(" ")[0] : (customer?.firstName || ""),
    lastName: defaultAddr?.name ? defaultAddr.name.split(" ").slice(1).join(" ") : (customer?.lastName || ""),
    addressLine1: defaultAddr?.addressLine1 || "",
    addressLine2: defaultAddr?.addressLine2 || "",
    city: defaultAddr?.city || "",
    state: defaultAddr?.state || "",
    pincode: defaultAddr?.pincode || "",
  })

  // Real-time abandoned cart tracking on checkout
  useEffect(() => {
    const email = formData.email || customer?.email
    if (email && email.includes("@") && items.length > 0) {
      const name = `${formData.firstName} ${formData.lastName}`.trim() || customer?.firstName || "Shopper"
      const phone = formData.phone || customer?.phone
      trackAbandonedCart(email, name, phone, true)
    }
  }, [formData.email, formData.phone, formData.firstName, formData.lastName, customer, items, total, trackAbandonedCart])

  // Synchronize when customer profile / addresses load asynchronously
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const primary = addresses.find((a) => a.isDefault) || addresses[0]
      if (primary && selectedAddressId !== "custom") {
        setSelectedAddressId(primary.id)
        setFormData((prev) => ({
          email: prev.email || customer?.email || "",
          phone: primary.phone || prev.phone || customer?.phone || "",
          firstName: primary.name ? primary.name.split(" ")[0] : (prev.firstName || customer?.firstName || ""),
          lastName: primary.name ? primary.name.split(" ").slice(1).join(" ") : (prev.lastName || customer?.lastName || ""),
          addressLine1: primary.addressLine1 || "",
          addressLine2: primary.addressLine2 || "",
          city: primary.city || "",
          state: primary.state || "",
          pincode: primary.pincode || "",
        }))
      }
    } else if (customer) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || customer.email || "",
        phone: prev.phone || customer.phone || "",
        firstName: prev.firstName || customer.firstName || "",
        lastName: prev.lastName || customer.lastName || "",
      }))
    }
  }, [customer, addresses])

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id)
    setFormData((prev) => ({
      ...prev,
      phone: addr.phone || prev.phone,
      firstName: addr.name ? addr.name.split(" ")[0] : prev.firstName,
      lastName: addr.name ? addr.name.split(" ").slice(1).join(" ") : prev.lastName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }))
  }

  const handleSelectCustomAddress = () => {
    setSelectedAddressId("custom")
    setFormData((prev) => ({
      ...prev,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    }))
  }

  const [shippingMethod, setShippingMethod] = useState<"express" | "standard">("express")
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay")
  const [paymentConfig, setPaymentConfig] = useState<{
    razorpay?: { enabled: boolean; name?: string; description?: string; badge?: string }
    cod?: { enabled: boolean; name?: string; description?: string; badge?: string; maxAmount?: number }
  }>({
    razorpay: { enabled: true },
    cod: { enabled: true },
  })
  const [isConfigLoading, setIsConfigLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOrderCompleted, setIsOrderCompleted] = useState(false)
  const [completedOrderData, setCompletedOrderData] = useState<{
    orderId: string
    paymentId?: string
    mode?: string
  } | null>(null)

  // Payment Failure Pop-Up Modal State
  const [failureModalData, setFailureModalData] = useState<PaymentFailureDetails | null>(null)
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false)

  // Discount Coupon State
  const [inputCouponCode, setInputCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCouponCode.trim()) return

    setIsApplyingCoupon(true)
    setCouponFeedback(null)

    const success = await applyPromoCode(inputCouponCode.trim())
    setIsApplyingCoupon(false)

    if (success) {
      setCouponFeedback({
        type: "success",
        message: `Coupon ${inputCouponCode.trim().toUpperCase()} applied successfully!`,
      })
      setInputCouponCode("")
    } else {
      setCouponFeedback({
        type: "error",
        message: promoMessage ? promoMessage.replace(/^❌\s*/, "") : "Invalid or expired coupon code.",
      })
    }
  }

  const handleRemoveCoupon = () => {
    removePromoCode()
    setCouponFeedback(null)
    setInputCouponCode("")
  }

  // Prefetch success page and refresh latest shipping rules
  useEffect(() => {
    router.prefetch("/checkout/success")
    refreshShippingConfig()
  }, [router, refreshShippingConfig])

  // Fetch active store payment methods configuration
  useEffect(() => {
    fetch("/api/payments/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setPaymentConfig(data.config)
          const isRazorpayEnabled = data.config.razorpay?.enabled ?? true
          const isCodEnabled = data.config.cod?.enabled ?? true

          if (!isRazorpayEnabled && isCodEnabled) {
            setPaymentMethod("cod")
          } else if (isRazorpayEnabled && !isCodEnabled) {
            setPaymentMethod("razorpay")
          }
        }
      })
      .catch((err) => console.warn("Failed to load payment config for checkout:", err))
      .finally(() => setIsConfigLoading(false))
  }, [])

  // Analytics: begin_checkout
  useEffect(() => {
    if (items.length > 0 && typeof window !== "undefined") {
      import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
        AnalyticsHub.beginCheckout(
          items.map((i) => ({
            item_id: i.productId,
            item_name: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
          total
        )
      })
    }
  }, [])

  // Analytics: add_payment_info
  const handlePaymentMethodChange = (mode: "razorpay" | "cod") => {
    setPaymentMethod(mode)
    if (typeof window !== "undefined") {
      import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
        AnalyticsHub.addPaymentInfo(mode === "razorpay" ? "Razorpay (UPI / Card / NetBanking)" : "Cash on Delivery (COD)", total)
      })
    }
  }
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
  const [isStockReserved, setIsStockReserved] = useState(false)

  // Dynamically load Razorpay SDK
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => setIsRazorpayLoaded(true)
      script.onerror = () => console.warn("Failed to load official Razorpay SDK script")
      document.body.appendChild(script)
    } else {
      setIsRazorpayLoaded(true)
    }
  }, [])

  // Hold inventory only while the customer is actually on checkout.
  useEffect(() => {
    if (items.length === 0 || !cartId) {
      setIsStockReserved(false)
      return
    }

    fetch("/api/inventory/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartId,
        items: items.map((i) => ({
          id: i.id,
          title: i.title,
          handle: i.handle,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
      }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setIsStockReserved(true)
          setErrorMessage(null)
        } else {
          setIsStockReserved(false)
          setErrorMessage(data.error || "Some items in your cart are currently unavailable in the requested quantity.")
        }
      })
      .catch((err) => console.warn("Stock reservation request:", err))
  }, [items, cartId])

  useEffect(() => {
    return () => {
      if (!cartId) return
      fetch("/api/inventory/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId }),
      }).catch(() => {})
    }
  }, [cartId])

  const validateForm = () => {
    const err: Record<string, string> = {}
    if (!formData.email.includes("@")) err.email = "Please enter a valid email address"
    if (formData.phone.length < 10) err.phone = "Enter a valid 10-digit Indian mobile number"
    if (!formData.firstName.trim()) err.firstName = "First name is required"
    if (!formData.addressLine1.trim()) err.addressLine1 = "Street address is required"
    if (formData.pincode.length !== 6) err.pincode = "Enter a valid 6-digit Indian PIN code"
    if (!formData.city.trim()) err.city = "City is required"
    if (!formData.state.trim()) err.state = "State is required"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleOnlinePayment = async () => {
    setIsProcessing(true)
    setErrorMessage(null)
    setStatusMessage("Creating secure Razorpay order...")

    try {
      // 1. Create Razorpay Order on Server
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          cartId: cartId || `cart_${Date.now()}`,
          items,
          customer: {
            email: formData.email,
            phone: formData.phone,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
          },
        }),
      })

      if (!orderRes.ok) {
        const errorData = await orderRes.json()
        throw new Error(errorData.error || "Failed to initialize payment gateway")
      }

      const { order } = await orderRes.json()
      setStatusMessage("Opening secure checkout gateway...")

      // 2. If Razorpay SDK is loaded in browser, open official popup
      if (window.Razorpay && order.keyId && !order.keyId.includes("placeholder")) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "ADIKT Clothing Co.",
          description: `Order for ${itemCount} Heavyweight Garment(s)`,
          image: "/images/logo.png",
          order_id: order.orderId,
          handler: async function (response: any) {
            setStatusMessage("Verifying cryptographic signature...")
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMode: "UPI",
            })
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            contact: formData.phone,
          },
          notes: {
            brand: "ADIKT",
            shipping_pincode: formData.pincode,
          },
          theme: {
            color: "#9A0000",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false)
              setStatusMessage("")
              setErrorMessage("Payment checkout was closed before completing. You can retry anytime.")
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on("payment.failed", function (response: any) {
          setIsProcessing(false)
          setStatusMessage("")
          const err = response?.error || {}
          const failureInfo: PaymentFailureDetails = {
            title: "Payment Authorization Declined",
            reason: err.reason || "Payment declined by issuing bank / UPI gateway",
            description:
              err.description ||
              "Your bank or UPI provider could not authorize the payment. No funds were debited from your account.",
            code: err.code || "PAYMENT_FAILED",
            orderId: err.metadata?.order_id || order.orderId,
            paymentId: err.metadata?.payment_id,
            source: err.source || "bank",
            step: err.step || "payment_authorization",
            amount: total,
          }
          setFailureModalData(failureInfo)
          setIsFailureModalOpen(true)
          setErrorMessage(
            failureInfo.description || "Payment failed at bank / UPI gateway. Please retry or choose Cash on Delivery."
          )
        })
        rzp.open()
      } else {
        // Simulated local development / test fallback
        setStatusMessage("Authorizing test payment & verifying signature...")
        setTimeout(async () => {
          const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
          const mockSignature = `sig_${Date.now()}_valid_hmac`
          await verifyPayment({
            razorpay_order_id: order.orderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
            paymentMode: "UPI",
          })
        }, 1200)
      }
    } catch (err: any) {
      console.error("Online payment initialization error:", err)
      setIsProcessing(false)
      setStatusMessage("")
      const failureInfo: PaymentFailureDetails = {
        title: "Gateway Initialization Error",
        reason: "Unable to establish connection to payment gateway",
        description:
          err.message ||
          "Could not initialize Razorpay checkout. Please check your network connection or choose Cash on Delivery.",
        code: "GATEWAY_INIT_ERROR",
        amount: total,
      }
      setFailureModalData(failureInfo)
      setIsFailureModalOpen(true)
      setErrorMessage(err.message || "Failed to process payment. Please try again.")
    }
  }

  const verifyPayment = async (verificationPayload: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    paymentMode?: "UPI" | "Credit Card" | "Debit Card" | "NetBanking"
  }) => {
    try {
      const verifyRes = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...verificationPayload,
          cart: { id: cartId, items, subtotal, discount, shipping, total },
          customer: {
            email: formData.email,
            phone: formData.phone,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
          },
          shippingAddress: formData,
        }),
      })

      if (!verifyRes.ok) {
        const errData = await verifyRes.json()
        throw new Error(errData.error || "Cryptographic signature verification failed")
      }

      const data = await verifyRes.json()

      if (typeof window !== "undefined") {
        import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
          AnalyticsHub.purchase({
            orderId: data.orderId,
            transactionId: data.paymentId,
            value: total,
            paymentMethod: "Razorpay (Online)",
            items: items.map((i) => ({
              item_id: i.productId,
              item_name: i.title,
              price: i.price,
              quantity: i.quantity,
            })),
            tax: 0,
            shipping: shipping || 0,
          })
        })
      }

      setIsOrderCompleted(true)
      setCompletedOrderData({
        orderId: data.orderId,
        paymentId: data.paymentId,
        mode: "razorpay",
      })
      setStatusMessage("Payment verified! Opening your order confirmation...")
      clearCart()
      router.push(
        `/checkout/success?orderId=${data.orderId}&paymentId=${data.paymentId}&mode=razorpay&amount=${total}`
      )
    } catch (err: any) {
      setIsProcessing(false)
      setStatusMessage("")
      const failureInfo: PaymentFailureDetails = {
        title: "Payment Verification Failed",
        reason: "Cryptographic signature mismatch or transaction validation failure",
        description:
          err.message ||
          "We could not verify the payment transaction. If your account was debited, your bank will automatically process a refund within 24-48 hours.",
        code: "VERIFICATION_FAILED",
        orderId: verificationPayload.razorpay_order_id,
        paymentId: verificationPayload.razorpay_payment_id,
        amount: total,
      }
      setFailureModalData(failureInfo)
      setIsFailureModalOpen(true)
      setErrorMessage(err.message || "Payment verification failed. Please contact customer support.")
    }
  }

  const handleCodPayment = async () => {
    setIsProcessing(true)
    setErrorMessage(null)
    setStatusMessage("Validating Cash on Delivery serviceability...")

    try {
      const codRes = await fetch("/api/payments/cod/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: { id: cartId, items, subtotal, discount, shipping, total },
          customer: {
            email: formData.email,
            phone: formData.phone,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
          },
          shippingAddress: formData,
        }),
      })

      if (!codRes.ok) {
        const errorData = await codRes.json()
        throw new Error(errorData.error || "Failed to create Cash on Delivery order")
      }

      const data = await codRes.json()

      if (typeof window !== "undefined") {
        import("@/lib/analytics/analytics-hub").then(({ AnalyticsHub }) => {
          AnalyticsHub.purchase({
            orderId: data.orderId,
            transactionId: data.paymentId,
            value: total,
            paymentMethod: "Cash on Delivery (COD)",
            items: items.map((i) => ({
              item_id: i.productId,
              item_name: i.title,
              price: i.price,
              quantity: i.quantity,
            })),
            tax: 0,
            shipping: shipping || 0,
          })
        })
      }

      setIsOrderCompleted(true)
      setCompletedOrderData({
        orderId: data.orderId,
        paymentId: data.paymentId,
        mode: "cod",
      })
      setStatusMessage("Order placed! Opening your order confirmation...")
      clearCart()
      router.push(
        `/checkout/success?orderId=${data.orderId}&paymentId=${data.paymentId}&mode=cod&amount=${total}`
      )
    } catch (err: any) {
      setIsProcessing(false)
      setStatusMessage("")
      const failureInfo: PaymentFailureDetails = {
        title: "Cash on Delivery Order Error",
        reason: "Unable to confirm Cash on Delivery order",
        description:
          err.message ||
          "Failed to place Cash on Delivery order. Please review your address details or choose another payment method.",
        code: "COD_ORDER_FAILED",
        amount: total,
      }
      setFailureModalData(failureInfo)
      setIsFailureModalOpen(true)
      setErrorMessage(err.message || "Failed to create Cash on Delivery order")
    }
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (paymentMethod === "razorpay") {
      handleOnlinePayment()
    } else {
      handleCodPayment()
    }
  }

  // Instant luxury confirmation screen during page routing
  if (isOrderCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6 animate-in fade-in duration-200">
        <div className="relative inline-flex items-center justify-center mx-auto animate-success-pop">
          <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-2xl animate-success-glow pointer-events-none" />
          <div className="relative p-3.5 sm:p-4 rounded-full bg-emerald-950/80 border border-emerald-500/40 shadow-2xl shadow-emerald-950/80 backdrop-blur-md">
            <svg
              className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="26"
                cy="26"
                r="24"
                className="stroke-emerald-500/20"
                strokeWidth="2.5"
              />
              <circle
                cx="26"
                cy="26"
                r="24"
                className="stroke-emerald-400 animate-success-circle"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M15 27.5L22.5 35L37 19"
                className="stroke-emerald-400 animate-success-check"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Order Confirmed & Payment Verified
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Securing Order #{completedOrderData?.orderId || "..."}
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Your transaction has been cryptographically authenticated. Opening your order summary and receipt...
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-[#9A0000]" />
          <span>Finalizing Order Receipt...</span>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-2xl font-bold uppercase text-white">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-zinc-400">Add heavyweight garments from our collection before proceeding.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 rounded-xl bg-[#9A0000] hover:bg-[#7a0000] text-white font-black text-xs uppercase shadow-lg shadow-[#9A0000]/30"
        >
          Explore Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Shopping Bag
        </Link>

        {isStockReserved && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 text-[11px] font-bold shadow-xs animate-in fade-in duration-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Active Checkout Session: {itemCount} garment(s) held in inventory</span>
          </div>
        )}
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/80 dark:border-red-800 dark:text-red-200 text-xs flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold">Inventory / Payment Notice</p>
            <p className="text-red-700 dark:text-red-300/90 font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-white text-xs uppercase font-bold transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Checkout Form Steps (7 cols) */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Contact Info */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-black">1</span>
                Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => {
                    if (formData.email && formData.email.includes("@") && items.length > 0) {
                      trackAbandonedCart(
                        formData.email,
                        `${formData.firstName} ${formData.lastName}`.trim() || "Shopper",
                        formData.phone,
                        true
                      )
                    }
                  }}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
                {errors.email && <p className="text-[10px] text-accent mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Mobile Phone (10 Digits) *</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                  onBlur={() => {
                    if (formData.email && items.length > 0) {
                      trackAbandonedCart(
                        formData.email,
                        `${formData.firstName} ${formData.lastName}`.trim() || "Shopper",
                        formData.phone,
                        true
                      )
                    }
                  }}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
                {errors.phone && <p className="text-[10px] text-accent mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-black">2</span>
                Shipping Address (Pan-India)
              </h2>
              {addresses.length > 0 && (
                <span className="text-[11px] text-accent font-semibold">
                  {addresses.length} Saved Address{addresses.length > 1 ? "es" : ""}
                </span>
              )}
            </div>

            {/* Saved Address Cards */}
            {addresses.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Select a saved destination:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 relative ${
                          isSelected
                            ? "bg-red-50/80 border-[#9A0000] ring-1 ring-[#9A0000]/40 shadow-sm dark:bg-[#9A0000]/15 dark:border-[#9A0000] dark:ring-[#9A0000]/50"
                            : "bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#9A0000]" /> {addr.name}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold uppercase bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-transparent px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed line-clamp-2 font-normal">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-medium">📞 {addr.phone}</p>
                      </div>
                    )
                  })}

                  {/* Option for New / Custom Address */}
                  <div
                    onClick={handleSelectCustomAddress}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-center text-center ${
                      selectedAddressId === "custom"
                        ? "bg-red-50/80 border-[#9A0000] text-zinc-900 dark:text-white font-bold ring-1 ring-[#9A0000]/40 dark:bg-[#9A0000]/15 dark:border-[#9A0000]"
                        : "bg-zinc-50/50 hover:bg-white border-dashed border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:bg-zinc-900/30 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-semibold">
                      + Enter a different address
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-medium text-zinc-400">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                />
                {errors.firstName && <p className="text-[10px] text-accent mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Verma"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400">Street Address / Flat / Building *</label>
                <input
                  type="text"
                  required
                  placeholder="Flat No, Wing, Building Name, Street"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                />
                {errors.addressLine1 && <p className="text-[10px] text-accent mt-1">{errors.addressLine1}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400">Locality / Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Near landmark or area"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">6-Digit PIN Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 400050"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                />
                {errors.pincode && <p className="text-[10px] text-accent mt-1">{errors.pincode}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                />
                {errors.city && <p className="text-[10px] text-accent mt-1">{errors.city}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400">State / Union Territory *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                />
                {errors.state && <p className="text-[10px] text-accent mt-1">{errors.state}</p>}
              </div>
            </div>
          </div>

          {/* Step 3: Shipping Method */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-black">3</span>
              SHIPPING METHOD
            </h2>

            <div className="space-y-2">
              <label
                onClick={() => setShippingMethod("express")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === "express"
                    ? "bg-red-50/80 border-[#9A0000] ring-1 ring-[#9A0000]/40 shadow-sm dark:bg-[#9A0000]/15 dark:border-[#9A0000] dark:ring-[#9A0000]/50"
                    : "bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="text-[#9A0000] accent-[#9A0000]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[#9A0000]" /> Shipping
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </label>
            </div>
          </div>

          {/* Step 4: Payment Method */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-black">4</span>
                Payment Method
              </h2>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Lock className="h-3 w-3" /> 256-Bit SSL Encrypted
              </span>
            </div>

            <div className="space-y-3">
              {/* Razorpay Online */}
              {paymentConfig.razorpay?.enabled !== false && (
                <label
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "razorpay"
                      ? "bg-red-50/80 border-[#9A0000] ring-1 ring-[#9A0000]/40 shadow-md dark:bg-[#9A0000]/15 dark:border-[#9A0000] dark:ring-[#9A0000]/50"
                      : "bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="text-[#9A0000] accent-[#9A0000]"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-[#9A0000]" /> Razorpay Secure Online
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-normal">
                        UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, Wallets
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Prepaid
                  </span>
                </label>
              )}

              {/* Cash On Delivery */}
              {paymentConfig.cod?.enabled !== false && (
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "bg-red-50/80 border-[#9A0000] ring-1 ring-[#9A0000]/40 shadow-md dark:bg-[#9A0000]/15 dark:border-[#9A0000] dark:ring-[#9A0000]/50"
                      : "bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="text-[#9A0000] accent-[#9A0000]"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <Banknote className="h-4 w-4 text-[#9A0000]" /> Cash On Delivery (COD)
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-normal">
                        Pay cash upon delivery at your doorstep
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Doorstep Cash
                  </span>
                </label>
              )}

              {/* No Payment Methods Available Notice */}
              {paymentConfig.razorpay?.enabled === false && paymentConfig.cod?.enabled === false && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    <AlertCircle className="h-4 w-4" /> Payment Options Temporarily Unavailable
                  </p>
                  <p className="text-zinc-400 text-[11px]">
                    The store administrator has currently paused online and COD checkouts for routine maintenance. Please try again shortly or contact customer support.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={isProcessing || (paymentConfig.razorpay?.enabled === false && paymentConfig.cod?.enabled === false)}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 shadow-xl ${
              paymentMethod === "razorpay"
                ? "btn-razorpay-cta bg-[#005BD1] hover:bg-[#004bb0] text-white shadow-[#005BD1]/25"
                : "btn-cod-cta bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black shadow-black/10 dark:shadow-white/5"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className={`h-4 w-4 animate-spin ${paymentMethod === "razorpay" ? "text-white" : "text-white dark:text-black"}`} />
                <span>{statusMessage || "Processing Secure Checkout..."}</span>
              </>
            ) : paymentConfig.razorpay?.enabled === false && paymentConfig.cod?.enabled === false ? (
              "Checkout Temporarily Unavailable"
            ) : paymentMethod === "razorpay" && paymentConfig.razorpay?.enabled !== false ? (
              `Pay Now with Razorpay — ${formatPrice(total)}`
            ) : (
              `Place Cash on Delivery Order — ${formatPrice(total)}`
            )}
          </button>
        </form>

        {/* Right: Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                ORDER ({itemCount})
              </h3>
            </div>

            <div className="divide-y divide-zinc-800 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Small Product Thumbnail */}
                    {item.thumbnail ? (
                      <div className="relative h-12 w-10 sm:h-14 sm:w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800">
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-10 sm:h-14 sm:w-11 shrink-0 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 text-[10px]">
                        ADKT
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-zinc-400">
                        {item.size} / {item.color} <span className="text-zinc-500">•</span> Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-white shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount Coupon Code Section */}
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                Discount Coupon Code
              </label>

              {promoCode ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-700 text-white dark:bg-emerald-900/60 dark:border dark:border-emerald-700/60 text-[11px]">
                      {promoCode}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-zinc-400 hover:text-red-400 uppercase tracking-wider transition-colors ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={inputCouponCode}
                      onChange={(e) => {
                        setInputCouponCode(e.target.value)
                        if (couponFeedback) setCouponFeedback(null)
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase placeholder:text-zinc-600 focus:outline-none focus:border-accent tracking-wider font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !inputCouponCode.trim()}
                    className="px-4 py-2.5 bg-[#9A0000] hover:bg-[#7a0000] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 shrink-0 flex items-center justify-center min-w-[70px] shadow-sm"
                  >
                    {isApplyingCoupon ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </form>
              )}

              {couponFeedback && (
                <p
                  className={`text-[11px] leading-tight ${
                    couponFeedback.type === "success" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {couponFeedback.message}
                </p>
              )}
            </div>

            <div className="space-y-2 text-xs border-t border-zinc-800 pt-4 text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>Coupon Discount {promoCode ? `(${promoCode})` : ""}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST / Tax</span>
                <span className="text-white font-medium">
                  {tax > 0 ? `+${formatPrice(tax)}` : "Included in MRP"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-white font-medium">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white border-t border-zinc-800 pt-3">
                <span>Total Due</span>
                <span className="text-base font-black text-accent">{formatPrice(total)}</span>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Payment Failure Pop-Up Modal */}
      {isFailureModalOpen && failureModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-red-900/60 p-6 sm:p-8 shadow-2xl shadow-red-950/40 text-center space-y-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Red ambient glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-600/20 blur-3xl pointer-events-none rounded-full" />

            {/* Close button */}
            <button
              onClick={() => setIsFailureModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-900 transition-colors"
              aria-label="Close failure modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Warning Icon */}
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-red-950/90 border border-red-500/50 text-red-400 shadow-xl">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-[11px] font-extrabold uppercase tracking-widest text-red-400">
                <span>Transaction Declined</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
                {failureModalData.title || "Payment Failed"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                {failureModalData.description ||
                  "Your payment could not be authorized by your bank or UPI provider."}
              </p>
            </div>

            {/* Financial Safety Guarantee Notice */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-300 leading-snug">
                <strong className="text-white">Zero Charge Guarantee:</strong> If funds were deducted from your account, Razorpay & your bank will automatically process a full reversal within 24–48 hours.
              </p>
            </div>

            {/* Transaction Metadata Snapshot */}
            {(failureModalData.orderId || failureModalData.code || failureModalData.paymentId) && (
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-left grid grid-cols-2 gap-2 text-[11px]">
                {failureModalData.orderId && (
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Order Ref</span>
                    <span className="font-mono text-zinc-300 font-semibold truncate block">
                      {failureModalData.orderId}
                    </span>
                  </div>
                )}
                {failureModalData.code && (
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Gateway Reason</span>
                    <span className="font-mono text-red-400 font-bold truncate block">
                      {failureModalData.code}
                    </span>
                  </div>
                )}
                {failureModalData.amount && (
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Attempted Amount</span>
                    <span className="text-white font-bold block">
                      {formatPrice(failureModalData.amount)}
                    </span>
                  </div>
                )}
                {failureModalData.paymentId && (
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Payment ID</span>
                    <span className="font-mono text-zinc-300 font-semibold truncate block">
                      {failureModalData.paymentId}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  setIsFailureModalOpen(false)
                  setPaymentMethod("razorpay")
                  handleOnlinePayment()
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#9A0000] hover:bg-[#7a0000] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#9A0000]/30 active:scale-[0.99] transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry Online Payment</span>
              </button>

              {paymentConfig.cod?.enabled !== false && (
                <button
                  onClick={() => {
                    setIsFailureModalOpen(false)
                    setPaymentMethod("cod")
                    setTimeout(() => {
                      handleCodPayment()
                    }, 100)
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Banknote className="h-4 w-4 text-amber-400" />
                  <span>Switch to Cash on Delivery (COD)</span>
                </button>
              )}

              <button
                onClick={() => setIsFailureModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white underline font-medium pt-1 block mx-auto transition-colors"
              >
                Review Shipping & Payment Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
