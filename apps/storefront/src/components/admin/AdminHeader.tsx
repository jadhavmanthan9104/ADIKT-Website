"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Search, Bell, ExternalLink, ShieldCheck, User, Sparkles, Check } from "lucide-react"
import { AdminThemeToggle } from "./AdminThemeToggle"

export function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New order #ADKT-10492 received (₹4,948)", time: "10m ago", read: false },
    { id: 2, text: "Low stock warning: 280 GSM Tee (XL / Vintage Black: 3 left)", time: "1h ago", read: false },
    { id: 3, text: "Return requested for Order #ADKT-10388", time: "3h ago", read: true },
  ])

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search orders, products, customers, SKUs (⌘K)..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Environment Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Medusa v2 Live
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent animate-ping" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  Notifications ({unreadCount})
                </span>
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-accent hover:underline font-semibold"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs space-y-1 ${
                      n.read ? "bg-zinc-950/50 text-zinc-400" : "bg-zinc-800/80 text-white font-medium border border-zinc-700/50"
                    }`}
                  >
                    <p className="leading-snug">{n.text}</p>
                    <span className="text-[10px] text-zinc-500">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Theme Toggle (Independent from Storefront) */}
        <AdminThemeToggle />

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-accent">
            AD
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-white leading-none">Admin Lead</p>
            <p className="text-[10px] text-zinc-400 leading-none mt-1">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
