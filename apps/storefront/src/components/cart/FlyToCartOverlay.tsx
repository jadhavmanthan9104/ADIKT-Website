"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"

export interface FlyEventDetail {
  thumbnail: string
  startX: number
  startY: number
}

interface FlyingItemInstance {
  id: string
  thumbnail: string
  startX: number
  startY: number
  targetX: number
  targetY: number
}

export function FlyToCartOverlay() {
  const [flyingItems, setFlyingItems] = useState<FlyingItemInstance[]>([])

  const triggerFlight = useCallback((detail: FlyEventDetail) => {
    if (typeof window === "undefined") return

    // Find the cart icon in header for exact target coordinates (top right)
    const cartBtn = document.getElementById("header-cart-btn")
    let targetX = window.innerWidth - 45
    let targetY = 32

    if (cartBtn) {
      const rect = cartBtn.getBoundingClientRect()
      targetX = rect.left + rect.width / 2
      targetY = rect.top + rect.height / 2
    }

    // Ensure valid start coordinates
    let startX = detail.startX
    let startY = detail.startY

    if (!startX || !startY || (startX < 50 && startY < 50)) {
      startX = window.innerWidth / 2
      startY = window.innerHeight / 2
    }

    const newItem: FlyingItemInstance = {
      id: `fly_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      thumbnail: detail.thumbnail,
      startX,
      startY,
      targetX,
      targetY,
    }

    setFlyingItems((prev) => [...prev, newItem])

    // Remove item after animation completes
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id))
    }, 700)
  }, [])

  useEffect(() => {
    const handleFlyEvent = (e: Event) => {
      const customEvent = e as CustomEvent<FlyEventDetail>
      if (customEvent.detail) {
        triggerFlight(customEvent.detail)
      }
    }

    window.addEventListener("fly-to-cart", handleFlyEvent)
    return () => window.removeEventListener("fly-to-cart", handleFlyEvent)
  }, [triggerFlight])

  if (flyingItems.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {flyingItems.map((item) => (
        <FlyingItemElement key={item.id} item={item} />
      ))}
    </div>
  )
}

function FlyingItemElement({ item }: { item: FlyingItemInstance }) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elRef.current) return

    const deltaX = item.targetX - item.startX
    const deltaY = item.targetY - item.startY

    const keyframes: Keyframe[] = [
      {
        transform: `translate3d(${item.startX}px, ${item.startY}px, 0) translate(-50%, -50%) scale(1) rotate(0deg)`,
        opacity: 1,
        offset: 0,
      },
      {
        transform: `translate3d(${item.startX + deltaX * 0.25}px, ${item.startY + deltaY * 0.15 - 80}px, 0) translate(-50%, -50%) scale(1.1) rotate(-6deg)`,
        opacity: 1,
        offset: 0.25,
      },
      {
        transform: `translate3d(${item.startX + deltaX * 0.7}px, ${item.startY + deltaY * 0.65 - 35}px, 0) translate(-50%, -50%) scale(0.45) rotate(12deg)`,
        opacity: 0.95,
        offset: 0.7,
      },
      {
        transform: `translate3d(${item.targetX}px, ${item.targetY}px, 0) translate(-50%, -50%) scale(0.1) rotate(24deg)`,
        opacity: 0,
        offset: 1,
      },
    ]

    const animation = elRef.current.animate(keyframes, {
      duration: 650,
      easing: "cubic-bezier(0.2, 0.85, 0.3, 1)",
      fill: "forwards",
    })

    return () => {
      animation.cancel()
    }
  }, [item])

  return (
    <div
      ref={elRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate3d(${item.startX}px, ${item.startY}px, 0) translate(-50%, -50%)`,
        willChange: "transform, opacity",
      }}
    >
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden shadow-2xl border-2 border-white ring-4 ring-[#9A0000]/60 bg-zinc-900">
        <Image
          src={item.thumbnail}
          alt="Product added to bag"
          fill
          sizes="80px"
          className="object-cover"
        />
        {/* Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#9A0000]/40 to-transparent mix-blend-overlay" />
      </div>
    </div>
  )
}
