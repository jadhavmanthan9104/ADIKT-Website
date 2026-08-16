import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Sparkles } from "@/components/ui/Icons"

export const metadata = {
  title: "The Craft & Heritage | ADIKT Clothing Co.",
  description: "Learn about ADIKT's textile heritage in Tirupur, 280-400 GSM custom-milled cotton, and uncompromising luxury streetwear engineering.",
}

export default function AboutPage() {
  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=85"
            alt="ADIKT Textile Craftsmanship"
            fill
            priority
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Textile Heritage & Engineering
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-display">
            The ADIKT Standard
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Born from a refusal to accept thin, flimsy fast-fashion fabrics. Engineered in Mumbai, milled in Tirupur.
          </p>
        </div>
      </section>

      {/* Narrative Section 1: The Tirupur Milling Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">01 // The Foundation</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
              Heavyweight Cotton Engineered For Decades, Not Seasons
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Standard commercial t-shirts are milled at 140 to 180 GSM. They lose structure after 3 machine cycles, their collars bacon, and the side seams twist.
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              At ADIKT, our base tees begin at <strong className="text-white">280 GSM</strong>, knit with 100% combed compact yarn that removes all short, brittle fibers. Our winter fleeces and drop-shoulder hoodies are milled at an uncompromising <strong className="text-white">400 GSM loopback French Terry</strong>.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" /> The 4 Pillars of ADIKT Garments
            </h3>
            <div className="space-y-4 text-xs">
              <div className="border-l-2 border-accent pl-3 space-y-0.5">
                <p className="font-bold text-white uppercase">100% Combed Compact Cotton</p>
                <p className="text-zinc-400">Zero synthetic polyester blends or cheap poly-fills.</p>
              </div>
              <div className="border-l-2 border-accent pl-3 space-y-0.5">
                <p className="font-bold text-white uppercase">High-Density 1x1 Rib Collar</p>
                <p className="text-zinc-400">3.5cm reinforced neckline with double-needle lock stitch.</p>
              </div>
              <div className="border-l-2 border-accent pl-3 space-y-0.5">
                <p className="font-bold text-white uppercase">Pre-Shrunk Bio-Wash Bath</p>
                <p className="text-zinc-400">Zero post-purchase shrinkage and ultra-soft hand feel.</p>
              </div>
              <div className="border-l-2 border-accent pl-3 space-y-0.5">
                <p className="font-bold text-white uppercase">Architectural Drop Cut</p>
                <p className="text-zinc-400">Boxy torso, relaxed drop shoulders, structured drape.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 max-w-2xl mx-auto">
          <h3 className="text-2xl font-black uppercase text-white font-display">
            Experience The Weight Difference
          </h3>
          <p className="text-xs text-zinc-400">
            Every garment comes backed by our 7-day doorstep return and exchange guarantee.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-extrabold uppercase rounded-xl text-xs"
            >
              Explore Full Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
