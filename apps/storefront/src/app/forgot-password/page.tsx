"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Check } from "@/components/ui/Icons"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [resetUrl, setResetUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
        if (data.resetUrl) setResetUrl(data.resetUrl)
      } else {
        setError(data.error || "Failed to process password reset request")
      }
    } catch (err: any) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>

      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Account Recovery</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display">
          Reset Password
        </h1>
        <p className="text-xs text-zinc-400">
          Enter your registered email address to receive a secure password reset link.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-3 py-4">
            <div className="h-10 w-10 mx-auto rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Reset Link Issued</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We&apos;ve issued a secure password reset token for <strong className="text-white">{email}</strong>.
            </p>
            {resetUrl && (
              <div className="pt-2">
                <Link
                  href={resetUrl}
                  className="inline-block px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold uppercase rounded-lg shadow-md transition-colors"
                >
                  Proceed to Enter New Password →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-lg text-xs tracking-wider transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
