export const dynamic = "force-dynamic"

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetailView } from "@/components/product/ProductDetailView"
import { RelatedProducts } from "@/components/product/RelatedProducts"
import { JsonLd } from "@/components/ui/JsonLd"
import { getProductByHandle, getProducts } from "@/lib/store-api"
import { constructMetadata, generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo"

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ handle: p.handle }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) return { title: "Product Not Found | ADIKT" }

  return constructMetadata({
    route: `/products/${product.handle}`,
    title: `${product.title} (${product.gsm} GSM Heavyweight)`,
    description:
      product.description ||
      `Shop the ${product.title} engineered with ${product.gsm} GSM custom heavyweight fabric, relaxed architectural fit, and raw details. Crafted in India.`,
    image: product.images && product.images.length > 0 ? product.images[0] : undefined,
    type: "website",
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

  const productJsonLd = generateProductJsonLd(product)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: product.category || "Shop", url: "/shop" },
    { name: product.title, url: `/products/${product.handle}` },
  ])

  return (
    <>
      <JsonLd schema={productJsonLd} />
      <JsonLd schema={breadcrumbJsonLd} />
      <div className="space-y-12 pb-16">
        <ProductDetailView product={product} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RelatedProducts currentProductId={product.id} category={product.category} />
        </div>
      </div>
    </>
  )
}
