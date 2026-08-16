"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/formatters"
import { useCart } from "@/components/providers/CartContext"
import { useCustomer } from "@/components/providers/CustomerContext"
import { ShieldCheck, CreditCard, Banknote, ArrowLeft, Truck } from "@/components/ui/Icons"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, discount, shipping, total, clearCart } = useCart()
  const { customer, addresses } = useCustomer()

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]

  const [formData, setFormData] = useState({
    email: customer?.email || "aditya.sharma@example.com",
    phone: customer?.phone || "9876543210",
    firstName: customer?.firstName || "Aditya",
    lastName: customer?.lastName || "Sharma",
    addressLine1: defaultAddr?.addressLine1 || "B-402, Highline Residences, Linking Road",
    addressLine2: defaultAddr?.addressLine2 || "Bandra West",
    city: defaultAddr?.city || "Mumbai",
    state: defaultAddr?.state || "Maharashtra",
    pincode: defaultAddr?.pincode || "400050",
  })

  const [shippingMethod, setShippingMethod] = useState<"express" | "standard">("express")
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay")
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsProcessing(true)
    setTimeout(() => {
      clearCart()
      router.push(`/checkout/success?orderId=ADKT-${Math.floor(10000 + Math.random() * 90000)}&mode=${paymentMethod}`)
    }, 1500)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black uppercase text-white">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-zinc-400">Add garments to your bag before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-white text-black font-extrabold uppercase rounded-lg text-xs"
        >
          Explore Drops
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Shopping Bag
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Checkout Form Steps (7 cols) */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Contact Info */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">1</span>
                Contact Information
              </h2>
              <span className="text-[11px] text-zinc-400">For SMS delivery updates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
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
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
                {errors.phone && <p className="text-[10px] text-accent mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">2</span>
              Shipping Address (Pan-India)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
                {errors.firstName && <p className="text-[10px] text-accent mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400">Street Address / Flat / Building *</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
                {errors.addressLine1 && <p className="text-[10px] text-accent mt-1">{errors.addressLine1}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400">Locality / Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">6-Digit PIN Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
                {errors.pincode && <p className="text-[10px] text-accent mt-1">{errors.pincode}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
                {errors.city && <p className="text-[10px] text-accent mt-1">{errors.city}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400">State / Union Territory *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
                {errors.state && <p className="text-[10px] text-accent mt-1">{errors.state}</p>}
              </div>
            </div>
          </div>

          {/* Step 3: Shipping Method */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">3</span>
              Delivery Logistics Partner
            </h2>

            <div className="space-y-2">
              <label
                onClick={() => setShippingMethod("express")}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  shippingMethod === "express"
                    ? "border-accent bg-accent/10"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="text-accent"
                  />
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-accent" /> Bluedart & Delhivery Air Express (2-3 Days)
                    </p>
                    <p className="text-[11px] text-zinc-400">Priority fulfillment with real-time SMS tracking</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-white">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </label>
            </div>
          </div>

          {/* Step 4: Payment Method */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">4</span>
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* Razorpay Online */}
              <label
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === "razorpay"
                    ? "border-accent bg-accent/10"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="text-accent"
                  />
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-accent" /> Razorpay Secure Online
                    </p>
                    <p className="text-[11px] text-zinc-400">UPI (GPay / PhonePe / Paytm), Credit/Debit Cards, Netbanking</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase">
                  Fastest Dispatch
                </span>
              </label>

              {/* Cash On Delivery */}
              <label
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === "cod"
                    ? "border-accent bg-accent/10"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-accent"
                  />
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-zinc-400" /> Cash On Delivery (COD)
                    </p>
                    <p className="text-[11px] text-zinc-400">Pay cash upon parcel delivery at your doorstep</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50 shadow-xl shadow-white/5"
          >
            {isProcessing ? "Processing Secure Order..." : `Place Order — ${formatPrice(total)}`}
          </button>
        </form>

        {/* Right: Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Items in Order ({items.length})
            </h3>

            <div className="divide-y divide-zinc-800 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-[11px] text-zinc-400">
                      {item.size} / {item.color} (Qty: {item.quantity})
                    </p>
                  </div>
                  <span className="font-bold text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-zinc-800 pt-4 text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="text-white font-medium">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white border-t border-zinc-800 pt-3">
                <span>Total Due</span>
                <span className="text-base font-black">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-2">
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
              <span>Razorpay 256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
