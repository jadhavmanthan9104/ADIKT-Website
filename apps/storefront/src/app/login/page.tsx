"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCustomer } from "@/components/providers/CustomerContext"
import { ArrowRight, Lock, Mail } from "@/components/ui/Icons"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("redirect") || "/account"

  const { login } = useCustomer()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      router.push(returnTo)
    } catch (err: any) {
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">VIP Access</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display">
          Customer Sign In
        </h1>
        <p className="text-xs text-zinc-400">
          Access your orders, saved addresses, and VIP drop allocations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-zinc-400">Email Address</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-zinc-400">Password</label>
            <Link href="/forgot-password" className="text-[11px] text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign In"} <ArrowRight className="h-4 w-4" />
        </button>

        <div className="text-center pt-4 border-t border-zinc-800 text-xs text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-white font-bold hover:underline">
            Create VIP Account
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs uppercase text-zinc-500">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  )
}
