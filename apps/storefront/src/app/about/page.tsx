export const dynamic = "force-dynamic"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Sparkles } from "@/components/ui/Icons"
import { contentStore } from "@/lib/content-store"

export const metadata = {
  title: "The Craft & Heritage | ADIKT Clothing Co.",
  description:
    "Learn about ADIKT's textile heritage in Tirupur, 280-400 GSM custom-milled cotton, and uncompromising luxury streetwear engineering.",
}

export default function AboutPage() {
  const content = contentStore.getContent()
  const about = content.pages?.about || {
    badge: "Textile Heritage & Engineering",
    title: "The ADIKT Standard",
    subtitle:
      "Born from a refusal to accept thin, flimsy fast-fashion fabrics. Engineered in Mumbai, milled in Tirupur.",
    bannerImage:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=85",
    storyTitle: "Heavyweight Cotton Engineered For Decades, Not Seasons",
    storyBody1:
      "Standard commercial t-shirts are milled at 140 to 180 GSM. They lose structure after 3 machine cycles, their collars bacon, and the side seams twist. At ADIKT, our base tees begin at 280 GSM, knit with 100% combed compact yarn that removes all short, brittle fibers.",
    storyBody2:
      "Our winter fleeces and drop-shoulder hoodies are milled at an uncompromising 400 GSM loopback French Terry. Every piece undergoes a specialized bio-wash bath during milling to achieve zero shrinkage and permanent structural drape.",
    pillarsTitle: "The 4 Pillars of ADIKT Garments",
    pillars: [
      {
        id: "p_1",
        title: "Custom High-GSM Knit",
        description: "280 GSM single jersey and 400 GSM loopback French Terry milled exclusively for ADIKT in Tirupur.",
      },
      {
        id: "p_2",
        title: "High-Density Ribbed Necklines",
        description: "1x1 lycra-infused rib collars that retain their tight, circular shape wear after wear.",
      },
      {
        id: "p_3",
        title: "Pre-Shrunk Bio-Wash",
        description: "Enzyme bio-washing guarantees under 1% post-wash shrinkage for true lifetime fit.",
      },
      {
        id: "p_4",
        title: "Architectural Boxy Cuts",
        description: "Drop-shoulder patterns engineered for a clean, muscular silhouette across all body frames.",
      },
    ],
  }

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 z-0">
          <Image
            src={about.bannerImage}
            alt="ADIKT Textile Craftsmanship"
            fill
            priority
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            {about.badge}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-display">
            {about.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {about.subtitle}
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              01 // The Foundation
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
              {about.storyTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {about.storyBody1}
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {about.storyBody2}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" /> {about.pillarsTitle}
            </h3>
            <div className="space-y-4 text-xs">
              {about.pillars?.map((pillar, i) => (
                <div key={pillar.id || i} className="border-l-2 border-accent pl-4 space-y-1">
                  <h4 className="font-bold text-white uppercase">{pillar.title}</h4>
                  <p className="text-zinc-400">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
