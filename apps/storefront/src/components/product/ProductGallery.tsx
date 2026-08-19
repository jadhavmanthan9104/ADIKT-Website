"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "@/components/ui/Icons"

export interface ProductGalleryProps {
  images: string[]
  title: string
  gsm?: number
  fit?: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  // Touch & Drag state for swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0)
  const [isSwiping, setIsSwiping] = useState(false)

  // Reset active index and zoom whenever the image set updates (e.g. switching color variant)
  useEffect(() => {
    setActiveIdx(0)
    setIsZoomed(false)
  }, [images])

  const numImages = images.length

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      setIsZoomed(false)
      setActiveIdx((prev) => (prev === 0 ? numImages - 1 : prev - 1))
    },
    [numImages]
  )

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      setIsZoomed(false)
      setActiveIdx((prev) => (prev === numImages - 1 ? 0 : prev + 1))
    },
    [numImages]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (numImages <= 1) return
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [numImages, handlePrev, handleNext])

  // Mouse move handler for zoom inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100))
    setMousePos({ x, y })
  }

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed || numImages <= 1) return
    setTouchStartX(e.touches[0].clientX)
    setTouchDeltaX(0)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || touchStartX === null || isZoomed) return
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX
    setTouchDeltaX(diff)
  }

  const handleTouchEnd = () => {
    if (!isSwiping || isZoomed) return
    const swipeThreshold = 45 // min distance to trigger slide change
    if (touchDeltaX > swipeThreshold) {
      handlePrev()
    } else if (touchDeltaX < -swipeThreshold) {
      handleNext()
    }
    setTouchStartX(null)
    setTouchDeltaX(0)
    setIsSwiping(false)
  }

  // Mouse drag handlers for desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed || numImages <= 1) return
    setTouchStartX(e.clientX)
    setTouchDeltaX(0)
    setIsSwiping(true)
  }

  const handleMouseMoveDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomed) {
      handleMouseMove(e)
      return
    }
    if (!isSwiping || touchStartX === null) return
    setTouchDeltaX(e.clientX - touchStartX)
  }

  const handleMouseUpDrag = () => {
    if (!isSwiping || isZoomed) return
    const swipeThreshold = 45
    if (touchDeltaX > swipeThreshold) {
      handlePrev()
    } else if (touchDeltaX < -swipeThreshold) {
      handleNext()
    }
    setTouchStartX(null)
    setTouchDeltaX(0)
    setIsSwiping(false)
  }

  const toggleZoom = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsZoomed((prev) => !prev)
  }

  return (
    <div className="space-y-3.5 max-w-[480px] mx-auto w-full">
      {/* Main Image Carousel Viewport */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveDrag}
        onMouseUp={handleMouseUpDrag}
        onMouseLeave={handleMouseUpDrag}
        onClick={() => isZoomed && setIsZoomed(false)}
        className={`relative aspect-[3/4] max-h-[540px] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md select-none group ${
          isZoomed ? "cursor-zoom-out" : numImages > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        }`}
      >
        {/* Sliding Track */}
        <div
          className={`flex h-full w-full ${isSwiping ? "" : "transition-transform duration-300 ease-out"}`}
          style={{
            transform: `translateX(calc(-${activeIdx * 100}% + ${touchDeltaX}px))`,
          }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative min-w-full h-full shrink-0 overflow-hidden">
              <Image
                src={img}
                alt={`${title} - view ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="(max-width: 1024px) 100vw, 500px"
                className={`object-cover object-center pointer-events-none transition-transform duration-300 ease-out ${
                  isZoomed && activeIdx === idx ? "scale-[2.0]" : "scale-100"
                }`}
                style={
                  isZoomed && activeIdx === idx
                    ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                    : undefined
                }
              />
            </div>
          ))}
        </div>

        {/* Floating Navigation Arrows (Desktop hover / accessible buttons) */}
        {numImages > 1 && !isZoomed && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-zinc-900 dark:bg-black/50 dark:hover:bg-black/85 dark:text-white backdrop-blur-md border border-zinc-200/80 dark:border-white/15 opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-90"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-zinc-900 dark:bg-black/50 dark:hover:bg-black/85 dark:text-white backdrop-blur-md border border-zinc-200/80 dark:border-white/15 opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-90"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Counter Badge / Slide Indicator */}
        {numImages > 1 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-[11px] font-black text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-white/15 pointer-events-none shadow-md">
            {activeIdx + 1} / {numImages}
          </div>
        )}

        {/* Bottom Right Zoom Toggle Button (Light & Dark Theme Compatible) */}
        <button
          type="button"
          onClick={toggleZoom}
          className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all z-10 shadow-lg flex items-center justify-center ${
            isZoomed
              ? "bg-[#9A0000] text-white border border-[#9A0000] shadow-md shadow-[#9A0000]/40 scale-105 ring-2 ring-white/50 dark:ring-white/20"
              : "bg-white/95 hover:bg-white text-zinc-900 dark:bg-zinc-900/90 dark:hover:bg-zinc-900 dark:text-white border border-zinc-300/90 dark:border-white/20 hover:scale-105 active:scale-95"
          }`}
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          title={isZoomed ? "Zoom out" : "Toggle zoom"}
        >
          {isZoomed ? (
            <ZoomOut className="h-4 w-4 stroke-[2.5] fill-none" />
          ) : (
            <ZoomIn className="h-4 w-4 stroke-[2.5] fill-none" />
          )}
        </button>

        {/* Swipe Hint Dots (Mobile & Tablet) */}
        {numImages > 1 && !isZoomed && (
          <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-zinc-200 dark:border-white/10 pointer-events-none shadow-sm">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIdx === idx
                    ? "w-4 bg-zinc-900 dark:bg-white"
                    : "w-1.5 bg-zinc-400 dark:bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Reel */}
      {numImages > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveIdx(idx)
                setIsZoomed(false)
              }}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                activeIdx === idx
                  ? "border-[#9A0000] scale-[0.98] ring-2 ring-[#9A0000]/30 shadow-md"
                  : "border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
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
