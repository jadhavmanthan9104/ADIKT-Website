"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCustomer } from "@/components/providers/CustomerContext"
import { ArrowRight, Mail, User, Phone, Lock } from "@/components/ui/Icons"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useCustomer()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(formData.email)
      router.push("/account")
    } catch (err: any) {
      setError("Registration failed. Please verify your details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">VIP Membership</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display">
          Create VIP Account
        </h1>
        <p className="text-xs text-zinc-400">
          Get exclusive early drop access, order tracking, and 10% off with code WELCOME10
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400">First Name *</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>
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
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400">Email Address *</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400">Mobile Phone *</label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="tel"
              maxLength={10}
              required
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400">Password (Min 8 characters) *</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Join VIP Member Club"} <ArrowRight className="h-4 w-4" />
        </button>

        <div className="text-center pt-4 border-t border-zinc-800 text-xs text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-white font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  )
}
