export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles, Tag } from "@/components/ui/Icons"
import { ProductCard } from "@/components/product/ProductCard"
import { CollectionProductCarousel } from "@/components/home/CollectionProductCarousel"
import { getProducts, getCollections } from "@/lib/store-api"
import { contentStore, DEFAULT_HOMEPAGE_LAYOUT } from "@/lib/content-store"
import { JsonLd } from "@/components/ui/JsonLd"
import { generateOrganizationJsonLd } from "@/lib/seo"

export default async function HomePage() {
  const [allProducts, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ])

  const content = contentStore.getContent()
  const hp = content.homepage || content

  // Filter collections if enabled in CMS
  const activeCollections =
    hp.featuredCollections && hp.featuredCollections.length > 0
      ? hp.featuredCollections.filter((c) => c.enabled !== false)
      : collections

  // Dynamic Collection Carousels
  const collectionSections =
    hp.collectionSections?.filter((s) => s.active !== false) || []

  // Featured / Best Seller Products Resolution
  let featuredProductsList: typeof allProducts = []
  const fpConfig = hp.featuredProducts || {}

  if (fpConfig.mode === "custom" && fpConfig.customProductIds?.length > 0) {
    const productMap = new Map(allProducts.map((p) => [p.id, p]))
    featuredProductsList = fpConfig.customProductIds
      .map((id: string) => productMap.get(id))
      .filter(Boolean) as typeof allProducts
  } else {
    const criteria = fpConfig.autoCriteria || "best_sellers"
    if (criteria === "new_arrivals") {
      featuredProductsList = allProducts.filter((p) => p.isNewArrival)
      if (featuredProductsList.length === 0) featuredProductsList = allProducts
    } else if (criteria === "price_high") {
      featuredProductsList = [...allProducts].sort((a, b) => b.price - a.price)
    } else if (criteria === "price_low") {
      featuredProductsList = [...allProducts].sort((a, b) => a.price - b.price)
    } else {
      featuredProductsList = allProducts.filter((p) => p.isBestSeller)
      if (featuredProductsList.length === 0) {
        featuredProductsList = allProducts.filter((p) => p.isBestSeller || p.isNewArrival)
      }
    }
  }

  // Fallback if custom selection yielded no active products
  if (featuredProductsList.length === 0) {
    featuredProductsList = allProducts
  }

  const displayLimit = fpConfig.displayLimit || 8
  const displayedProducts = featuredProductsList.slice(0, displayLimit)

  const gridColsClass =
    fpConfig.columns === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
      : fpConfig.columns === 3
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      : "grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"

  const promoBanners = hp.promoBanners?.filter((b) => b.active !== false) || []

  // Layout Section Sequence & Visibility from CMS
  const activeLayoutSections =
    hp.layoutSections && hp.layoutSections.length > 0
      ? hp.layoutSections.filter((s) => s.enabled !== false)
      : DEFAULT_HOMEPAGE_LAYOUT

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero":
        return (
          <section
            key="hero"
            className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-950 border-b border-zinc-800"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src={
                  hp.hero?.bannerImage ||
                  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
                }
                alt="ADIKT Luxury Streetwear Hero"
                fill
                priority
                className="object-cover object-center opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-6">
              {Boolean(hp.hero?.badge?.trim()) && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9A0000] border border-[#9A0000] text-white text-xs font-extrabold uppercase tracking-widest shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-white" /> {hp.hero.badge.trim()}
                </div>
              )}

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white font-display leading-[0.95]">
                {hp.hero?.headline || "UNCOMPROMISING STREET LUXURY."}
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
                {hp.hero?.subheadline ||
                  "280–400 GSM custom-milled combed cotton garments engineered for permanent structure, zero shrinkage, and modern luxury silhouettes."}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href={hp.hero?.ctaLink || "/shop"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-extrabold px-8 py-4 rounded-xl uppercase tracking-wider text-xs sm:text-sm transition-transform active:scale-95 shadow-xl shadow-white/10"
                >
                  {hp.hero?.ctaText || "Explore Collection"} <ArrowRight className="h-4 w-4" />
                </Link>
                {hp.hero?.secondaryCtaText && (
                  <Link
                    href={hp.hero?.secondaryCtaLink || "/collections/core-heavyweight"}
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-white font-bold px-8 py-4 rounded-xl uppercase tracking-wider text-xs sm:text-sm transition-colors"
                  >
                    {hp.hero.secondaryCtaText}
                  </Link>
                )}
              </div>

              {/* Garment Highlights */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <span className="px-3 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
                  280–400 GSM Heavyweight
                </span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
                  100% Combed Cotton
                </span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
                  Pre-Shrunk Bio-Wash
                </span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
                  7-Day Returns
                </span>
              </div>
            </div>
          </section>
        )

      case "brand_values":
        return (
          <section key="brand_values" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
              {hp.brandValues && hp.brandValues.length > 0 ? (
                hp.brandValues.map((bv, idx) => (
                  <div key={bv.id || idx} className="flex items-center gap-4 p-2">
                    <div className="p-3.5 rounded-xl bg-zinc-800 text-accent">
                      {idx === 0 ? (
                        <Truck className="h-6 w-6" />
                      ) : idx === 1 ? (
                        <ShieldCheck className="h-6 w-6" />
                      ) : (
                        <RefreshCw className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        {bv.title}
                      </h4>
                      <p className="text-xs text-zinc-400">{bv.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-4 p-2">
                    <div className="p-3.5 rounded-xl bg-zinc-800 text-accent">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        Fast Express Logistics
                      </h4>
                      <p className="text-xs text-zinc-400">Shipped via Bluedart & Delhivery in 2-4 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-2">
                    <div className="p-3.5 rounded-xl bg-zinc-800 text-accent">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        280–400 GSM Heavyweight
                      </h4>
                      <p className="text-xs text-zinc-400">100% Combed Compact Cotton with zero color bleed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-2">
                    <div className="p-3.5 rounded-xl bg-zinc-800 text-accent">
                      <RefreshCw className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        7-Day Doorstep Returns
                      </h4>
                      <p className="text-xs text-zinc-400">Automated reverse pickups & instant refund processing</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )

      case "featured_collections":
        if (activeCollections.length === 0) return null
        return (
          <section key="featured_collections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent">Curated Drops</span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display mt-0.5">
                  Featured Collections
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1">
                Browse All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCollections.map((col: any) => (
                <Link
                  key={col.id || col.handle}
                  href={`/collections/${col.handle}`}
                  className="collection-card group relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-end p-8 shadow-md hover:shadow-xl transition-all"
                >
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                  <div className="relative z-10 space-y-2 pointer-events-none">
                    {col.badge && (
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-[#9A0000] text-white px-2.5 py-0.5 rounded-full shadow-md">
                        {col.badge}
                      </span>
                    )}
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-display text-white drop-shadow-md">
                      {col.title}
                    </h3>
                    <p className="text-xs text-zinc-100/90 line-clamp-2 leading-relaxed font-normal drop-shadow-sm">
                      {col.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )

      case "promo_banners":
        if (promoBanners.length === 0) return null
        return (
          <section key="promo_banners" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promoBanners.map((promo) => (
                <div
                  key={promo.id}
                  className="promo-banner-card relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 flex flex-col justify-between min-h-[280px] group shadow-lg"
                >
                  {promo.image && (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={promo.image}
                        alt={promo.title}
                        fill
                        className="object-cover opacity-35 group-hover:opacity-45 transition-opacity duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/30" />
                    </div>
                  )}
                  <div className="relative z-10 space-y-3 max-w-md pointer-events-none">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#9A0000] px-3 py-1 rounded-full shadow-md inline-block">
                      {promo.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-display tracking-tight drop-shadow-md">
                      {promo.title}
                    </h3>
                    <p className="text-xs text-zinc-100/90 leading-relaxed font-medium drop-shadow-sm">{promo.subtitle}</p>
                  </div>
                  <div className="relative z-10 pt-5">
                    <Link
                      href={promo.ctaLink}
                      className="promo-cta-btn inline-flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-950 font-black uppercase rounded-xl text-xs hover:bg-zinc-100 active:scale-95 transition-all shadow-xl"
                    >
                      {promo.ctaText} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )

      case "collection_carousels":
        if (collectionSections.length === 0) return null
        return (
          <div key="collection_carousels" className="space-y-16 lg:space-y-24">
            {collectionSections.map((sec) => (
              <CollectionProductCarousel
                key={sec.id}
                section={sec}
                allProducts={allProducts}
              />
            ))}
          </div>
        )

      case "featured_products":
        if (displayedProducts.length === 0) return null
        return (
          <section key="featured_products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#9A0000]">
                  {fpConfig.badge || "High Velocity Rotation"}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-display mt-0.5">
                  {fpConfig.heading || "Best Selling Streetwear"}
                </h2>
                {fpConfig.subheading && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
                    {fpConfig.subheading}
                  </p>
                )}
              </div>
              <Link
                href={fpConfig.viewAllLink || "/shop"}
                className="text-xs font-bold uppercase text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 shrink-0 transition-colors"
              >
                {fpConfig.viewAllText || "Browse All"} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className={gridColsClass}>
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        )

      case "material_science":
        return (
          <section key="material_science" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 lg:p-16">
              <div className="max-w-2xl space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">Material Science</span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
                  Heavyweight Cotton Engineered For Permanent Structure
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Every ADIKT garment starts with custom-milled combed cotton knit in South India. Pre-shrunk, bio-washed, and reinforced with double-needle ribbed collars that never bacon or sag over time.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="border-l-2 border-accent pl-3">
                    <p className="text-2xl font-black text-white font-display">280</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold">GSM Tee Weight</p>
                  </div>
                  <div className="border-l-2 border-accent pl-3">
                    <p className="text-2xl font-black text-white font-display">400</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold">GSM French Terry</p>
                  </div>
                  <div className="border-l-2 border-accent pl-3">
                    <p className="text-2xl font-black text-white font-display">0%</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold">Post-Wash Shrink</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <>
      <JsonLd schema={generateOrganizationJsonLd()} />
      <div className="space-y-16 lg:space-y-24 pb-16">
        {activeLayoutSections.map((sec) => renderSection(sec.id))}
      </div>
    </>
  )
}
