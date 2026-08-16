import React from "react"
import Link from "next/link"
import { getProducts, StoreProduct } from "@/lib/store-api"
import { ProductCard } from "./ProductCard"
import { ArrowRight } from "@/components/ui/Icons"

export interface RelatedProductsProps {
  currentProductId: string
  category: string
  title?: string
}

export async function RelatedProducts({
  currentProductId,
  category,
  title = "Complete The Silhouette",
}: RelatedProductsProps) {
  const allProducts = await getProducts({ category })
  const related = allProducts
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4)

  if (related.length === 0) return null

  return (
    <section className="space-y-6 pt-12 border-t border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Curated Match
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            {title}
          </h2>
        </div>
        <Link
          href={`/shop?category=${category}`}
          className="text-xs font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1"
        >
          View More <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {related.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}
