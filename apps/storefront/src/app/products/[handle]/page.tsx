import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetailView } from "@/components/product/ProductDetailView"
import { RelatedProducts } from "@/components/product/RelatedProducts"
import { JsonLd } from "@/components/ui/JsonLd"
import { getProductByHandle, STORE_PRODUCTS } from "@/lib/store-api"
import { constructMetadata, generateProductJsonLd } from "@/lib/seo"

export async function generateStaticParams() {
  return STORE_PRODUCTS.map((p) => ({ handle: p.handle }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) return { title: "Product Not Found" }

  return constructMetadata({
    title: `${product.title} (${product.gsm} GSM)`,
    description: product.description || `Shop the ${product.title}. Heavyweight combed cotton garment engineered in India.`,
    image: product.images[0],
  })
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  return (
    <div className="space-y-12 pb-16">
      <JsonLd schema={generateProductJsonLd(product)} />
      <ProductDetailView product={product} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedProducts currentProductId={product.id} category={product.category} />
      </div>
    </div>
  )
}
