export const dynamic = "force-dynamic"

import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCategoryByHandle, getProducts, MOCK_CATEGORIES } from "@/lib/store-api"
import { ProductCard } from "@/components/product/ProductCard"
import { JsonLd } from "@/components/ui/JsonLd"
import { constructMetadata, generateCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo"

export async function generateStaticParams() {
  return MOCK_CATEGORIES.map((c) => ({ handle: c.handle }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const category = await getCategoryByHandle(handle)
  if (!category) return { title: "Category Not Found | ADIKT" }

  return constructMetadata({
    route: `/categories/${handle}`,
    title: `${category.name} | Heavyweight Streetwear`,
    description:
      category.description ||
      `Explore premium ${category.name} designed with luxury custom heavyweight fabrics, boxy silhouettes, and raw streetwear aesthetics by ADIKT.`,
  })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const category = await getCategoryByHandle(handle)
  if (!category) notFound()

  const allProducts = await getProducts()
  const categoryProducts = allProducts.filter((p) => p.category === handle)

  const categoryJsonLd = generateCollectionJsonLd({
    title: category.name,
    description: category.description,
    handle: category.handle,
    products: categoryProducts.map((p) => ({
      title: p.title,
      handle: p.handle,
      price: p.price,
      image: p.images?.[0],
    })),
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Categories", url: "/shop" },
    { name: category.name, url: `/categories/${category.handle}` },
  ])

  return (
    <>
      <JsonLd schema={categoryJsonLd} />
      <JsonLd schema={breadcrumbJsonLd} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        {/* Category Header */}
        <div className="space-y-3 pb-6 border-b border-zinc-800">
          <nav className="text-xs text-zinc-400 flex items-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white">Categories</Link>
            <span>/</span>
            <span className="text-white font-medium">{category.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
            {category.name}
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {categoryProducts.length} Items Available
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
