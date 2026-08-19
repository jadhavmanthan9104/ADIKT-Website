export const dynamic = "force-dynamic"

import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCollectionByHandle, getProducts, getCollections, MOCK_COLLECTIONS } from "@/lib/store-api"
import { ProductCard } from "@/components/product/ProductCard"
import { JsonLd } from "@/components/ui/JsonLd"
import { constructMetadata, generateCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo"

export async function generateStaticParams() {
  const collections = await getCollections()
  return collections.map((c) => ({ handle: c.handle }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const decodedHandle = decodeURIComponent(handle || "").trim().toLowerCase()
  const collection = await getCollectionByHandle(decodedHandle)
  if (!collection) return { title: "Collection Not Found | ADIKT" }

  return constructMetadata({
    route: `/collections/${collection.handle}`,
    title: `${collection.title} Collection`,
    description:
      collection.description ||
      `Explore the exclusive ${collection.title} collection by ADIKT. Engineered luxury streetwear drops with heavyweight GSM fabrics.`,
    image: collection.image,
  })
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const decodedHandle = decodeURIComponent(handle || "").trim().toLowerCase()
  const collection = await getCollectionByHandle(decodedHandle)
  if (!collection) notFound()

  const allProducts = await getProducts()
  const collectionTitleLower = collection.title.toLowerCase()

  // Match products by handle, slug, or title
  const collectionProducts = allProducts.filter((p) => {
    const pColHandle = (p.collectionHandle || "").toLowerCase()
    const pColTitle = (p.collection || "").toLowerCase()
    return (
      pColHandle === decodedHandle ||
      pColHandle === collectionTitleLower ||
      pColTitle === decodedHandle ||
      pColTitle === collectionTitleLower ||
      pColTitle.replace(/\s+/g, "-") === decodedHandle ||
      decodedHandle.replace(/\s+/g, "-") === pColHandle
    )
  })

  const collectionJsonLd = generateCollectionJsonLd({
    title: collection.title,
    description: collection.description,
    handle: collection.handle,
    products: collectionProducts.map((p) => ({
      title: p.title,
      handle: p.handle,
      price: p.price,
      image: p.images?.[0],
    })),
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Collections", url: "/shop" },
    { name: collection.title, url: `/collections/${collection.handle}` },
  ])

  return (
    <>
      <JsonLd schema={collectionJsonLd} />
      <JsonLd schema={breadcrumbJsonLd} />
      <div className="space-y-12 pb-16">
        {/* Collection Header Banner */}
        <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden bg-zinc-950 border-b border-zinc-800">
          <div className="absolute inset-0 z-0">
            <Image
              src={
                collection.image ||
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=85"
              }
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

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-display">
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
              {collectionProducts.length} {collectionProducts.length === 1 ? "Silhouette" : "Silhouettes"} in Capsule Drop
            </span>
            <Link href="/shop" className="text-xs font-bold uppercase text-accent hover:underline">
              View Full Archive
            </Link>
          </div>

          {collectionProducts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <p className="text-base font-bold text-white uppercase">No Silhouettes Assigned Yet</p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Garments will appear here once assigned to this collection in the Admin Dashboard.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase"
                >
                  Explore All Garments
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {collectionProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
