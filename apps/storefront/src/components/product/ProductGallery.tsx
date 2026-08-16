"use client"

import React, { useState } from "react"
import Image from "next/image"

export interface ProductGalleryProps {
  images: string[]
  title: string
  gsm?: number
  fit?: string
}

export function ProductGallery({ images, title, gsm, fit }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const activeImage = images[activeIdx] || images[0] || ""

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setMousePos({ x, y })
  }

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom on Hover */}
      <div
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 cursor-crosshair group"
      >
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className={`object-cover object-center transition-transform duration-200 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          style={
            isZoomed
              ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
              : undefined
          }
        />

        {/* GSM & Fit Watermark Badge */}
        {gsm && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-xs font-bold text-white px-3 py-1.5 rounded-md uppercase tracking-wider border border-white/10 pointer-events-none">
            {gsm} GSM {fit ? `// ${fit}` : ""}
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-black/60 text-[10px] text-zinc-300 px-2 py-1 rounded backdrop-blur-sm pointer-events-none sm:block hidden">
          Hover to zoom garment
        </div>
      </div>

      {/* Thumbnail Reel */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                activeIdx === idx
                  ? "border-accent scale-[0.98] ring-2 ring-accent/30"
                  : "border-zinc-800 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${title} view ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
