"use client"

import React, { useState } from "react"
import { Package, User, MapPin, Truck, ExternalLink } from "@/components/ui/Icons"
import { formatPrice, formatDate } from "@/lib/formatters"

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders")

  const orders = [
    {
      id: "ADKT-10488",
      date: "2026-08-10T14:30:00Z",
      status: "Delivered",
      total: 3499,
      awb: "14328901234",
      courier: "Delhivery Express",
      items: [
        {
          title: "400 GSM French Terry Drop-Shoulder Hoodie",
          variant: "L / Olive",
          price: 3499,
          quantity: 1,
        },
      ],
    },
    {
      id: "ADKT-10390",
      date: "2026-07-28T11:20:00Z",
      status: "Delivered",
      total: 1999,
      awb: "18923019283",
      courier: "Bluedart Surface",
      items: [
        {
          title: "280 GSM Boxy Heavyweight Tee",
          variant: "L / Vintage Black",
          price: 1999,
          quantity: 1,
        },
      ],
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display">
            Customer Portal
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Logged in as aditya.sharma@example.com</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
            activeTab === "orders"
              ? "border-accent text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Package className="h-4 w-4" /> My Orders & Tracking
        </button>
        <button
          onClick={() => setActiveTab("addresses")}
          className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
            activeTab === "addresses"
              ? "border-accent text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <MapPin className="h-4 w-4" /> Saved Addresses
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
            activeTab === "profile"
              ? "border-accent text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <User className="h-4 w-4" /> Profile Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800 text-xs">
                <div>
                  <span className="font-bold text-white text-sm mr-3">Order #{order.id}</span>
                  <span className="text-zinc-400">{formatDate(order.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                    {order.status}
                  </span>
                  <span className="font-bold text-white text-sm">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-zinc-300">
                    <span>
                      {item.title} <span className="text-zinc-500">({item.variant})</span>
                    </span>
                    <span>{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              {/* Shiprocket Tracking Info */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent" />
                  <span>
                    Courier: <strong className="text-white">{order.courier}</strong> (AWB: {order.awb})
                  </span>
                </div>
                <button className="text-accent hover:underline inline-flex items-center gap-1 font-semibold">
                  Track Live Delivery <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "addresses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Default Shipping Address</span>
              <span className="bg-accent/20 text-accent px-2 py-0.5 rounded text-[10px] font-bold">PRIMARY</span>
            </div>
            <p className="text-white font-medium">Aditya Sharma (+91 9876543210)</p>
            <p className="text-zinc-400">B-402, Highline Residences, Linking Road</p>
            <p className="text-zinc-400">Bandra West, Mumbai, Maharashtra - 400050</p>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="max-w-xl p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Account Details</h3>
          <div className="space-y-1">
            <span className="text-zinc-500">Full Name</span>
            <p className="text-white font-semibold">Aditya Sharma</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Email</span>
            <p className="text-white font-semibold">aditya.sharma@example.com</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Phone</span>
            <p className="text-white font-semibold">+91 98765 43210</p>
          </div>
        </div>
      )}
    </div>
  )
}
