"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, ArrowRight, Check } from "@/components/ui/Icons"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setError(null)
    setSuccess(true)
    setTimeout(() => {
      router.push("/login")
    }, 2000)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Security</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display">
          Set New Password
        </h1>
        <p className="text-xs text-zinc-400">
          Create a new strong password for your VIP account
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-3 py-4">
            <div className="h-10 w-10 mx-auto rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Password Updated</h3>
            <p className="text-xs text-zinc-400">Redirecting to sign in page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400">New Password (Min 8 chars)</label>
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

            <div>
              <label className="text-xs font-medium text-zinc-400">Confirm New Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              Update Password <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs uppercase text-zinc-500">Loading password reset...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
