"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCustomer } from "@/components/providers/CustomerContext"
import { useWishlist } from "@/components/providers/WishlistContext"
import { Package, User, MapPin, Heart, ArrowRight, Truck } from "@/components/ui/Icons"
import { formatPrice, formatDate } from "@/lib/formatters"
import { EmptyState } from "@/components/ui/EmptyState"

export default function AccountDashboardPage() {
  const router = useRouter()
  const { customer, orders, addresses, logout, isLoaded } = useCustomer()
  const { wishlistCount } = useWishlist()

  const handleSignOut = async () => {
    await logout()
    router.push("/login")
  }

  if (isLoaded && !customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <EmptyState
          icon={<User className="h-12 w-12 text-zinc-600" />}
          title="You Are Signed Out"
          description="Sign in to your account to view your order history, track shipments, and manage saved delivery addresses."
          actionLabel="Sign In To Account"
          actionHref="/login"
        />
      </div>
    )
  }

  const recentOrder = orders[0]
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Member</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Welcome Back, {customer?.firstName || "Customer"}
          </h1>
          <p className="text-xs text-zinc-400">{customer?.email}</p>
        </div>

        <button
          onClick={handleSignOut}
          className="self-start sm:self-auto px-4 py-2 bg-zinc-900 hover:bg-red-950/40 hover:border-red-800/60 border border-zinc-800 text-xs font-bold uppercase rounded-lg text-zinc-300 hover:text-red-400 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/account/orders"
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2 group"
        >
          <div className="p-2.5 rounded-xl bg-zinc-950 w-fit text-accent">
            <Package className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white group-hover:text-accent transition-colors">
            My Orders
          </h3>
          <p className="text-xs text-zinc-400">{orders.length} orders recorded</p>
        </Link>

        <Link
          href="/account/addresses"
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2 group"
        >
          <div className="p-2.5 rounded-xl bg-zinc-950 w-fit text-accent">
            <MapPin className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white group-hover:text-accent transition-colors">
            Addresses
          </h3>
          <p className="text-xs text-zinc-400">{addresses.length} saved addresses</p>
        </Link>

        <Link
          href="/account/wishlist"
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2 group"
        >
          <div className="p-2.5 rounded-xl bg-zinc-950 w-fit text-accent">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white group-hover:text-accent transition-colors">
            Saved Wishlist
          </h3>
          <p className="text-xs text-zinc-400">{wishlistCount} saved silhouettes</p>
        </Link>

        <Link
          href="/account/profile"
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2 group"
        >
          <div className="p-2.5 rounded-xl bg-zinc-950 w-fit text-accent">
            <User className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white group-hover:text-accent transition-colors">
            Profile Settings
          </h3>
          <p className="text-xs text-zinc-400">Manage login & security</p>
        </Link>
      </div>

      {/* Grid: Latest Order Snapshot + Primary Address */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Latest Order Card (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Most Recent Order
            </h3>
            <Link href="/account/orders" className="text-xs font-bold uppercase text-accent hover:underline">
              View All Orders
            </Link>
          </div>

          {recentOrder ? (
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800 text-xs">
                <div>
                  <span className="font-bold text-white text-sm mr-3 font-mono">
                    #{recentOrder.displayId}
                  </span>
                  <span className="text-zinc-400">{formatDate(recentOrder.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                    {recentOrder.status}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {formatPrice(recentOrder.total)}
                  </span>
                </div>
              </div>

              {/* Line Items Snapshot */}
              <div className="space-y-2">
                {recentOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-zinc-300">
                    <span>
                      {item.title} <span className="text-zinc-500">({item.variant})</span>
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent" />
                  <span>
                    Carrier: <strong className="text-white">{recentOrder.awb ? recentOrder.courier : "Not assigned yet"}</strong>
                    {recentOrder.awb ? ` (AWB: ${recentOrder.awb})` : ""}
                  </span>
                </div>
                <Link
                  href={`/account/orders/${recentOrder.id}`}
                  className="text-accent hover:underline font-bold"
                >
                  View Details
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
              No orders placed yet.
            </div>
          )}
        </div>

        {/* Primary Address (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Default Shipping Address
            </h3>
            <Link href="/account/addresses" className="text-xs font-bold uppercase text-[#9A0000] hover:underline">
              Manage
            </Link>
          </div>

          {defaultAddress ? (
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{defaultAddress.name}</span>
                <span className="bg-[#9A0000] border border-[#9A0000] text-white px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-sm">
                  PRIMARY
                </span>
              </div>
              <p className="text-zinc-400">{defaultAddress.phone}</p>
              <p className="text-zinc-300">{defaultAddress.addressLine1}</p>
              {defaultAddress.addressLine2 && (
                <p className="text-zinc-400">{defaultAddress.addressLine2}</p>
              )}
              <p className="text-zinc-400">
                {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
              </p>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
              No addresses saved.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
