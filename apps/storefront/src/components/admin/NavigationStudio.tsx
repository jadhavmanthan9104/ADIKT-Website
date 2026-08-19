"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  AdminContentItem,
  CmsHeaderMenuItem,
  CmsNavigation,
  INITIAL_CMS_CONTENT,
} from "@/lib/content-store"
import { BrandLogo } from "@/components/ui/BrandLogo"
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  Tag,
  Link as LinkIcon,
  Layers,
  Sparkles,
  Check,
  Save,
  RotateCcw,
  Globe,
  Search,
  ShoppingBag,
  Heart,
  User,
  CheckCircle2,
  ArrowLeftRight,
  HelpCircle,
  X,
  Compass,
} from "lucide-react"

interface NavigationStudioProps {
  content: AdminContentItem
  onChange: (updatedContent: AdminContentItem) => void
  onSave?: () => void
  isSaving?: boolean
  isSaved?: boolean
}

export function NavigationStudio({
  content,
  onChange,
  onSave,
  isSaving = false,
  isSaved = false,
}: NavigationStudioProps) {
  // Modal states for adding / editing a menu item
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CmsHeaderMenuItem | null>(null)
  const [modalPosition, setModalPosition] = useState<"left" | "right">("left")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Safe navigation object with defaults
  const navigation: CmsNavigation = content.navigation || INITIAL_CMS_CONTENT.navigation

  const leftItems = navigation.leftMenuItems || INITIAL_CMS_CONTENT.navigation.leftMenuItems
  const rightItems = navigation.rightMenuItems || INITIAL_CMS_CONTENT.navigation.rightMenuItems

  // Update navigation helper
  const updateNavigation = (newNav: Partial<CmsNavigation>) => {
    const updatedNav: CmsNavigation = {
      ...navigation,
      ...newNav,
    }
    onChange({
      ...content,
      navigation: updatedNav,
    })
  }

  // Add new item
  const handleOpenAddModal = (position: "left" | "right") => {
    setModalPosition(position)
    setEditingItem({
      id: `nav_${Date.now()}`,
      label: "",
      url: "/shop",
      position,
      badge: "",
      openInNewTab: false,
      enabled: true,
    })
    setIsModalOpen(true)
  }

  // Edit existing item
  const handleOpenEditModal = (item: CmsHeaderMenuItem) => {
    setModalPosition(item.position)
    setEditingItem({ ...item })
    setIsModalOpen(true)
  }

  // Save item from modal
  const handleSaveModalItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.label.trim()) return

    const itemToSave = {
      ...editingItem,
      label: editingItem.label.trim(),
      url: editingItem.url.trim() || "/shop",
      badge: editingItem.badge?.trim() || undefined,
    }

    if (modalPosition === "left") {
      const existingIdx = leftItems.findIndex((i) => i.id === itemToSave.id)
      let newLeft = [...leftItems]
      if (existingIdx !== -1) {
        newLeft[existingIdx] = itemToSave
      } else {
        newLeft.push(itemToSave)
      }
      // If position was changed from right to left, remove from right
      const newRight = rightItems.filter((i) => i.id !== itemToSave.id)
      updateNavigation({ leftMenuItems: newLeft, rightMenuItems: newRight })
    } else {
      const existingIdx = rightItems.findIndex((i) => i.id === itemToSave.id)
      let newRight = [...rightItems]
      if (existingIdx !== -1) {
        newRight[existingIdx] = itemToSave
      } else {
        newRight.push(itemToSave)
      }
      // If position was changed from left to right, remove from left
      const newLeft = leftItems.filter((i) => i.id !== itemToSave.id)
      updateNavigation({ leftMenuItems: newLeft, rightMenuItems: newRight })
    }

    setIsModalOpen(false)
    setEditingItem(null)
    showToast(`Saved navigation item "${itemToSave.label}"`)
  }

  // Delete item
  const handleDeleteItem = (id: string, label: string) => {
    if (confirm(`Remove "${label}" from website header?`)) {
      const newLeft = leftItems.filter((i) => i.id !== id)
      const newRight = rightItems.filter((i) => i.id !== id)
      updateNavigation({ leftMenuItems: newLeft, rightMenuItems: newRight })
      showToast(`Removed "${label}"`)
    }
  }

  // Toggle enable/disable
  const handleToggleEnabled = (id: string, isLeft: boolean) => {
    if (isLeft) {
      const newLeft = leftItems.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i))
      updateNavigation({ leftMenuItems: newLeft })
    } else {
      const newRight = rightItems.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i))
      updateNavigation({ rightMenuItems: newRight })
    }
  }

  // Move up/down
  const handleMove = (index: number, direction: "up" | "down", isLeft: boolean) => {
    const list = isLeft ? [...leftItems] : [...rightItems]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    const temp = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = temp

    if (isLeft) {
      updateNavigation({ leftMenuItems: list })
    } else {
      updateNavigation({ rightMenuItems: list })
    }
  }

  // Switch position between Left and Right
  const handleSwitchPosition = (item: CmsHeaderMenuItem) => {
    if (item.position === "left") {
      const newLeft = leftItems.filter((i) => i.id !== item.id)
      const newRight = [...rightItems, { ...item, position: "right" as const }]
      updateNavigation({ leftMenuItems: newLeft, rightMenuItems: newRight })
      showToast(`Moved "${item.label}" to Right Navigation`)
    } else {
      const newRight = rightItems.filter((i) => i.id !== item.id)
      const newLeft = [...leftItems, { ...item, position: "left" as const }]
      updateNavigation({ leftMenuItems: newLeft, rightMenuItems: newRight })
      showToast(`Moved "${item.label}" to Left Navigation`)
    }
  }

  // Reset to default
  const handleResetDefaults = () => {
    if (confirm("Reset website header navigation menus to original defaults?")) {
      updateNavigation(INITIAL_CMS_CONTENT.navigation)
      showToast("Navigation menus reset to default.")
    }
  }

  // Quick preset links
  const PRESET_LINKS = [
    { label: "Shop All", url: "/shop", category: "General" },
    { label: "Heavyweight Tees", url: "/shop?category=tees", badge: "280 GSM", category: "Categories" },
    { label: "French Terry Hoodies", url: "/shop?category=hoodies", badge: "400 GSM", category: "Categories" },
    { label: "Utility Cargos", url: "/shop?category=cargos", category: "Categories" },
    { label: "Sweatshirts & Crewnecks", url: "/shop?category=sweats", badge: "380 GSM", category: "Categories" },
    { label: "Core Heavyweight", url: "/collections/core-heavyweight", badge: "Signature", category: "Collections" },
    { label: "French Terry Fleece", url: "/collections/french-terry-fleece", category: "Collections" },
    { label: "Parachute Cargos", url: "/collections/parachute-cargos", category: "Collections" },
    { label: "Drop 04 Autumn", url: "/collections/drop-04-autumn", badge: "New Drop", category: "Collections" },
    { label: "The Craft", url: "/about", category: "Brand" },
    { label: "Help & FAQ", url: "/faq", category: "Brand" },
    { label: "Track My Order", url: "/track", category: "Customer" },
  ]

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5" /> Header Menu Studio
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-display">
            Navigation & Header Menus
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Customize, add, reorder, and assign links, badges, and destinations to the desktop header and mobile drawer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </button>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-transform active:scale-95 shrink-0"
            >
              {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : isSaved ? "Saved!" : "Publish Navigation"}
            </button>
          )}
        </div>
      </div>

      {/* 1. REAL-TIME LIVE HEADER SIMULATION PREVIEW */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-bold uppercase text-white font-display">
              Live Header Mockup Preview
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            Auto-Updates Live
          </span>
        </div>

        {/* Mockup Frame */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
          {/* Announcement Bar Preview */}
          {content.announcement?.active && content.announcement?.text && (
            <div className="bg-[#9A0000] text-white text-[10px] py-1.5 px-4 text-center font-bold tracking-wider uppercase truncate">
              {content.announcement.text}
            </div>
          )}

          {/* Header Bar Simulation */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95">
            {/* Left Nav */}
            <div className="flex items-center gap-4 flex-1">
              {leftItems
                .filter((i) => i.enabled)
                .map((item) => (
                  <span
                    key={item.id}
                    className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-1 cursor-default"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-accent/20 text-accent border border-accent/30 lowercase font-mono">
                        {item.badge}
                      </span>
                    )}
                  </span>
                ))}
              {leftItems.filter((i) => i.enabled).length === 0 && (
                <span className="text-[10px] text-zinc-600 italic">No left links</span>
              )}
            </div>

            {/* Brand Logo Center */}
            <div className="px-4 shrink-0 flex items-center justify-center">
              <span className="text-sm font-black uppercase tracking-widest text-white font-display">
                ADIKT
              </span>
            </div>

            {/* Right Nav */}
            <div className="flex items-center justify-end gap-4 flex-1">
              {rightItems
                .filter((i) => i.enabled)
                .map((item) => (
                  <span
                    key={item.id}
                    className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1 cursor-default"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-accent/20 text-accent border border-accent/30 lowercase font-mono">
                        {item.badge}
                      </span>
                    )}
                  </span>
                ))}

              {/* Action Icons */}
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800 text-zinc-400">
                <Search className="h-3.5 w-3.5" />
                <User className="h-3.5 w-3.5" />
                <Heart className="h-3.5 w-3.5" />
                <ShoppingBag className="h-3.5 w-3.5 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION MANAGERS (LEFT & RIGHT COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT-SIDE NAVIGATION MENU (Categories & Silhouettes) */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-bold uppercase text-white font-display">
                  Left Header Menu ({leftItems.length})
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Displays on the left side of the desktop header and top of mobile menu.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddModal("left")}
              className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1 shadow-sm transition-transform active:scale-95 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Add Link
            </button>
          </div>

          {/* Left Menu Items List */}
          <div className="space-y-2.5">
            {leftItems.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.enabled
                    ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-950/40 border-zinc-800/40 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 w-4 shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-accent/20 text-accent border border-accent/30 font-mono">
                          {item.badge}
                        </span>
                      )}
                      {item.openInNewTab && (
                        <span title="Opens in new tab">
                          <ExternalLink className="h-3 w-3 text-zinc-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 truncate block">
                      {item.url}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up", true)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === leftItems.length - 1}
                    onClick={() => handleMove(idx, "down", true)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchPosition(item)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-accent"
                    title="Move to Right Menu"
                  >
                    <ArrowLeftRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(item.id, true)}
                    className={`p-1.5 rounded-lg border ${
                      item.enabled
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                    title={item.enabled ? "Enabled on storefront" : "Hidden from storefront"}
                  >
                    {item.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    title="Edit Link"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.label)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400"
                    title="Delete Link"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {leftItems.length === 0 && (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-500">No left menu links. Click &quot;Add Link&quot; above.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT-SIDE NAVIGATION MENU (Brand, Editorial & Help) */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-bold uppercase text-white font-display">
                  Right Header Menu ({rightItems.length})
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Displays on the right side of the desktop header before action icons.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddModal("right")}
              className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1 shadow-sm transition-transform active:scale-95 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Add Link
            </button>
          </div>

          {/* Right Menu Items List */}
          <div className="space-y-2.5">
            {rightItems.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.enabled
                    ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-950/40 border-zinc-800/40 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 w-4 shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-accent/20 text-accent border border-accent/30 font-mono">
                          {item.badge}
                        </span>
                      )}
                      {item.openInNewTab && (
                        <span title="Opens in new tab">
                          <ExternalLink className="h-3 w-3 text-zinc-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 truncate block">
                      {item.url}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up", false)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === rightItems.length - 1}
                    onClick={() => handleMove(idx, "down", false)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchPosition(item)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-accent"
                    title="Move to Left Menu"
                  >
                    <ArrowLeftRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(item.id, false)}
                    className={`p-1.5 rounded-lg border ${
                      item.enabled
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                    title={item.enabled ? "Enabled on storefront" : "Hidden from storefront"}
                  >
                    {item.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    title="Edit Link"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.label)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400"
                    title="Delete Link"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {rightItems.length === 0 && (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-500">No right menu links. Click &quot;Add Link&quot; above.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. QUICK LINK PRESET INSERTERS */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold uppercase text-white font-display">
            Quick Preset Inserters
          </h3>
          <span className="text-[10px] text-zinc-400">
            Click any preset to instantly pre-fill a new menu link.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {PRESET_LINKS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setModalPosition("left")
                setEditingItem({
                  id: `nav_${Date.now()}`,
                  label: preset.label,
                  url: preset.url,
                  position: "left",
                  badge: preset.badge || "",
                  openInNewTab: false,
                  enabled: true,
                })
                setIsModalOpen(true)
              }}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-accent text-left transition-colors group space-y-1"
            >
              <div className="flex items-center justify-between text-[9px] font-bold uppercase text-zinc-500">
                <span>{preset.category}</span>
                <Plus className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 text-accent transition-opacity" />
              </div>
              <p className="text-xs font-bold text-white group-hover:text-accent transition-colors truncate">
                {preset.label}
              </p>
              {preset.badge && (
                <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-accent/20 text-accent border border-accent/30 lowercase font-mono">
                  {preset.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CREATE / EDIT MENU ITEM MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-accent">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-black uppercase text-white font-display">
                  {leftItems.some((i) => i.id === editingItem.id) ||
                  rightItems.some((i) => i.id === editingItem.id)
                    ? "Edit Navigation Menu Item"
                    : "Add Navigation Menu Item"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalItem} className="space-y-4 text-xs">
              {/* Menu Position */}
              <div>
                <label className="text-zinc-400 font-bold block mb-1.5">Menu Position *</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    onClick={() => {
                      setModalPosition("left")
                      setEditingItem({ ...editingItem, position: "left" })
                    }}
                    className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      modalPosition === "left"
                        ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="nav_pos"
                      checked={modalPosition === "left"}
                      onChange={() => {
                        setModalPosition("left")
                        setEditingItem({ ...editingItem, position: "left" })
                      }}
                      className="hidden"
                    />
                    Left Side Menu
                  </label>
                  <label
                    onClick={() => {
                      setModalPosition("right")
                      setEditingItem({ ...editingItem, position: "right" })
                    }}
                    className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      modalPosition === "right"
                        ? "bg-[#9A0000]/10 border-[#9A0000] ring-1 ring-[#9A0000]/50 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="nav_pos"
                      checked={modalPosition === "right"}
                      onChange={() => {
                        setModalPosition("right")
                        setEditingItem({ ...editingItem, position: "right" })
                      }}
                      className="hidden"
                    />
                    Right Side Menu
                  </label>
                </div>
              </div>

              {/* Menu Label */}
              <div>
                <label className="text-zinc-400 font-medium block">Menu Label (Visible Text) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavyweight Tees, Drop 04, Size Guide"
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-bold"
                />
              </div>

              {/* Destination URL */}
              <div>
                <label className="text-zinc-400 font-medium block">Link Target / Destination URL *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /shop, /shop?category=tees, /about, /collections/core-heavyweight"
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                />
                {/* Fast Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-zinc-500 py-0.5">Suggestions:</span>
                  {[
                    "/shop",
                    "/shop?category=tees",
                    "/shop?category=hoodies",
                    "/shop?category=cargos",
                    "/collections/core-heavyweight",
                    "/about",
                    "/faq",
                    "/track",
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, url: sug })}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge Text */}
              <div>
                <label className="text-zinc-400 font-medium block">Pill Badge Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 280 GSM, NEW, 400 GSM, HOT, SALE"
                  value={editingItem.badge || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>

              {/* Open in new tab */}
              <label className="flex items-center gap-2.5 pt-1 text-zinc-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.openInNewTab || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, openInNewTab: e.target.checked })
                  }
                  className="rounded bg-zinc-950 border-zinc-800 text-accent accent-[#9A0000]"
                />
                <span>Open link in new browser tab</span>
              </label>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-extrabold uppercase shadow-lg shadow-accent/20"
                >
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
