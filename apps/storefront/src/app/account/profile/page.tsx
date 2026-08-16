"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useCustomer } from "@/components/providers/CustomerContext"
import { ArrowLeft, Check, User } from "@/components/ui/Icons"
import { EmptyState } from "@/components/ui/EmptyState"

export default function ProfileSettingsPage() {
  const { customer, updateProfile, isLoaded } = useCustomer()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
      })
    }
  }, [customer])

  const [isSaved, setIsSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(formData)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  if (isLoaded && !customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <EmptyState
          icon={<User className="h-12 w-12 text-zinc-600" />}
          title="Sign In Required"
          description="Please sign in to view and edit your profile settings."
          actionLabel="Sign In"
          actionHref="/login"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <Link href="/account" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Customer Dashboard
      </Link>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Security & Profile</span>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
          Profile Settings
        </h1>
        <p className="text-xs text-zinc-400">Update your contact details and authentication settings</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-400">First Name</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
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
            <label className="text-xs font-medium text-zinc-400">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-400">Mobile Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-colors"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4 text-green-600" /> Changes Saved
            </>
          ) : (
            "Save Profile Changes"
          )}
        </button>
      </form>
    </div>
  )
}
