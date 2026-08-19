"use client"

export const dynamic = "force-dynamic"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import {
  AdminContentItem,
  CmsPromoBanner,
  CmsFeaturedCollection,
  CmsCollectionSection,
  CmsHomepageSectionLayout,
  DEFAULT_HOMEPAGE_LAYOUT,
  CmsFaqItem,
  CmsContentBlock,
} from "@/lib/content-store"
import {
  FileText,
  Save,
  Check,
  Plus,
  Trash2,
  Globe,
  Sparkles,
  HelpCircle,
  Bell,
  Layout,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  Shield,
  ShieldCheck,
  Truck,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Edit2,
  CheckCircle2,
  Info,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  ImagePlus,
  Loader2,
  FolderPlus,
  Sliders,
  ChevronRight,
  Package,
  GripVertical,
  LayoutGrid,
  Zap,
  Search,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Compass,
} from "lucide-react"
import { HeroBannerImageUploader } from "@/components/admin/HeroBannerImageUploader"
import { NavigationStudio } from "@/components/admin/NavigationStudio"

export default function AdminContentPage() {
  const [content, setContent] = useState<AdminContentItem | null>(null)
  const [catalogProducts, setCatalogProducts] = useState<any[]>([])
  const [activeMainTab, setActiveMainTab] = useState<"homepage" | "navigation" | "footer" | "pages">("homepage")
  const [activePageTab, setActivePageTab] = useState<
    "about" | "contact" | "faq" | "shipping" | "returns" | "privacy" | "terms"
  >("about")
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // FAQ Modal State
  const [editingFaq, setEditingFaq] = useState<CmsFaqItem | null>(null)
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false)

  // Promo Banner Modal State
  const [editingPromo, setEditingPromo] = useState<CmsPromoBanner | null>(null)
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false)

  // Featured Collection Modal State
  const [editingCollection, setEditingCollection] = useState<CmsFeaturedCollection | null>(null)
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)
  const [isUploadingColImg, setIsUploadingColImg] = useState(false)
  const colFileInputRef = useRef<HTMLInputElement>(null)

  // Collection Carousel Section Modal State
  const [editingSection, setEditingSection] = useState<CmsCollectionSection | null>(null)
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false)

  // Featured Products Catalog Picker Modal State
  const [isProductPickerModalOpen, setIsProductPickerModalOpen] = useState(false)
  const [productPickerSearch, setProductPickerSearch] = useState("")
  const [productPickerCategory, setProductPickerCategory] = useState("all")

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) {
          setContent(data.content)
        }
      })
      .catch((err) => console.error("Failed to load CMS content:", err))

    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const list = data?.adminProducts || data?.storeProducts || data?.products || []
        setCatalogProducts(list)
      })
      .catch((err) => console.error("Failed to load catalog products:", err))
  }, [])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!content) return
    setIsSaving(true)

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })

      if (!res.ok) {
        throw new Error("Failed to save content to server")
      }

      const data = await res.json()
      if (data.content) setContent(data.content)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      console.error("Error saving content:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Upload handler for featured collection image
  const handleCollectionImageUpload = async (file: File) => {
    if (!editingCollection) return
    setIsUploadingColImg(true)
    try {
      const formData = new FormData()
      formData.append("files", file)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Image upload failed")
      const data = await res.json()
      if (data.urls && data.urls[0]) {
        setEditingCollection({ ...editingCollection, image: data.urls[0] })
      }
    } catch (err) {
      console.error("Collection image upload error:", err)
      alert("Failed to upload image. Please check file format.")
    } finally {
      setIsUploadingColImg(false)
    }
  }

  // Layout Section Sequencer Handlers
  const moveLayoutSection = (index: number, direction: "up" | "down") => {
    if (!content) return
    const list = [...(content.homepage.layoutSections || DEFAULT_HOMEPAGE_LAYOUT)]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return
    const item = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = item
    setContent({
      ...content,
      homepage: { ...content.homepage, layoutSections: list },
    })
  }

  const toggleLayoutSectionVisibility = (index: number) => {
    if (!content) return
    const list = [...(content.homepage.layoutSections || DEFAULT_HOMEPAGE_LAYOUT)]
    list[index] = { ...list[index], enabled: list[index].enabled === false ? true : false }
    setContent({
      ...content,
      homepage: { ...content.homepage, layoutSections: list },
    })
  }

  const resetLayoutSections = () => {
    if (!content) return
    if (confirm("Reset homepage section sequence to the default layout?")) {
      setContent({
        ...content,
        homepage: { ...content.homepage, layoutSections: [...DEFAULT_HOMEPAGE_LAYOUT] },
      })
    }
  }

  // Collection Reorder
  const moveCollection = (index: number, direction: "up" | "down") => {
    if (!content) return
    const list = [...(content.homepage.featuredCollections || [])]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return
    const item = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = item
    setContent({
      ...content,
      homepage: { ...content.homepage, featuredCollections: list },
    })
  }

  // Collection Carousel Section Reorder
  const moveSection = (index: number, direction: "up" | "down") => {
    if (!content) return
    const list = [...(content.homepage.collectionSections || [])]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return
    const item = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = item
    setContent({
      ...content,
      homepage: { ...content.homepage, collectionSections: list },
    })
  }

  // Featured Products Handlers
  const toggleCustomProduct = (productId: string) => {
    if (!content) return
    const currentIds = content.homepage.featuredProducts?.customProductIds || []
    const updatedIds = currentIds.includes(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId]

    setContent({
      ...content,
      homepage: {
        ...content.homepage,
        featuredProducts: {
          ...content.homepage.featuredProducts,
          customProductIds: updatedIds,
        },
      },
    })
  }

  const moveCustomProduct = (index: number, direction: "up" | "down") => {
    if (!content) return
    const list = [...(content.homepage.featuredProducts?.customProductIds || [])]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return
    const item = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = item
    setContent({
      ...content,
      homepage: {
        ...content.homepage,
        featuredProducts: {
          ...content.homepage.featuredProducts,
          customProductIds: list,
        },
      },
    })
  }

  // Filtered Catalog Products for Modal Picker
  const filteredCatalogProducts = useMemo(() => {
    return catalogProducts.filter((product) => {
      const matchSearch =
        !productPickerSearch ||
        product.name?.toLowerCase().includes(productPickerSearch.toLowerCase()) ||
        product.title?.toLowerCase().includes(productPickerSearch.toLowerCase()) ||
        product.sku?.toLowerCase().includes(productPickerSearch.toLowerCase())

      const matchCat =
        productPickerCategory === "all" ||
        product.category?.toLowerCase() === productPickerCategory.toLowerCase()

      return matchSearch && matchCat
    })
  }, [catalogProducts, productPickerSearch, productPickerCategory])

  // Dynamic list of available collection options for dropdown
  const availableCollectionsList = useMemo(() => {
    const defaultList = [
      { label: "Core Heavyweight", value: "core-heavyweight" },
      { label: "French Terry Fleece", value: "french-terry-fleece" },
      { label: "Parachute Cargos", value: "parachute-cargos" },
      { label: "Drop 04 Autumn", value: "drop-04-autumn" },
    ]
    if (content?.homepage?.featuredCollections) {
      for (const fc of content.homepage.featuredCollections) {
        if (fc.handle && !defaultList.some((d) => d.value === fc.handle)) {
          defaultList.push({ label: fc.title, value: fc.handle })
        }
      }
    }
    return defaultList
  }, [content])

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-zinc-500 font-mono text-xs">Loading CMS Studio...</div>
      </div>
    )
  }

  const hp = content.homepage
  const footer = content.footer
  const pages = content.pages
  const currentLayoutSections = hp.layoutSections || DEFAULT_HOMEPAGE_LAYOUT
  const fp = hp.featuredProducts || {
    badge: "High Velocity Rotation",
    heading: "Best Selling Streetwear",
    subheading: "Custom-milled 280–400 GSM luxury garments engineered for architectural structure.",
    viewAllText: "Browse All",
    viewAllLink: "/shop",
    mode: "auto",
    customProductIds: [],
    displayLimit: 8,
    columns: 4,
    autoCriteria: "best_sellers",
  }

  const getSectionIcon = (id: string) => {
    switch (id) {
      case "hero":
        return Sparkles
      case "brand_values":
        return Truck
      case "featured_collections":
        return Layers
      case "promo_banners":
        return Tag
      case "collection_carousels":
        return Package
      case "featured_products":
        return LayoutGrid
      case "material_science":
        return ShieldCheck
      default:
        return Layout
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
            Storefront Content Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            CMS Studio
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage homepage section ordering, visibility toggles, Best Sellers & Featured Products curation, banners, collections, and carousels.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-transform active:scale-95 shrink-0"
        >
          {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving Content..." : isSaved ? "Published!" : "Save Changes"}
        </button>
      </div>

      {/* Main CMS Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { key: "homepage", label: "Homepage Studio & Layout", icon: Layout },
          { key: "navigation", label: "Header & Navigation Menus", icon: Compass },
          { key: "footer", label: "Footer & Brand", icon: Globe },
          { key: "pages", label: "Store Pages & Policies", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeMainTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveMainTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: HOMEPAGE STUDIO */}
      {activeMainTab === "homepage" && (
        <div className="space-y-8 animate-in fade-in">
          {/* 1. HOMEPAGE SECTION LAYOUT & SEQUENCE REORDER STUDIO */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold uppercase text-white font-display">
                    Homepage Layout & Section Sequencer
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Rearrange the sequence in which sections appear on the live website, and toggle visibility on or off.
                </p>
              </div>

              <button
                type="button"
                onClick={resetLayoutSections}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <RotateCcw className="h-3 w-3" /> Reset Sequence
              </button>
            </div>

            {/* Reorderable Section Items List */}
            <div className="space-y-2.5">
              {currentLayoutSections.map((sec, idx) => {
                const IconComponent = getSectionIcon(sec.id)
                const isEnabled = sec.enabled !== false
                return (
                  <div
                    key={sec.id || idx}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isEnabled
                        ? "bg-zinc-950 border-zinc-800 shadow-sm"
                        : "bg-zinc-950/40 border-zinc-800/50 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Position Badge */}
                      <span className="h-7 w-7 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-white shrink-0">
                        #{idx + 1}
                      </span>

                      {/* Icon */}
                      <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-accent shrink-0">
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate">
                            {sec.name}
                          </h4>
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              isEnabled
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}
                          >
                            {isEnabled ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {sec.description}
                        </p>
                      </div>
                    </div>

                    {/* Controls: Reorder & Toggle */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveLayoutSection(idx, "up")}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-25 text-zinc-400 hover:text-white transition-colors"
                          title="Move Up on Homepage"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === currentLayoutSections.length - 1}
                          onClick={() => moveLayoutSection(idx, "down")}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-25 text-zinc-400 hover:text-white transition-colors"
                          title="Move Down on Homepage"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Visibility Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleLayoutSectionVisibility(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 border transition-all ${
                          isEnabled
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                        }`}
                      >
                        {isEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        <span>{isEnabled ? "Hide Section" : "Show Section"}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
                <Bell className="h-4 w-4 text-accent" />
                Storefront Announcement Bar
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-300 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={hp.announcement.active}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        announcement: { ...hp.announcement, active: e.target.checked },
                      },
                    })
                  }
                  className="rounded bg-zinc-950 border-zinc-800 text-accent focus:ring-accent"
                />
                <span>Active on Storefront</span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-medium">Announcement Message</label>
                <input
                  type="text"
                  value={hp.announcement.text}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        announcement: { ...hp.announcement, text: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-medium">Link Destination (Optional)</label>
                <input
                  type="text"
                  placeholder="/shop or /collections/core-heavyweight"
                  value={hp.announcement.link || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        announcement: { ...hp.announcement, link: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#9A0000]"
                />
              </div>

              {/* Live Preview */}
              {hp.announcement.text && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Live Preview (Color: #9A0000)
                  </span>
                  <div className="bg-[#9A0000] text-white text-[11px] py-2 px-4 rounded-xl text-center font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2">
                    <span>{hp.announcement.text}</span>
                    {hp.announcement.link && (
                      <span className="text-[9px] bg-black/30 px-2 py-0.5 rounded text-zinc-200">
                        🔗 {hp.announcement.link}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
                <Sparkles className="h-4 w-4 text-accent" />
                Main Hero Section
              </div>
            </div>

            {/* Hero Image Uploader Component */}
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-2">
                Hero Background Banner
              </label>
              <HeroBannerImageUploader
                currentImageUrl={hp.hero.bannerImage}
                onChange={(url) =>
                  setContent({
                    ...content,
                    homepage: {
                      ...hp,
                      hero: { ...hp.hero, bannerImage: url },
                    },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium">Hero Badge Tag</label>
                <input
                  type="text"
                  value={hp.hero.badge || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        hero: { ...hp.hero, badge: e.target.value },
                      },
                    })
                  }
                  placeholder="e.g. Drop 04 // Live Across India (Leave empty to hide badge)"
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Headline Title</label>
                <input
                  type="text"
                  value={hp.hero.headline}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        hero: { ...hp.hero, headline: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-black uppercase font-display"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-zinc-400 font-medium">Hero Subheadline</label>
                <textarea
                  rows={2}
                  value={hp.hero.subheadline}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        hero: { ...hp.hero, subheadline: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Primary CTA Button Text</label>
                <input
                  type="text"
                  value={hp.hero.ctaText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        hero: { ...hp.hero, ctaText: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Primary CTA Link</label>
                <input
                  type="text"
                  value={hp.hero.ctaLink}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        hero: { ...hp.hero, ctaLink: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Secondary CTA Button Text</label>
                <input
                  type="text"
                  value={hp.hero.secondaryCtaText || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        hero: { ...hp.hero, secondaryCtaText: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Secondary CTA Link</label>
                <input
                  type="text"
                  value={hp.hero.secondaryCtaLink || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      homepage: {
                        ...hp,
                        hero: { ...hp.hero, secondaryCtaLink: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* HOMEPAGE COLLECTION CAROUSELS & PRODUCT SHOWCASES */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-bold uppercase text-white font-display">
                    Homepage Collection Carousels ({hp.collectionSections?.length || 0})
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Add dynamic product carousels to the homepage assigned to specific capsule collections.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingSection({
                    id: `cs_${Date.now()}`,
                    badge: "New Capsule Drop",
                    heading: "New Collection Drop",
                    subheading: "Explore engineered luxury streetwear from this exclusive drop.",
                    collectionHandle: "core-heavyweight",
                    viewAllLink: "/collections/core-heavyweight",
                    active: true,
                  })
                  setIsSectionModalOpen(true)
                }}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-accent/20 transition-transform active:scale-95 shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Collection Section
              </button>
            </div>

            {/* List of Collection Carousel Sections */}
            <div className="space-y-3">
              {(!hp.collectionSections || hp.collectionSections.length === 0) ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No collection carousel sections added yet. Click &quot;Add Collection Section&quot; to create one.
                </div>
              ) : (
                hp.collectionSections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      sec.active !== false
                        ? "bg-zinc-950 border-zinc-800 shadow-sm"
                        : "bg-zinc-950/40 border-zinc-800/50 opacity-60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {sec.badge && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-full">
                            {sec.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                          Collection: /{sec.collectionHandle}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            sec.active !== false
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {sec.active !== false ? "Visible in Storefront" : "Disabled"}
                        </span>
                      </div>
                      <h4 className="text-sm font-black uppercase text-white font-display">
                        {sec.heading}
                      </h4>
                      {sec.subheading && (
                        <p className="text-xs text-zinc-400 line-clamp-1">{sec.subheading}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Reorder */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, "up")}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (hp.collectionSections?.length || 0) - 1}
                          onClick={() => moveSection(idx, "down")}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Active Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(hp.collectionSections || [])]
                          updated[idx] = { ...sec, active: !sec.active }
                          setContent({
                            ...content,
                            homepage: { ...hp, collectionSections: updated },
                          })
                        }}
                        className={`p-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1 border ${
                          sec.active !== false
                            ? "bg-zinc-900 text-emerald-400 border-zinc-800 hover:bg-zinc-800"
                            : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                        }`}
                      >
                        {sec.active !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSection({ ...sec })
                          setIsSectionModalOpen(true)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove collection section "${sec.heading}"?`)) {
                            const updated = (hp.collectionSections || []).filter((_, i) => i !== idx)
                            setContent({
                              ...content,
                              homepage: { ...hp, collectionSections: updated },
                            })
                          }
                        }}
                        className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FEATURED COLLECTIONS MANAGER */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-bold uppercase text-white font-display">
                    Featured Collections Showcased on Homepage
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Customize drop tiles, titles, collection slugs, images, and ordering on the live storefront.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCollection({
                    id: `fc_${Date.now()}`,
                    title: "New Featured Collection",
                    handle: "new-collection",
                    badge: "Drop Edition",
                    description: "High-density custom knit streetwear designed for luxury drape.",
                    image:
                      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
                    enabled: true,
                  })
                  setIsCollectionModalOpen(true)
                }}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-accent/20 transition-transform active:scale-95 shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Featured Collection
              </button>
            </div>

            {/* Collections Grid in Admin Studio */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hp.featuredCollections?.map((col, index) => (
                <div
                  key={col.id || index}
                  className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                    col.enabled !== false
                      ? "bg-zinc-950/80 border-zinc-800 shadow-md"
                      : "bg-zinc-950/40 border-zinc-800/50 opacity-60"
                  }`}
                >
                  {/* Card Visual Header with Image Preview */}
                  <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden group">
                    <Image
                      src={
                        col.image ||
                        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={col.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Top Badges: Status + Custom Tag */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${
                          col.enabled !== false
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {col.enabled !== false ? "Visible on Homepage" : "Hidden"}
                      </span>

                      {col.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 backdrop-blur-md">
                          {col.badge}
                        </span>
                      )}
                    </div>

                    {/* Bottom Preview Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                      <h4 className="text-base font-black uppercase text-white font-display line-clamp-1">
                        {col.title}
                      </h4>
                      <p className="text-[11px] text-zinc-300 line-clamp-1">{col.description}</p>
                    </div>
                  </div>

                  {/* Card Meta & Control Bar */}
                  <div className="p-4 space-y-3 bg-zinc-950">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono text-[11px]">
                        URL: /collections/{col.handle}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...hp.featuredCollections]
                          updated[index] = { ...col, enabled: !col.enabled }
                          setContent({
                            ...content,
                            homepage: { ...hp, featuredCollections: updated },
                          })
                        }}
                        className={`text-[11px] font-bold uppercase flex items-center gap-1 ${
                          col.enabled !== false ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {col.enabled !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {col.enabled !== false ? "Active" : "Disabled"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveCollection(index, "up")}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === (hp.featuredCollections?.length || 0) - 1}
                          onClick={() => moveCollection(index, "down")}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCollection({ ...col })
                            setIsCollectionModalOpen(true)
                          }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove "${col.title}" from featured collections?`)) {
                              const updated = hp.featuredCollections.filter((_, i) => i !== index)
                              setContent({
                                ...content,
                                homepage: { ...hp, featuredCollections: updated },
                              })
                            }
                          }}
                          className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 transition-colors"
                          title="Delete Collection"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. BEST SELLERS & FEATURED PRODUCTS CUSTOMIZATION STUDIO (SHIFTED HERE) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold uppercase text-white font-display">
                    Best Sellers & Featured Products Customization
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure section typography, curation mode (auto smart criteria or handpicked products), display limits, and grid layout.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                  {fp.mode === "custom" ? `Custom (${fp.customProductIds?.length || 0} Products)` : "Auto Smart Rotation"}
                </span>
              </div>
            </div>

            {/* Typography & Headers */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-accent" /> Section Headers & Destination
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-400 font-medium">Badge Tag</label>
                  <input
                    type="text"
                    value={fp.badge || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        homepage: {
                          ...hp,
                          featuredProducts: { ...fp, badge: e.target.value },
                        },
                      })
                    }
                    placeholder="e.g. HIGH VELOCITY ROTATION or BEST SELLERS"
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">Main Heading Title *</label>
                  <input
                    type="text"
                    required
                    value={fp.heading}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        homepage: {
                          ...hp,
                          featuredProducts: { ...fp, heading: e.target.value },
                        },
                      })
                    }
                    placeholder="e.g. Best Selling Streetwear"
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-black uppercase font-display"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-zinc-400 font-medium">Subheading & Craft Narrative</label>
                  <textarea
                    rows={2}
                    value={fp.subheading}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        homepage: {
                          ...hp,
                          featuredProducts: { ...fp, subheading: e.target.value },
                        },
                      })
                    }
                    placeholder="Brief description of the featured garments..."
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">&quot;View All&quot; Button Label</label>
                  <input
                    type="text"
                    value={fp.viewAllText || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        homepage: {
                          ...hp,
                          featuredProducts: { ...fp, viewAllText: e.target.value },
                        },
                      })
                    }
                    placeholder="e.g. Browse All or Explore Drop"
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">&quot;View All&quot; Destination Link</label>
                  <input
                    type="text"
                    value={fp.viewAllLink || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        homepage: {
                          ...hp,
                          featuredProducts: { ...fp, viewAllLink: e.target.value },
                        },
                      })
                    }
                    placeholder="/shop or /collections/core-heavyweight"
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Display & Layout Settings */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-accent" /> Layout & Limit Settings
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-400 font-medium">Max Products Display Limit</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[4, 8, 12, 16].map((limit) => (
                      <button
                        key={limit}
                        type="button"
                        onClick={() =>
                          setContent({
                            ...content,
                            homepage: {
                              ...hp,
                              featuredProducts: { ...fp, displayLimit: limit },
                            },
                          })
                        }
                        className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                          (fp.displayLimit || 8) === limit
                            ? "bg-accent text-white shadow-md shadow-accent/20"
                            : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {limit} Items
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">Grid Column Count</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { cols: 2, label: "2 Columns" },
                      { cols: 3, label: "3 Columns" },
                      { cols: 4, label: "4 Columns (Default)" },
                    ].map((c) => (
                      <button
                        key={c.cols}
                        type="button"
                        onClick={() =>
                          setContent({
                            ...content,
                            homepage: {
                              ...hp,
                              featuredProducts: { ...fp, columns: c.cols as 2 | 3 | 4 },
                            },
                          })
                        }
                        className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                          (fp.columns || 4) === c.cols
                            ? "bg-accent text-white shadow-md shadow-accent/20"
                            : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Curation Mode */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-accent" /> Product Curation & Selection Mode
                </h4>

                <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() =>
                      setContent({
                        ...content,
                        homepage: {
                          ...hp,
                          featuredProducts: { ...fp, mode: "auto" },
                        },
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                      fp.mode === "auto"
                        ? "bg-accent text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    🔄 Auto Rotation
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setContent({
                        ...content,
                        homepage: {
                          ...hp,
                          featuredProducts: { ...fp, mode: "custom" },
                        },
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                      fp.mode === "custom"
                        ? "bg-accent text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    🎯 Handpicked Custom
                  </button>
                </div>
              </div>

              {/* Mode 1: Auto Rotation Criteria */}
              {fp.mode === "auto" && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold uppercase text-white">
                        Automated Smart Selection Criteria
                      </h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Products are automatically pulled and dynamically sorted based on live catalog attributes.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { key: "best_sellers", label: "Best Sellers First", desc: "Showcases tagged best-selling garments" },
                      { key: "new_arrivals", label: "Newest Drops", desc: "Prioritizes newest drop arrivals" },
                      { key: "price_high", label: "Price: High to Low", desc: "Luxury heavyweight pieces first" },
                      { key: "price_low", label: "Price: Low to High", desc: "Entry-tier essentials first" },
                    ].map((opt) => {
                      const isSelected = (fp.autoCriteria || "best_sellers") === opt.key
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            setContent({
                              ...content,
                              homepage: {
                                ...hp,
                                featuredProducts: { ...fp, autoCriteria: opt.key as any },
                              },
                            })
                          }
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-accent/10 border-accent text-white shadow-sm"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white uppercase">{opt.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                          </div>
                          <p className="text-[10px] text-zinc-500 line-clamp-2">{opt.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Mode 2: Custom Product Picker */}
              {fp.mode === "custom" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold uppercase text-white">
                        Curated Products ({fp.customProductIds?.length || 0} Selected)
                      </h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Arrange and select specific products from the catalog to showcase on the homepage.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsProductPickerModalOpen(true)}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl flex items-center gap-2 shadow-md shadow-accent/20 transition-transform active:scale-95 shrink-0"
                    >
                      <Plus className="h-4 w-4" /> Pick Products from Catalog
                    </button>
                  </div>

                  {/* Selected Products List */}
                  {(!fp.customProductIds || fp.customProductIds.length === 0) ? (
                    <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl space-y-2">
                      <Package className="h-6 w-6 text-zinc-600 mx-auto" />
                      <p className="text-xs text-zinc-400">No products selected yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsProductPickerModalOpen(true)}
                        className="text-xs text-accent font-bold uppercase hover:underline"
                      >
                        + Open Catalog Product Picker
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {fp.customProductIds.map((id, idx) => {
                        const product = catalogProducts.find((p) => p.id === id) || {
                          id,
                          name: id,
                          price: 0,
                          images: [],
                          category: "Garment",
                        }
                        const thumbnail =
                          product.thumbnail ||
                          (product.images && product.images[0]?.url) ||
                          (product.images && typeof product.images[0] === "string" ? product.images[0] : null) ||
                          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80"

                        return (
                          <div
                            key={id}
                            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="h-6 w-6 rounded-lg bg-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">
                                #{idx + 1}
                              </span>
                              <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-950 shrink-0">
                                <Image
                                  src={thumbnail}
                                  alt={product.name || product.title || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h6 className="text-xs font-bold text-white uppercase truncate">
                                  {product.name || product.title}
                                </h6>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                  <span>₹{product.price?.toLocaleString("en-IN") || "0"}</span>
                                  {product.category && <span>• {product.category}</span>}
                                  {product.gsm && <span>• {product.gsm} GSM</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveCustomProduct(idx, "up")}
                                className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 disabled:opacity-25 text-zinc-400 hover:text-white"
                                title="Move Up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === fp.customProductIds.length - 1}
                                onClick={() => moveCustomProduct(idx, "down")}
                                className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 disabled:opacity-25 text-zinc-400 hover:text-white"
                                title="Move Down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleCustomProduct(id)}
                                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 ml-1"
                                title="Remove from Featured"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Promotional Banners */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold uppercase text-white font-display">
                  Promotional Banners & Cards ({hp.promoBanners?.length || 0})
                </h3>
                <p className="text-xs text-zinc-400">Featured promo tiles on the homepage.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPromo({
                    id: `promo_${Date.now()}`,
                    badge: "EXCLUSIVE DROP",
                    title: "NEW HEAVYWEIGHT COLLECTION",
                    subtitle: "Crafted with 280-400 GSM custom fabrics.",
                    ctaText: "Shop Collection",
                    ctaLink: "/shop",
                    image:
                      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
                    active: true,
                  })
                  setIsPromoModalOpen(true)
                }}
                className="px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Promo Banner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hp.promoBanners?.map((promo) => (
                <div
                  key={promo.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded">
                      {promo.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingPromo({ ...promo })
                          setIsPromoModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setContent({
                            ...content,
                            homepage: {
                              ...hp,
                              promoBanners: hp.promoBanners.filter((b) => b.id !== promo.id),
                            },
                          })
                        }
                        className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase">{promo.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{promo.subtitle}</p>
                  <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2 border-t border-zinc-900 pt-2">
                    <span>CTA: {promo.ctaText}</span>
                    <span>→ {promo.ctaLink}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEADER & NAVIGATION MENUS STUDIO */}
      {activeMainTab === "navigation" && content && (
        <div className="space-y-8 animate-in fade-in">
          <NavigationStudio
            content={content}
            onChange={setContent}
            onSave={() => handleSave()}
            isSaving={isSaving}
            isSaved={isSaved}
          />
        </div>
      )}

      {/* TAB 3: FOOTER STUDIO */}
      {activeMainTab === "footer" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Brand Story & Newsletter */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <h3 className="text-sm font-bold uppercase text-white font-display pb-3 border-b border-zinc-800">
              Footer Brand Narrative & Newsletter
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium">Brand Bio Description</label>
                <textarea
                  rows={2}
                  value={footer.brandBio}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...footer, brandBio: e.target.value },
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Studio / Mill Location Text</label>
                <input
                  type="text"
                  value={footer.locationText || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...footer, locationText: e.target.value },
                    })
                  }
                  placeholder="e.g. Tirupur Textile Mills & Bandra Design Studio, Mumbai (Leave empty to hide)"
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 font-medium">Newsletter Headline</label>
                  <input
                    type="text"
                    value={footer.newsletterTitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: { ...footer, newsletterTitle: e.target.value },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-medium">Newsletter Subtitle</label>
                  <input
                    type="text"
                    value={footer.newsletterSubtitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: { ...footer, newsletterSubtitle: e.target.value },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Channels & Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h4 className="text-sm font-bold uppercase text-white pb-2 border-b border-zinc-800">
                Official Social Channels
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400">Instagram URL</label>
                  <input
                    type="url"
                    value={footer.socialLinks?.instagram || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: {
                          ...footer,
                          socialLinks: { ...footer.socialLinks, instagram: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">Twitter / X URL</label>
                  <input
                    type="url"
                    value={footer.socialLinks?.twitter || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: {
                          ...footer,
                          socialLinks: { ...footer.socialLinks, twitter: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">YouTube Channel URL</label>
                  <input
                    type="url"
                    value={footer.socialLinks?.youtube || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: {
                          ...footer,
                          socialLinks: { ...footer.socialLinks, youtube: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h4 className="text-sm font-bold uppercase text-white pb-2 border-b border-zinc-800">
                Customer Care & Contact Information
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400">Support Email</label>
                  <input
                    type="email"
                    value={footer.contactInfo?.email || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: {
                          ...footer,
                          contactInfo: { ...footer.contactInfo, email: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">WhatsApp / Phone Number</label>
                  <input
                    type="text"
                    value={footer.contactInfo?.phone || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: {
                          ...footer,
                          contactInfo: { ...footer.contactInfo, phone: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">Operating Hours</label>
                  <input
                    type="text"
                    value={footer.contactInfo?.hours || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: {
                          ...footer,
                          contactInfo: { ...footer.contactInfo, hours: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAGES & POLICIES STUDIO */}
      {activeMainTab === "pages" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Sub-selector for Page */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl overflow-x-auto text-xs">
            {[
              { key: "about", label: "About Story" },
              { key: "contact", label: "Contact Concierge" },
              { key: "faq", label: `FAQ Studio (${pages.faq?.items?.length || 0})` },
              { key: "shipping", label: "Shipping Policy" },
              { key: "returns", label: "Returns Policy" },
              { key: "privacy", label: "Privacy Policy" },
              { key: "terms", label: "Terms of Service" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setActivePageTab(p.key as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                  activePageTab === p.key
                    ? "bg-accent text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* About Page */}
          {activePageTab === "about" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
              <h3 className="text-sm font-bold uppercase text-white font-display pb-3 border-b border-zinc-800">
                About Us Page Content
              </h3>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400">Badge Label</label>
                    <input
                      type="text"
                      value={pages.about.badge}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          pages: { ...pages, about: { ...pages.about, badge: e.target.value } },
                        })
                      }
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400">Main Title</label>
                    <input
                      type="text"
                      value={pages.about.title}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          pages: { ...pages, about: { ...pages.about, title: e.target.value } },
                        })
                      }
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400">Subtitle</label>
                  <textarea
                    rows={2}
                    value={pages.about.subtitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        pages: { ...pages, about: { ...pages.about, subtitle: e.target.value } },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400">Textile Heritage Narrative Title</label>
                  <input
                    type="text"
                    value={pages.about.storyTitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        pages: { ...pages, about: { ...pages.about, storyTitle: e.target.value } },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-zinc-400">Narrative Body (Paragraph 1)</label>
                  <textarea
                    rows={3}
                    value={pages.about.storyBody1}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        pages: { ...pages, about: { ...pages.about, storyBody1: e.target.value } },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400">Narrative Body (Paragraph 2)</label>
                  <textarea
                    rows={3}
                    value={pages.about.storyBody2}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        pages: { ...pages, about: { ...pages.about, storyBody2: e.target.value } },
                      })
                    }
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FAQ Studio */}
          {activePageTab === "faq" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white font-display">
                    Frequently Asked Questions ({pages.faq?.items?.length || 0})
                  </h3>
                  <p className="text-xs text-zinc-400">Add, organize, and edit customer FAQs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingFaq({
                      id: `faq_${Date.now()}`,
                      category: "Fabric, GSM & Quality",
                      question: "",
                      answer: "",
                    })
                    setIsFaqModalOpen(true)
                  }}
                  className="px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" /> Add FAQ
                </button>
              </div>

              <div className="space-y-3">
                {pages.faq?.items?.map((faq, i) => (
                  <div
                    key={faq.id || i}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                      <h4 className="text-xs font-bold text-white pt-1">{faq.question}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingFaq({ ...faq })
                          setIsFaqModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const updated = pages.faq.items.filter((item) => item.id !== faq.id)
                          setContent({
                            ...content,
                            pages: { ...pages, faq: { ...pages.faq, items: updated } },
                            faqItems: updated,
                          })
                        }}
                        className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policy Pages (Shipping, Returns, Privacy, Terms) */}
          {["shipping", "returns", "privacy", "terms"].includes(activePageTab) && (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
              {(() => {
                const currentPolicy = pages[activePageTab as "shipping" | "returns" | "privacy" | "terms"]
                return (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div>
                        <h3 className="text-sm font-bold uppercase text-white font-display">
                          {currentPolicy.title}
                        </h3>
                        <p className="text-xs text-zinc-400">Manage legal clauses and customer policy terms.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newSections = [
                            ...(currentPolicy.sections || []),
                            {
                              id: `sec_${Date.now()}`,
                              title: `${(currentPolicy.sections?.length || 0) + 1}. New Clause Title`,
                              content: "Enter detailed policy clause terms here...",
                            },
                          ]
                          setContent({
                            ...content,
                            pages: {
                              ...pages,
                              [activePageTab]: {
                                ...currentPolicy,
                                sections: newSections,
                              },
                            },
                          })
                        }}
                        className="px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Policy Clause
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-zinc-400 font-medium">Page Title</label>
                        <input
                          type="text"
                          value={currentPolicy.title}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              pages: {
                                ...pages,
                                [activePageTab]: { ...currentPolicy, title: e.target.value },
                              },
                            })
                          }
                          className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-medium">Last Updated Date</label>
                        <input
                          type="text"
                          value={currentPolicy.lastUpdated}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              pages: {
                                ...pages,
                                [activePageTab]: { ...currentPolicy, lastUpdated: e.target.value },
                              },
                            })
                          }
                          className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Policy Clauses List */}
                    <div className="space-y-4 pt-2">
                      <span className="text-xs font-bold text-zinc-300 block">Policy Clauses</span>
                      {currentPolicy.sections?.map((sec, sIdx) => (
                        <div
                          key={sec.id || sIdx}
                          className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => {
                                const updated = [...currentPolicy.sections]
                                updated[sIdx].title = e.target.value
                                setContent({
                                  ...content,
                                  pages: {
                                    ...pages,
                                    [activePageTab]: { ...currentPolicy, sections: updated },
                                  },
                                })
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentPolicy.sections.filter((_, i) => i !== sIdx)
                                setContent({
                                  ...content,
                                  pages: {
                                    ...pages,
                                    [activePageTab]: { ...currentPolicy, sections: updated },
                                  },
                                })
                              }}
                              className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={sec.content}
                            onChange={(e) => {
                              const updated = [...currentPolicy.sections]
                              updated[sIdx].content = e.target.value
                              setContent({
                                ...content,
                                pages: {
                                  ...pages,
                                  [activePageTab]: { ...currentPolicy, sections: updated },
                                },
                              })
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT PICKER MODAL FOR BEST SELLERS & FEATURED PRODUCTS */}
      {isProductPickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-black text-white uppercase font-display">
                    Catalog Product Picker
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select products from your catalog to feature on the homepage ({fp.customProductIds?.length || 0} currently selected).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsProductPickerModalOpen(false)}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase rounded-xl shadow-md"
              >
                Done
              </button>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search products by title, SKU or fabric..."
                  value={productPickerSearch}
                  onChange={(e) => setProductPickerSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {["all", "tees", "hoodies", "cargos", "jackets"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setProductPickerCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-colors ${
                      productPickerCategory === cat
                        ? "bg-accent text-white"
                        : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Selection List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredCatalogProducts.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-500">
                  No products matched your search or category filter.
                </div>
              ) : (
                filteredCatalogProducts.map((product) => {
                  const isSelected = fp.customProductIds?.includes(product.id)
                  const thumbnail =
                    product.thumbnail ||
                    (product.images && product.images[0]?.url) ||
                    (product.images && typeof product.images[0] === "string" ? product.images[0] : null) ||
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80"

                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleCustomProduct(product.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-accent/10 border-accent/60 shadow-md shadow-accent/5"
                          : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                          <Image
                            src={thumbnail}
                            alt={product.name || product.title || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs sm:text-sm font-bold text-white uppercase truncate">
                              {product.name || product.title}
                            </h5>
                            {product.gsm && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                {product.gsm} GSM
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                            <span className="font-bold text-accent">₹{product.price?.toLocaleString("en-IN") || "0"}</span>
                            {product.category && <span>• {product.category}</span>}
                            {product.sku && <span className="font-mono text-zinc-500">• SKU: {product.sku}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold uppercase shadow-sm">
                            <Check className="h-3.5 w-3.5" /> Selected
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase transition-colors">
                            <Plus className="h-3.5 w-3.5" /> Add
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <span className="text-xs text-zinc-400">
                {fp.customProductIds?.length || 0} products selected for homepage rotation
              </span>
              <button
                type="button"
                onClick={() => setIsProductPickerModalOpen(false)}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLECTION CAROUSEL SECTION MODAL (ADD / EDIT) */}
      {isSectionModalOpen && editingSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-black text-white uppercase font-display">
                  Collection Carousel Editor
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSection.active !== false}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, active: e.target.checked })
                  }
                  className="rounded bg-zinc-950 border-zinc-800 text-accent focus:ring-accent"
                />
                <span>Visible on Homepage</span>
              </label>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium">Section Heading Title *</label>
                <input
                  type="text"
                  required
                  value={editingSection.heading}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, heading: e.target.value })
                  }
                  placeholder="e.g. Winter 400 GSM Drop or Core Heavyweight Capsule"
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Badge Tag (Optional)</label>
                <input
                  type="text"
                  value={editingSection.badge || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, badge: e.target.value })
                  }
                  placeholder="e.g. 280 GSM Essentials, Curated Drop, Limited Release"
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Subheading & Craft Narrative</label>
                <textarea
                  rows={2}
                  value={editingSection.subheading || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, subheading: e.target.value })
                  }
                  placeholder="Brief description of the garments in this carousel..."
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white leading-relaxed"
                />
              </div>

              {/* Assigned Collection Picker */}
              <div>
                <label className="text-zinc-400 font-medium flex items-center justify-between">
                  <span>Assign to Collection *</span>
                  <span className="text-[10px] text-zinc-500">Filters products into this carousel</span>
                </label>
                <select
                  value={editingSection.collectionHandle}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      collectionHandle: e.target.value,
                      viewAllLink: `/collections/${e.target.value}`,
                    })
                  }
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                >
                  {availableCollectionsList.map((col) => (
                    <option key={col.value} value={col.value}>
                      {col.label} (/{col.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Custom Destination / View All URL</label>
                <input
                  type="text"
                  value={editingSection.viewAllLink || `/collections/${editingSection.collectionHandle}`}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, viewAllLink: e.target.value })
                  }
                  placeholder="/collections/core-heavyweight or /shop"
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentSections = hp.collectionSections || []
                  const existingIdx = currentSections.findIndex((s) => s.id === editingSection.id)
                  let updated = [...currentSections]
                  if (existingIdx >= 0) {
                    updated[existingIdx] = editingSection
                  } else {
                    updated.push(editingSection)
                  }
                  setContent({
                    ...content,
                    homepage: { ...hp, collectionSections: updated },
                  })
                  setIsSectionModalOpen(false)
                }}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-extrabold uppercase shadow-lg shadow-accent/20"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURED COLLECTION MODAL (EDIT / CUSTOMIZE) */}
      {isCollectionModalOpen && editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-black text-white uppercase font-display">
                  Featured Collection Editor
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCollection.enabled !== false}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, enabled: e.target.checked })
                  }
                  className="rounded bg-zinc-950 border-zinc-800 text-accent focus:ring-accent"
                />
                <span>Show on Homepage</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left Column: Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 font-medium">Collection Title *</label>
                  <input
                    type="text"
                    required
                    value={editingCollection.title}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, title: e.target.value })
                    }
                    placeholder="e.g. Core Heavyweight Series"
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-medium">Slug Handle *</label>
                    <input
                      type="text"
                      required
                      value={editingCollection.handle}
                      onChange={(e) =>
                        setEditingCollection({ ...editingCollection, handle: e.target.value })
                      }
                      placeholder="e.g. core-heavyweight"
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-medium">Badge Tag (Optional)</label>
                    <input
                      type="text"
                      value={editingCollection.badge || ""}
                      onChange={(e) =>
                        setEditingCollection({ ...editingCollection, badge: e.target.value })
                      }
                      placeholder="e.g. 280 GSM Cotton"
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">Description</label>
                  <textarea
                    rows={2}
                    value={editingCollection.description}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, description: e.target.value })
                    }
                    placeholder="Brief description of the garments in this drop..."
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white leading-relaxed"
                  />
                </div>

                {/* Direct Image Upload and URL Input */}
                <div className="space-y-2">
                  <label className="text-zinc-400 font-medium flex items-center justify-between">
                    <span>Card Cover Image</span>
                    {isUploadingColImg && (
                      <span className="text-[10px] text-accent flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                      </span>
                    )}
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCollection.image}
                      onChange={(e) =>
                        setEditingCollection({ ...editingCollection, image: e.target.value })
                      }
                      placeholder="https://... or upload below"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-white font-mono"
                    />
                    <input
                      type="file"
                      ref={colFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleCollectionImageUpload(file)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => colFileInputRef.current?.click()}
                      disabled={isUploadingColImg}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload File
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Card Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Live Card Preview
                </span>

                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 flex flex-col justify-end p-6 shadow-xl">
                  {editingCollection.image && (
                    <Image
                      src={editingCollection.image}
                      alt={editingCollection.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                  <div className="relative z-10 space-y-2 pointer-events-none">
                    {editingCollection.badge && (
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-accent/20 border border-accent/40 text-accent px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        {editingCollection.badge}
                      </span>
                    )}
                    <h4 className="text-lg font-black uppercase text-white font-display">
                      {editingCollection.title || "Collection Title"}
                    </h4>
                    <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                      {editingCollection.description || "Collection description will appear here..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCollectionModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingIdx = hp.featuredCollections?.findIndex(
                    (c) => c.id === editingCollection.id
                  )
                  let updated = [...(hp.featuredCollections || [])]
                  if (existingIdx !== undefined && existingIdx >= 0) {
                    updated[existingIdx] = editingCollection
                  } else {
                    updated.push(editingCollection)
                  }
                  setContent({
                    ...content,
                    homepage: { ...hp, featuredCollections: updated },
                  })
                  setIsCollectionModalOpen(false)
                }}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-extrabold uppercase shadow-lg shadow-accent/20"
              >
                Save Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-black text-white uppercase font-display">FAQ Item Editor</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium">Category</label>
                <select
                  value={editingFaq.category}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs"
                >
                  <option value="Fabric, GSM & Quality">Fabric, GSM & Quality</option>
                  <option value="Shipping & Delivery">Shipping & Delivery</option>
                  <option value="Returns & Exchanges">Returns & Exchanges</option>
                  <option value="Payments & COD">Payments & COD</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Question</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Answer</label>
                <textarea
                  rows={4}
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingIdx = pages.faq.items.findIndex((item) => item.id === editingFaq.id)
                  let updated = [...pages.faq.items]
                  if (existingIdx >= 0) {
                    updated[existingIdx] = editingFaq
                  } else {
                    updated.unshift(editingFaq)
                  }
                  setContent({
                    ...content,
                    pages: { ...pages, faq: { ...pages.faq, items: updated } },
                    faqItems: updated,
                  })
                  setIsFaqModalOpen(false)
                }}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-extrabold uppercase shadow-lg shadow-accent/20"
              >
                Save FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Banner Modal */}
      {isPromoModalOpen && editingPromo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-black text-white uppercase font-display">Promo Banner Editor</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium">Badge Text</label>
                <input
                  type="text"
                  value={editingPromo.badge}
                  onChange={(e) => setEditingPromo({ ...editingPromo, badge: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Headline</label>
                <input
                  type="text"
                  value={editingPromo.title}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-black uppercase"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Subtitle / Offer Details</label>
                <textarea
                  rows={2}
                  value={editingPromo.subtitle}
                  onChange={(e) => setEditingPromo({ ...editingPromo, subtitle: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 font-medium">CTA Button</label>
                  <input
                    type="text"
                    value={editingPromo.ctaText}
                    onChange={(e) => setEditingPromo({ ...editingPromo, ctaText: e.target.value })}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-medium">CTA Destination</label>
                  <input
                    type="text"
                    value={editingPromo.ctaLink}
                    onChange={(e) => setEditingPromo({ ...editingPromo, ctaLink: e.target.value })}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium">Background Image URL</label>
                <input
                  type="url"
                  value={editingPromo.image}
                  onChange={(e) => setEditingPromo({ ...editingPromo, image: e.target.value })}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingIdx = hp.promoBanners.findIndex((p) => p.id === editingPromo.id)
                  let updated = [...hp.promoBanners]
                  if (existingIdx >= 0) {
                    updated[existingIdx] = editingPromo
                  } else {
                    updated.unshift(editingPromo)
                  }
                  setContent({
                    ...content,
                    homepage: { ...hp, promoBanners: updated },
                  })
                  setIsPromoModalOpen(false)
                }}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-extrabold uppercase shadow-lg shadow-accent/20"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
