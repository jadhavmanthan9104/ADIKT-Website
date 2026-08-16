import { Metadata } from "next"

export const SITE_NAME = "ADIKT Clothing Co."
export const SITE_URL = "https://adiktclothing.com"
export const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"

export function constructMetadata({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  canonicalUrl,
  noIndex = false,
}: {
  title: string
  description: string
  image?: string
  canonicalUrl?: string
  noIndex?: boolean
}): Metadata {
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonicalUrl || SITE_URL,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
      creator: "@adiktclothing",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    metadataBase: new URL(SITE_URL),
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
  }
}

export function generateProductJsonLd(product: {
  title: string
  description?: string
  images: string[]
  price: number
  handle: string
  inStock: boolean
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `Shop the ${product.title} crafted in India.`,
    image: product.images,
    url: `${SITE_URL}/products/${product.handle}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.handle}`,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  }
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://instagram.com/adiktclothing",
      "https://twitter.com/adiktclothing",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-98765-43210",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  }
}
