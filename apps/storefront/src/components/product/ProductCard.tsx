import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/formatters"

export interface ProductCardProps {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  price: number
  originalPrice?: number | null
  gsm?: number | null
  fit?: string | null
  inStock?: boolean
}

export function ProductCard({
  title,
  handle,
  thumbnail,
  price,
  originalPrice,
  gsm,
  fit,
  inStock = true,
}: ProductCardProps) {
  const defaultImage =
    thumbnail ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  return (
    <Link href={`/products/${handle}`} className="group block relative space-y-3">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-900 border border-border">
        <Image
          src={defaultImage}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges (GSM / Fit / Discount) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {gsm && (
            <span className="bg-black/80 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider">
              {gsm} GSM
            </span>
          )}
          {discountPercent && (
            <span className="bg-accent text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-zinc-800 text-xs font-bold text-white px-3 py-1 rounded uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {fit && (
          <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
            {fit}
          </p>
        )}
        <h3 className="text-sm font-medium text-white group-hover:text-accent transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-white">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-foreground/40 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
