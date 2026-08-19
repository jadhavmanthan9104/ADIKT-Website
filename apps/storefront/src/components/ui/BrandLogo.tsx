import React from "react"
import Image from "next/image"
import Link from "next/link"

export interface BrandLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  href?: string
}

export function BrandLogo({
  className = "",
  size = "lg",
  href = "/",
}: BrandLogoProps) {
  const dimensions = {
    sm: { width: 80, height: 53, classes: "h-7 sm:h-8 w-auto" },
    md: { width: 120, height: 80, classes: "h-9 sm:h-10 w-auto" },
    lg: { width: 155, height: 102, classes: "h-11 sm:h-12 md:h-13 max-h-[54px] w-auto" },
    xl: { width: 195, height: 129, classes: "h-14 sm:h-15 md:h-16 max-h-[64px] w-auto" },
  }[size]

  const img = (
    <Image
      src="/images/logo.png"
      alt="ADIKT Clothing Co."
      width={dimensions.width}
      height={dimensions.height}
      priority
      className={`object-contain ${dimensions.classes} transition-transform duration-300 group-hover:scale-105 ${className}`}
    />
  )

  if (!href) {
    return <div className="relative flex items-center justify-center shrink-0">{img}</div>
  }

  return (
    <Link href={href} className="inline-flex items-center justify-center group transition-transform active:scale-95 shrink-0">
      {img}
    </Link>
  )
}
