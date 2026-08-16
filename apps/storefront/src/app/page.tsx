import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles } from "@/components/ui/Icons"
import { ProductCard } from "@/components/product/ProductCard"
import { getProducts, getCollections } from "@/lib/store-api"
import { JsonLd } from "@/components/ui/JsonLd"
import { generateOrganizationJsonLd } from "@/lib/seo"

export default async function HomePage() {
  const [allProducts, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ])

  const newArrivals = allProducts.filter((p) => p.isNewArrival)
  const bestSellers = allProducts.filter((p) => p.isBestSeller)

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      <JsonLd schema={generateOrganizationJsonLd()} />

      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="ADIKT Luxury Streetwear Hero"
            fill
            priority
            className="object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Drop 04 // Live Across India
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white font-display leading-[0.95]">
            UNCOMPROMISING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
              STREET LUXURY.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            280–400 GSM custom-milled combed cotton garments engineered for permanent structure, zero shrinkage, and modern luxury silhouettes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-extrabold px-8 py-4 rounded-xl uppercase tracking-wider text-xs sm:text-sm transition-transform active:scale-95 shadow-xl shadow-white/10"
            >
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/collections/core-heavyweight"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-white font-bold px-8 py-4 rounded-xl uppercase tracking-wider text-xs sm:text-sm transition-colors"
            >
              Shop 280 GSM Core Series
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Brand Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-4 p-2">
            <div className="p-3.5 rounded-xl bg-zinc-800 text-accent">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Fast Express Logistics</h4>
              <p className="text-xs text-zinc-400">Shipped via Bluedart & Delhivery in 2-4 business days</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-2">
            <div className="p-3.5 rounded-xl bg-zinc-800 text-accent">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">280–400 GSM Heavyweight</h4>
              <p className="text-xs text-zinc-400">100% Combed Compact Cotton with zero color bleed</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-2">
            <div className="p-3.5 rounded-xl bg-zinc-800 text-accent">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">7-Day Doorstep Returns</h4>
              <p className="text-xs text-zinc-400">Automated reverse pickups & instant refund processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.handle}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col justify-end p-6"
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                  {col.productCount} Silhouettes
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight text-white font-display group-hover:text-accent transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">High Velocity</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display mt-0.5">
              Best Selling Silhouettes
            </h2>
          </div>
          <Link href="/shop" className="text-xs font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* 5. Promotional Mid-Page Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 lg:p-16">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Exclusive Offer</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
              Flat 10% Off On Your First Drop Purchase
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Use code <strong className="text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">WELCOME10</strong> at checkout. Applies automatically to all 280 GSM tees, 400 GSM hoodies, and parachute cargos.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-extrabold uppercase rounded-lg text-xs"
              >
                Claim Discount <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Just Dropped</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display mt-0.5">
              New Arrivals & Special Washes
            </h2>
          </div>
          <Link href="/shop" className="text-xs font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1">
            Explore All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* 7. Fabric Engineering & Brand Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 lg:p-16">
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
    </div>
  )
}
