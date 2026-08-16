import { Metadata } from "next"
import { ProductDetailView } from "@/components/product/ProductDetailView"

export async function generateStaticParams() {
  return [
    { handle: "boxy-heavyweight-tee-vintage-black" },
    { handle: "french-terry-drop-shoulder-hoodie-olive" },
    { handle: "parachute-utility-cargo-pants-charcoal" },
    { handle: "high-density-puff-print-tee-bone-white" },
    { handle: "acid-wash-zip-up-hoodie-washed-onyx" },
    { handle: "heavy-double-knit-relaxed-sweatpants-heather-grey" },
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const title = resolvedParams.handle
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: `${title} | ADIKT D2C Luxury Streetwear`,
    description: `Shop the ${title}. 280-400 GSM heavyweight combed cotton garment engineered in India.`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const resolvedParams = await params

  const product = {
    id: "prod_1",
    title: resolvedParams.handle
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    handle: resolvedParams.handle,
    price: 1999,
    originalPrice: 2499,
    gsm: 280,
    fit: "Oversized Boxy Fit",
    fabric: "100% Combed Compact Cotton",
    weave: "Single Jersey (Milled in Tirupur)",
    modelInfo: "Model is 6'1\" (185cm), 39\" chest wearing size L",
    care: [
      "Machine wash cold inside out with like colors",
      "Do not bleach or tumble dry",
      "Iron on reverse; do not iron direct print",
    ],
    sizes: [
      { size: "S", inStock: true, stockCount: 4 },
      { size: "M", inStock: true, stockCount: 12 },
      { size: "L", inStock: true, stockCount: 3 },
      { size: "XL", inStock: true, stockCount: 8 },
      { size: "XXL", inStock: false, stockCount: 0 },
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
    ],
  }

  return <ProductDetailView product={product} />
}
