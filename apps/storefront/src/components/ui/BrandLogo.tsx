import React from "react"
import Image from "next/image"
import Link from "next/link"

export interface BrandLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  href?: string
}

export function BrandLogo({
  className = "",
  size = "md",
  href = "/",
}: BrandLogoProps) {
  const dimensions = {
    sm: { width: 80, height: 40, classes: "h-8 w-auto" },
    md: { width: 110, height: 50, classes: "h-10 w-auto" },
    lg: { width: 150, height: 70, classes: "h-14 w-auto" },
  }[size]

  const logoElement = (
    <div className={`relative flex items-center shrink-0 ${className}`}>
      <Image
        src="/images/logo.png"
        alt="ADIKT Clothing Co."
        width={dimensions.width}
        height={dimensions.height}
        priority
        className={`object-contain ${dimensions.classes}`}
      />
    </div>
  )

  if (!href) return logoElement

  return (
    <Link href={href} className="inline-flex items-center group transition-transform active:scale-95">
      {logoElement}
    </Link>
  )
}
