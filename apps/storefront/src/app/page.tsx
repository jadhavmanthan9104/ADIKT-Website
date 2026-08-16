import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles } from "@/components/ui/Icons"
import { ProductCard } from "@/components/product/ProductCard"

export default function HomePage() {
  const featuredProducts = [
    {
      id: "prod_1",
      title: "280 GSM Boxy Heavyweight Tee - Vintage Black",
      handle: "boxy-heavyweight-tee-vintage-black",
      thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      price: 1999,
      originalPrice: 2499,
      gsm: 280,
      fit: "Oversized Boxy",
      inStock: true,
    },
    {
      id: "prod_2",
      title: "400 GSM French Terry Drop-Shoulder Hoodie - Olive",
      handle: "french-terry-drop-shoulder-hoodie-olive",
      thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      price: 3499,
      originalPrice: 4299,
      gsm: 400,
      fit: "Relaxed Heavyweight",
      inStock: true,
    },
    {
      id: "prod_3",
      title: "Multi-Pocket Parachute Utility Cargo Pants - Charcoal",
      handle: "parachute-utility-cargo-pants-charcoal",
      thumbnail: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
      price: 2999,
      originalPrice: 3799,
      gsm: 320,
      fit: "Straight Wide-Leg",
      inStock: true,
    },
    {
      id: "prod_4",
      title: "280 GSM High-Density Puff Print Tee - Bone White",
      handle: "high-density-puff-print-tee-bone-white",
      thumbnail: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
      price: 2199,
      originalPrice: 2699,
      gsm: 280,
      fit: "Oversized Boxy",
      inStock: true,
    },
  ]

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-950 border-b border-border">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="ADIKT Luxury Streetwear Hero"
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Drop 04 // Now Live
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white font-display leading-[0.95]">
            UNCOMPROMISING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
              STREET LUXURY.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            High-density 280-400 GSM fabrics, bespoke boxy cuts, and precision streetwear silhouettes crafted in India.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold px-8 py-4 rounded-lg uppercase tracking-wider text-sm transition-transform active:scale-95"
            >
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop?category=tees"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-white font-bold px-8 py-4 rounded-lg uppercase tracking-wider text-sm transition-colors"
            >
              Shop 280 GSM Tees
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Brand Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-zinc-900/50 border border-border">
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-zinc-800 text-accent">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Fast Express Delivery</h4>
              <p className="text-xs text-zinc-400">Shipped via Bluedart & Delhivery in 2-4 days across India</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-zinc-800 text-accent">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">280-400 GSM Heavyweight</h4>
              <p className="text-xs text-zinc-400">100% Combed Compact Cotton with zero color bleed</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-zinc-800 text-accent">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hassle-Free Returns</h4>
              <p className="text-xs text-zinc-400">7-day doorstep pickup & instant refunds</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Drop Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">The Lineup</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-display mt-1">
              Featured Silhouettes
            </h2>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-300 hover:text-white group">
            View All Garments <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* 4. Fabric Engineering Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 lg:p-16">
          <div className="max-w-2xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Material Science</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
              Heavyweight Cotton Engineered For Structure
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Every ADIKT garment starts with custom-milled combed cotton knit in Tirupur. Pre-shrunk, bio-washed, and reinforced with double-needle ribbed collars that never bacon or sag over time.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="border-l-2 border-accent pl-3">
                <p className="text-2xl font-black text-white">280</p>
                <p className="text-xs text-zinc-400 uppercase">GSM Tee Weight</p>
              </div>
              <div className="border-l-2 border-accent pl-3">
                <p className="text-2xl font-black text-white">400</p>
                <p className="text-xs text-zinc-400 uppercase">GSM French Terry</p>
              </div>
              <div className="border-l-2 border-accent pl-3">
                <p className="text-2xl font-black text-white">0%</p>
                <p className="text-xs text-zinc-400 uppercase">Post-Wash Shrink</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
