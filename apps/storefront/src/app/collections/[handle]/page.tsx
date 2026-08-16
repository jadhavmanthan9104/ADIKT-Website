import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCollectionByHandle, getProducts, MOCK_COLLECTIONS } from "@/lib/store-api"
import { ProductCard } from "@/components/product/ProductCard"
import { constructMetadata } from "@/lib/seo"

export async function generateStaticParams() {
  return MOCK_COLLECTIONS.map((c) => ({ handle: c.handle }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)
  if (!collection) return { title: "Collection Not Found" }

  return constructMetadata({
    title: `${collection.title} Collection`,
    description: collection.description,
    image: collection.image,
  })
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)
  if (!collection) notFound()

  const allProducts = await getProducts()
  const collectionProducts = allProducts.filter((p) => p.collectionHandle === handle)

  return (
    <div className="space-y-12 pb-16">
      {/* Collection Header Banner */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden bg-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 z-0">
          <Image
            src={collection.image}
            alt={collection.title}
            fill
            priority
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-4">
          <nav className="text-xs text-zinc-400 flex items-center justify-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white">Collections</Link>
            <span>/</span>
            <span className="text-white font-medium">{collection.title}</span>
          </nav>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
            {collection.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
            {collection.description}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {collectionProducts.length} Silhouettes in Drop
          </span>
          <Link href="/shop" className="text-xs font-bold uppercase text-accent hover:underline">
            View Full Archive
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {collectionProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  )
}
