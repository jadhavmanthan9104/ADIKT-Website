"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useCustomer, CustomerAddress } from "@/components/providers/CustomerContext"
import { ArrowLeft, Plus, Trash2, MapPin, Check, User } from "@/components/ui/Icons"
import { EmptyState } from "@/components/ui/EmptyState"

export default function AddressesPage() {
  const { customer, addresses, addAddress, deleteAddress, setDefaultAddress, isLoaded } = useCustomer()

  const [isAdding, setIsAdding] = useState(false)
  const [newAddr, setNewAddr] = useState<Omit<CustomerAddress, "id">>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAddr.name && newAddr.addressLine1 && newAddr.pincode) {
      addAddress(newAddr)
      setIsAdding(false)
      setNewAddr({
        name: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      })
    }
  }

  if (isLoaded && !customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <EmptyState
          icon={<User className="h-12 w-12 text-zinc-600" />}
          title="Sign In Required"
          description="Please sign in to manage your saved Indian delivery addresses and default shipping destinations."
          actionLabel="Sign In"
          actionHref="/login"
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <Link href="/account" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Address Book</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-zinc-400">Manage express checkout addresses across India</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-black font-extrabold uppercase rounded-lg text-xs"
        >
          <Plus className="h-4 w-4" /> {isAdding ? "Cancel" : "Add New Address"}
        </button>
      </div>

      {/* Add Address Form Modal / Box */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Add New Indian Shipping Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-400">Contact Full Name *</label>
              <input
                type="text"
                required
                value={newAddr.name}
                onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400">Mobile Phone *</label>
              <input
                type="tel"
                maxLength={10}
                required
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, "") })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Flat / House No. / Building / Street *</label>
              <input
                type="text"
                required
                value={newAddr.addressLine1}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400">Locality / Landmark</label>
              <input
                type="text"
                value={newAddr.addressLine2}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400">6-Digit PIN Code *</label>
              <input
                type="text"
                maxLength={6}
                required
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, "") })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400">City *</label>
              <input
                type="text"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400">State *</label>
              <input
                type="text"
                required
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-lg"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-6 rounded-2xl border space-y-4 text-xs transition-colors ${
              addr.isDefault
                ? "bg-zinc-900 border-accent/60"
                : "bg-zinc-900/60 border-zinc-800"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">{addr.name}</h4>
                <p className="text-zinc-400">{addr.phone}</p>
              </div>

              {addr.isDefault ? (
                <span className="bg-accent/20 border border-accent/40 text-accent px-2.5 py-0.5 rounded font-bold uppercase text-[10px]">
                  Default
                </span>
              ) : (
                <button
                  onClick={() => setDefaultAddress(addr.id)}
                  className="text-zinc-400 hover:text-white underline font-medium"
                >
                  Set as Default
                </button>
              )}
            </div>

            <div className="text-zinc-300 space-y-0.5 leading-relaxed">
              <p>{addr.addressLine1}</p>
              {addr.addressLine2 && <p className="text-zinc-400">{addr.addressLine2}</p>}
              <p>
                {addr.city}, {addr.state} - <span className="font-mono text-white">{addr.pincode}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => deleteAddress(addr.id)}
                className="text-zinc-500 hover:text-accent flex items-center gap-1 font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
