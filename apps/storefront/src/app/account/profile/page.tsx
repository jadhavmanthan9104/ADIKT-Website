"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useCustomer } from "@/components/providers/CustomerContext"
import { ArrowLeft, Check, User, Lock, AlertCircle, ShieldCheck } from "@/components/ui/Icons"
import { EmptyState } from "@/components/ui/EmptyState"

export default function ProfileSettingsPage() {
  const { customer, updateProfile, isLoaded } = useCustomer()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isProfileSaved, setIsProfileSaved] = useState(false)
  const [isPasswordSaved, setIsPasswordSaved] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setLoadingProfile(true)

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      })
      setIsProfileSaved(true)
      setTimeout(() => setIsProfileSaved(false), 2500)
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile")
    } finally {
      setLoadingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    setLoadingPassword(true)

    try {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setIsPasswordSaved(true)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setIsPasswordSaved(false), 3000)
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password")
    } finally {
      setLoadingPassword(false)
    }
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
        <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Security & Profile
        </span>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
          Profile Settings
        </h1>
        <p className="text-xs text-zinc-400">Update your contact details and authentication settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Card */}
        <form onSubmit={handleProfileSubmit} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <User className="h-4 w-4 text-accent" /> Personal Information
          </h3>

          {profileError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">First Name *</label>
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
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="mt-1 w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-2 text-xs text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Mobile Phone</label>
            <input
              type="tel"
              maxLength={15}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loadingProfile}
            className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isProfileSaved ? (
              <>
                <Check className="h-4 w-4 text-green-600" /> Details Updated
              </>
            ) : loadingProfile ? (
              "Saving..."
            ) : (
              "Save Contact Details"
            )}
          </button>
        </form>

        {/* Change Password Card */}
        <form onSubmit={handlePasswordSubmit} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" /> Change Password
          </h3>

          {passwordError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {isPasswordSaved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>Password successfully updated!</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-400">Current Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">New Password (Min 8 chars) *</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Confirm New Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loadingPassword}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-extrabold uppercase rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loadingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
