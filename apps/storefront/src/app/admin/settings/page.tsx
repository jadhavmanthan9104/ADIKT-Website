"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Settings,
  Save,
  Check,
  Key,
  Shield,
  Mail,
  Globe,
  Moon,
  Sun,
  Monitor,
  Search,
  Share2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useAdminTheme } from "@/components/providers/AdminThemeContext"
import { SeoGlobalConfig, SeoRouteOverride } from "@/lib/seo-store"

const DEFAULT_SETTINGS = {
  storeName: "ADIKT Clothing Co.",
  storeEmail: "concierge@adikt.in",
  currency: "INR (₹)",
  country: "India (IN)",
  gstNumber: "27AADCA1234F1Z5",
  hsnTees: "61091000",
  hsnHoodies: "61102000",
  medusaBackendUrl: "http://localhost:9000",
  medusaPublishableKey: "pk_test_sample",
  notificationEmail: "alerts@adikt.in",
  adminRole: "Super Administrator",
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "seo" | "tax" | "medusa">("general")
  const [isSaved, setIsSaved] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const { adminTheme, setAdminTheme, isAdminDark } = useAdminTheme()

  // SEO State
  const [seoGlobal, setSeoGlobal] = useState<SeoGlobalConfig>({
    defaultTitle: "ADIKT | Heavyweight Luxury Streetwear",
    titleTemplate: "%s | ADIKT",
    defaultDescription:
      "Direct-to-consumer luxury streetwear engineered with 280–400 GSM custom fabrics, raw hems, and architectural drape. Crafted in India.",
    siteUrl: "https://adiktclothing.com",
    defaultOgImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
    twitterHandle: "@adiktclothing",
    instagramHandle: "@adiktclothing",
    socialLinks: ["https://instagram.com/adiktclothing", "https://twitter.com/adiktclothing"],
  })
  const [seoOverrides, setSeoOverrides] = useState<SeoRouteOverride[]>([])
  const [seoSaving, setSeoSaving] = useState(false)
  const [seoNotice, setSeoNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Upload States
  const [isUploadingGlobalOg, setIsUploadingGlobalOg] = useState(false)
  const [isUploadingOverrideOg, setIsUploadingOverrideOg] = useState(false)
  const globalFileInputRef = useRef<HTMLInputElement>(null)
  const overrideFileInputRef = useRef<HTMLInputElement>(null)

  // Route Override Modal State
  const [isEditingOverride, setIsEditingOverride] = useState(false)
  const [currentOverride, setCurrentOverride] = useState<SeoRouteOverride>({
    route: "",
    seoTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    ogImage: "",
    noIndex: false,
  })

  // Live SERP Preview Selection (default to "global" so typing immediately updates live preview)
  const [previewRoute, setPreviewRoute] = useState<string>("global")

  const fetchSeoConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/seo")
      if (res.ok) {
        const data = await res.json()
        if (data.global) setSeoGlobal(data.global)
        if (data.overrides) setSeoOverrides(data.overrides)
      }
    } catch (err) {
      console.warn("Failed to load SEO config:", err)
    }
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adikt_admin_settings")
      if (saved) {
        setSettings(JSON.parse(saved))
      }
    } catch {}
    fetchSeoConfig()
  }, [fetchSeoConfig])

  const handleGeneralSave = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      localStorage.setItem("adikt_admin_settings", JSON.stringify(settings))
    } catch {}
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleSaveGlobalSeo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSeoSaving(true)
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ global: seoGlobal }),
      })
      const data = await res.json()
      if (res.ok) {
        setSeoNotice({ type: "success", text: "Global SEO metadata defaults saved successfully." })
        await fetchSeoConfig()
      } else {
        setSeoNotice({ type: "error", text: data.error || "Failed to save SEO config." })
      }
    } catch (err: any) {
      setSeoNotice({ type: "error", text: err.message || "Failed to save SEO config." })
    } finally {
      setSeoSaving(false)
      setTimeout(() => setSeoNotice(null), 4000)
    }
  }

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOverride.route.trim()) return
    setSeoSaving(true)
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ override: currentOverride }),
      })
      const data = await res.json()
      if (res.ok) {
        setSeoNotice({ type: "success", text: `Override for ${currentOverride.route} saved.` })
        setIsEditingOverride(false)
        await fetchSeoConfig()
      } else {
        setSeoNotice({ type: "error", text: data.error || "Failed to save override." })
      }
    } catch (err: any) {
      setSeoNotice({ type: "error", text: err.message || "Failed to save override." })
    } finally {
      setSeoSaving(false)
      setTimeout(() => setSeoNotice(null), 4000)
    }
  }

  const handleDeleteOverride = async (route: string) => {
    if (!confirm(`Delete SEO override for ${route}?`)) return
    try {
      const res = await fetch(`/api/admin/seo?route=${encodeURIComponent(route)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setSeoNotice({ type: "success", text: `Override for ${route} deleted.` })
        await fetchSeoConfig()
      }
    } catch (err: any) {
      setSeoNotice({ type: "error", text: err.message || "Failed to delete override." })
    } finally {
      setTimeout(() => setSeoNotice(null), 4000)
    }
  }

  // File Upload Handlers for Open Graph Images
  const handleGlobalOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingGlobalOg(true)
    const formData = new FormData()
    formData.append("files", files[0])

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.urls?.[0]) {
        setSeoGlobal((prev) => ({ ...prev, defaultOgImage: data.urls[0] }))
        setSeoNotice({ type: "success", text: "Open Graph image uploaded successfully." })
      } else {
        setSeoNotice({ type: "error", text: data.error || "Failed to upload image." })
      }
    } catch (err: any) {
      setSeoNotice({ type: "error", text: err.message || "Upload network error." })
    } finally {
      setIsUploadingGlobalOg(false)
      if (globalFileInputRef.current) globalFileInputRef.current.value = ""
      setTimeout(() => setSeoNotice(null), 4000)
    }
  }

  const handleOverrideOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingOverrideOg(true)
    const formData = new FormData()
    formData.append("files", files[0])

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.urls?.[0]) {
        setCurrentOverride((prev) => ({ ...prev, ogImage: data.urls[0] }))
        setSeoNotice({ type: "success", text: "Override Open Graph image uploaded." })
      } else {
        setSeoNotice({ type: "error", text: data.error || "Failed to upload image." })
      }
    } catch (err: any) {
      setSeoNotice({ type: "error", text: err.message || "Upload network error." })
    } finally {
      setIsUploadingOverrideOg(false)
      if (overrideFileInputRef.current) overrideFileInputRef.current.value = ""
      setTimeout(() => setSeoNotice(null), 4000)
    }
  }

  // Active Preview Computation (Always strictly reflects live form state when on "global" or un-overridden paths)
  const isGlobalPreview = previewRoute === "global" || previewRoute === "/"
  const activeOverride = isGlobalPreview ? undefined : seoOverrides.find((o) => o.route === previewRoute)

  const previewTitle = isGlobalPreview
    ? seoGlobal.defaultTitle
    : activeOverride?.seoTitle ||
      seoGlobal.titleTemplate.replace(
        "%s",
        previewRoute.replace(/^\//, "").replace(/-/g, " ").toUpperCase() || "PAGE"
      )

  const previewDesc = isGlobalPreview
    ? seoGlobal.defaultDescription
    : activeOverride?.metaDescription || seoGlobal.defaultDescription

  const previewUrl = isGlobalPreview
    ? seoGlobal.siteUrl
    : activeOverride?.canonicalUrl || `${seoGlobal.siteUrl}${previewRoute.startsWith("/") ? previewRoute : `/${previewRoute}`}`

  const previewImage = isGlobalPreview
    ? seoGlobal.defaultOgImage
    : activeOverride?.ogImage || seoGlobal.defaultOgImage

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Core Configuration & Metadata
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Store & SEO Settings
          </h1>
        </div>

        {activeTab === "general" && (
          <button
            onClick={handleGeneralSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-transform active:scale-95"
          >
            {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isSaved ? "Saved" : "Save Settings"}
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { key: "general", label: "General & Branding", icon: Globe },
          { key: "seo", label: "eCommerce SEO & SERP", icon: Search },
          { key: "tax", label: "GST Compliance", icon: Shield },
          { key: "medusa", label: "Medusa API Server", icon: Key },
        ].map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Toast Notice */}
      {seoNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
            seoNotice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {seoNotice.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{seoNotice.text}</span>
        </div>
      )}

      {/* Tab 1: General & Branding */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Theme */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
                <Monitor className="h-4 w-4 text-accent" />
                Admin Workspace Theme & Appearance
              </div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                Independent from Storefront
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Customize the theme for your administrative dashboard. This operates independently from customer storefront themes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={(e) => setAdminTheme("dark", e)}
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all text-left cursor-pointer active:scale-98 ${
                  isAdminDark
                    ? "border-accent bg-accent/10 ring-1 ring-accent"
                    : "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <div className={`p-3 rounded-lg ${isAdminDark ? "bg-accent text-white" : "bg-zinc-800 text-zinc-400"}`}>
                  <Moon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white">Dark Obsidian</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">High-contrast dark mode for low eye strain</p>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => setAdminTheme("light", e)}
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all text-left cursor-pointer active:scale-98 ${
                  !isAdminDark
                    ? "border-accent bg-accent/10 ring-1 ring-accent"
                    : "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <div className={`p-3 rounded-lg ${!isAdminDark ? "bg-accent text-white" : "bg-zinc-800 text-zinc-400"}`}>
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white">Off-White Minimalist</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Clean luxury alabaster theme with sharp typography</p>
                </div>
              </button>
            </div>
          </div>

          {/* Store Info */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
              <Globe className="h-4 w-4 text-accent" />
              General Brand Details
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-medium">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Customer Support Email</label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Base Currency & Region</label>
                <input
                  type="text"
                  disabled
                  value={`${settings.currency} • ${settings.country}`}
                  className="mt-1 w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Medusa Overview */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
              <Key className="h-4 w-4 text-accent" />
              Core Infrastructure
            </div>
            <div className="space-y-2 text-xs text-zinc-400">
              <p>Active Backend: <span className="text-white font-mono">{settings.medusaBackendUrl}</span></p>
              <p>Operational Status: <span className="text-emerald-400 font-bold">Online (Headless v2)</span></p>
              <p>Tax Jurisdiction: <span className="text-white">Maharashtra (MH - 27)</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: eCommerce SEO & SERP Suite */}
      {activeTab === "seo" && (
        <div className="space-y-8">
          {/* Top Row: Global Defaults & Live SERP / Social Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Global Metadata Controls */}
            <form onSubmit={handleSaveGlobalSeo} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-black uppercase text-white font-display">
                    Global SEO Defaults
                  </h3>
                </div>
                <button
                  type="submit"
                  disabled={seoSaving}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{seoSaving ? "Saving..." : "Save Defaults"}</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between">
                    <label className="text-zinc-300 font-bold">Default SEO Title</label>
                    <span className={`font-mono text-[10px] ${seoGlobal.defaultTitle.length > 60 ? "text-amber-400" : "text-zinc-500"}`}>
                      {seoGlobal.defaultTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={seoGlobal.defaultTitle}
                    onChange={(e) => setSeoGlobal({ ...seoGlobal, defaultTitle: e.target.value })}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold">Title Format Template</label>
                  <input
                    type="text"
                    required
                    value={seoGlobal.titleTemplate}
                    onChange={(e) => setSeoGlobal({ ...seoGlobal, titleTemplate: e.target.value })}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                    placeholder="%s | ADIKT"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Use <code className="text-accent">%s</code> where page or product title will be injected.</p>
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="text-zinc-300 font-bold">Default Meta Description</label>
                    <span className={`font-mono text-[10px] ${seoGlobal.defaultDescription.length > 160 ? "text-amber-400" : "text-zinc-500"}`}>
                      {seoGlobal.defaultDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={seoGlobal.defaultDescription}
                    onChange={(e) => setSeoGlobal({ ...seoGlobal, defaultDescription: e.target.value })}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-bold">Canonical Base URL</label>
                    <input
                      type="url"
                      required
                      value={seoGlobal.siteUrl}
                      onChange={(e) => setSeoGlobal({ ...seoGlobal, siteUrl: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-bold">Twitter Creator Handle</label>
                    <input
                      type="text"
                      value={seoGlobal.twitterHandle}
                      onChange={(e) => setSeoGlobal({ ...seoGlobal, twitterHandle: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>

                {/* Default Open Graph Image with File Upload + URL Input */}
                <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-bold">Default Open Graph Image (1200 x 630)</label>
                    <span className="text-[10px] text-zinc-500 font-mono">Recommended 1200x630</span>
                  </div>

                  {/* Visual Image Preview & Upload Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                    <div className="relative w-full sm:w-44 h-24 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                      {seoGlobal.defaultOgImage ? (
                        <img
                          src={seoGlobal.defaultOgImage}
                          alt="Global OG Preview"
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 flex-1 w-full">
                      {/* Upload Button */}
                      <div>
                        <input
                          type="file"
                          ref={globalFileInputRef}
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={handleGlobalOgUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingGlobalOg}
                          onClick={() => globalFileInputRef.current?.click()}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-zinc-700 w-full sm:w-auto justify-center"
                        >
                          {isUploadingGlobalOg ? (
                            <Loader2 className="h-4 w-4 animate-spin text-accent" />
                          ) : (
                            <Upload className="h-4 w-4 text-accent" />
                          )}
                          <span>{isUploadingGlobalOg ? "Uploading Image..." : "Upload New Image"}</span>
                        </button>
                      </div>

                      {/* Manual Image URL Input fallback */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Or paste image URL (https://...)"
                          value={seoGlobal.defaultOgImage}
                          onChange={(e) => setSeoGlobal({ ...seoGlobal, defaultOgImage: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                        />
                        <LinkIcon className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Live Search Engine & Social Preview Inspector */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-black uppercase text-white font-display">
                    Live SERP & Social Card Preview
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Form Sync
                  </span>

                  {/* Route Selector */}
                  <select
                    value={previewRoute}
                    onChange={(e) => setPreviewRoute(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-accent"
                  >
                    <option value="global">Global Defaults (Live Form)</option>
                    {seoOverrides.map((o) => (
                      <option key={o.route} value={o.route}>
                        Override: {o.route}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1. Google SERP Preview Box */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                  Google Search Result (Desktop & Mobile)
                </span>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5 shadow-inner">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#9A0000] flex items-center justify-center text-[9px] font-black text-white">
                      A
                    </div>
                    <div>
                      <div className="text-[11px] text-zinc-300 font-medium">ADIKT Clothing</div>
                      <div className="text-[10px] text-zinc-500 font-mono line-clamp-1">{previewUrl}</div>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-blue-400 hover:underline cursor-pointer line-clamp-1">
                    {previewTitle}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {previewDesc}
                  </p>
                </div>
              </div>

              {/* 2. Open Graph Social Card Preview Box */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                  Open Graph Social Share Card (Facebook, X, LinkedIn)
                </span>
                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                  <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                    <img
                      src={previewImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-zinc-300 backdrop-blur-sm">
                      1200 x 630
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                      {new URL(seoGlobal.siteUrl || "https://adiktclothing.com").hostname}
                    </span>
                    <h5 className="text-xs font-black text-white line-clamp-1">{previewTitle}</h5>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{previewDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Page & Route Overrides Table */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                  Granular Control
                </span>
                <h3 className="text-xl font-black uppercase text-white font-display">
                  Page & Product SEO Overrides ({seoOverrides.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Customize title tags, descriptions, canonical URLs, and OG cards for specific products, collections, or landing pages.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentOverride({
                    route: "",
                    seoTitle: "",
                    metaDescription: "",
                    canonicalUrl: "",
                    ogImage: "",
                    noIndex: false,
                  })
                  setIsEditingOverride(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-all"
              >
                <Plus className="h-4 w-4" /> Add Route Override
              </button>
            </div>

            {/* Overrides Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Route Path</th>
                    <th className="py-3 px-4">Custom SEO Title</th>
                    <th className="py-3 px-4">Meta Description</th>
                    <th className="py-3 px-4">Directives</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {seoOverrides.map((o) => (
                    <tr key={o.route} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-accent">
                        {o.route}
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium max-w-xs truncate">
                        {o.seoTitle || <span className="text-zinc-600 italic">Inherited</span>}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 max-w-sm truncate">
                        {o.metaDescription || <span className="text-zinc-600 italic">Inherited</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {o.noIndex ? (
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                            NOINDEX
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                            INDEX
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentOverride({ ...o })
                            setIsEditingOverride(true)
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Edit Override"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOverride(o.route)}
                          className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 transition-colors"
                          title="Delete Override"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Route Override Modal */}
          {isEditingOverride && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                      SEO Override Editor
                    </span>
                    <h3 className="text-lg font-black text-white font-display mt-0.5">
                      Configure Custom Metadata
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEditingOverride(false)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
                  <div>
                    <label className="text-zinc-300 font-bold">Route Path / Slug (Required)</label>
                    <input
                      type="text"
                      required
                      placeholder="/products/boxy-heavyweight-tee-vintage-black or /lookbook"
                      value={currentOverride.route}
                      onChange={(e) => setCurrentOverride({ ...currentOverride, route: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <label className="text-zinc-300 font-bold">Override SEO Title</label>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {(currentOverride.seoTitle || "").length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Leave blank to use dynamic product/category title"
                      value={currentOverride.seoTitle || ""}
                      onChange={(e) => setCurrentOverride({ ...currentOverride, seoTitle: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <label className="text-zinc-300 font-bold">Override Meta Description</label>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {(currentOverride.metaDescription || "").length}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Leave blank to inherit global or product description"
                      value={currentOverride.metaDescription || ""}
                      onChange={(e) => setCurrentOverride({ ...currentOverride, metaDescription: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-bold">Custom Canonical URL</label>
                    <input
                      type="url"
                      placeholder="https://adiktclothing.com/..."
                      value={currentOverride.canonicalUrl || ""}
                      onChange={(e) => setCurrentOverride({ ...currentOverride, canonicalUrl: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  {/* Override OG Image with Upload & URL */}
                  <div className="space-y-2">
                    <label className="text-zinc-300 font-bold">Custom Open Graph Image (1200x630)</label>
                    <div className="flex gap-3 items-center bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                      <div className="w-20 h-14 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                        {currentOverride.ogImage ? (
                          <img src={currentOverride.ogImage} alt="Override OG" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <input
                          type="file"
                          ref={overrideFileInputRef}
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={handleOverrideOgUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingOverrideOg}
                          onClick={() => overrideFileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-zinc-700"
                        >
                          {isUploadingOverrideOg ? <Loader2 className="h-3 w-3 animate-spin text-accent" /> : <Upload className="h-3 w-3 text-accent" />}
                          <span>Upload Image</span>
                        </button>
                        <input
                          type="text"
                          placeholder="Or enter URL"
                          value={currentOverride.ogImage || ""}
                          onChange={(e) => setCurrentOverride({ ...currentOverride, ogImage: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="overrideNoIndex"
                      checked={Boolean(currentOverride.noIndex)}
                      onChange={(e) => setCurrentOverride({ ...currentOverride, noIndex: e.target.checked })}
                      className="rounded bg-zinc-950 border-zinc-800 text-accent focus:ring-accent"
                    />
                    <label htmlFor="overrideNoIndex" className="text-xs text-zinc-300 font-medium cursor-pointer">
                      Exclude from search engines (<code className="text-red-400 font-mono">noindex, nofollow</code>)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingOverride(false)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={seoSaving}
                      className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20"
                    >
                      {seoSaving ? "Saving..." : "Save Override"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: GST Compliance */}
      {activeTab === "tax" && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
            <Shield className="h-4 w-4 text-accent" />
            Indian GST Tax Rules & Invoicing
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-400 font-medium">Registered GSTIN Number</label>
              <input
                type="text"
                value={settings.gstNumber}
                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 font-medium">HSN Code (Tees)</label>
                <input
                  type="text"
                  value={settings.hsnTees}
                  onChange={(e) => setSettings({ ...settings, hsnTees: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-medium">HSN Code (Hoodies)</label>
                <input
                  type="text"
                  value={settings.hsnHoodies}
                  onChange={(e) => setSettings({ ...settings, hsnHoodies: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Medusa Backend Connectivity */}
      {activeTab === "medusa" && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
            <Key className="h-4 w-4 text-accent" />
            Medusa v2 Core Backend & API Credentials
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-400 font-medium">Medusa Commerce Server URL</label>
              <input
                type="text"
                value={settings.medusaBackendUrl}
                onChange={(e) => setSettings({ ...settings, medusaBackendUrl: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium">Publishable API Key</label>
              <input
                type="text"
                value={settings.medusaPublishableKey}
                onChange={(e) => setSettings({ ...settings, medusaPublishableKey: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
