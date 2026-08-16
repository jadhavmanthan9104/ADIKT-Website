"use client"

import React, { useState } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/formatters"
import { ShieldCheck, CreditCard, Banknote, ArrowLeft, CheckCircle2 } from "@/components/ui/Icons"

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    email: "customer@example.com",
    firstName: "Aditya",
    lastName: "Sharma",
    address: "B-402, Highline Residences, Linking Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    phone: "9876543210",
  })

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const items = [
    {
      title: "280 GSM Boxy Heavyweight Tee",
      variant: "L / Vintage Black",
      price: 1999,
      quantity: 1,
    },
    {
      title: "400 GSM French Terry Drop-Shoulder Hoodie",
      variant: "XL / Olive",
      price: 3499,
      quantity: 1,
    },
  ]

  const subtotal = 5498
  const discount = 550 // WELCOME10
  const shipping = 0 // Free
  const total = subtotal - discount + shipping

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setOrderComplete(true)
    }, 1500)
  }

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display">
          Order Confirmed!
        </h1>
        <p className="text-sm text-zinc-400">
          Thank you for choosing ADIKT. Order <span className="text-white font-bold">#ADKT-10492</span> has been placed successfully. A confirmation email and SMS with live tracking details will be sent shortly.
        </p>
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-3 text-sm">
          <div className="flex justify-between font-bold text-white">
            <span>Payment Mode:</span>
            <span>{paymentMethod === "razorpay" ? "Razorpay Online (Prepaid)" : "Cash On Delivery (COD)"}</span>
          </div>
          <div className="flex justify-between font-bold text-white">
            <span>Total Paid:</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Delivery To:</span>
            <span>{formData.firstName} {formData.lastName}, {formData.city}</span>
          </div>
        </div>
        <Link
          href="/"
          className="inline-block px-8 py-3.5 bg-white text-black font-bold uppercase rounded-lg text-xs"
        >
          Return to Storefront
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
        {/* Left: Checkout Form (7 cols) */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
          {/* 1. Contact Information */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              1. Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400">Mobile Number (for updates & OTP)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              2. Shipping Address (India)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400">Street Address / Flat / Building</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              3. Payment Method
            </h2>

            <div className="space-y-3">
              {/* Razorpay Online */}
              <label
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
                    className="text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-accent" /> Razorpay Secure Online
                    </p>
                    <p className="text-xs text-zinc-400">UPI (GPay/PhonePe), Cards, Netbanking, Cred</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase">
                  Fastest Dispatch
                </span>
              </label>

              {/* Cash On Delivery (COD) */}
              <label
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
                    className="text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-zinc-400" /> Cash On Delivery (COD)
                    </p>
                    <p className="text-xs text-zinc-400">Pay cash upon parcel delivery</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
          >
            {isProcessing
              ? "Securing Payment & Placing Order..."
              : `Complete Order — ${formatPrice(total)}`}
          </button>
        </form>

        {/* Right: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Items in Order ({items.length})
            </h3>

            <div className="divide-y divide-zinc-800">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-xs text-zinc-400">{item.variant} (Qty: {item.quantity})</p>
                  </div>
                  <span className="font-bold text-white">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-zinc-800 pt-4 text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-accent">
                <span>Discount (WELCOME10)</span>
                <span>-{formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="text-white">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800 pt-3">
                <span>Total Due</span>
                <span className="text-base">{formatPrice(total)}</span>
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
