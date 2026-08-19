import { Metadata } from "next"
import { SeoStore, SeoRouteOverride } from "./seo-store"

export const SITE_NAME = "ADIKT Clothing Co."
export const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://adiktclothing.com"
export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"

export interface ConstructMetadataOptions {
  title?: string
  description?: string
  image?: string
  canonicalUrl?: string
  noIndex?: boolean
  route?: string // If provided, checks admin overrides first
  type?: "website" | "article"
  publishedTime?: string
  authors?: string[]
}

/**
 * Constructs production-grade Next.js Metadata with Open Graph, Twitter Cards,
 * canonical URLs, and dynamic administrator overrides.
 */
export function constructMetadata(options: ConstructMetadataOptions = {}): Metadata {
  const globalConfig = SeoStore.getGlobal()
  const routeOverride = options.route ? SeoStore.getOverride(options.route) : undefined

  // 1. Resolve Title
  const rawTitle = routeOverride?.seoTitle || options.title
  const finalTitle = rawTitle
    ? rawTitle.includes("|") || rawTitle.includes("ADIKT")
      ? rawTitle
      : `${rawTitle} | ${globalConfig.titleTemplate.replace("%s | ", "") || "ADIKT"}`
  : globalConfig.defaultTitle

  // 2. Resolve Description
  const finalDescription =
    routeOverride?.metaDescription || options.description || globalConfig.defaultDescription

  // 3. Resolve Canonical URL
  const siteUrl = globalConfig.siteUrl || DEFAULT_SITE_URL
  const finalCanonicalUrl =
    routeOverride?.canonicalUrl ||
    options.canonicalUrl ||
    (options.route ? `${siteUrl}${options.route === "/" ? "" : options.route}` : siteUrl)

  // 4. Resolve OG Image
  const finalImage = routeOverride?.ogImage || options.image || globalConfig.defaultOgImage

  // 5. Resolve Indexing Directives
  const isNoIndex =
    routeOverride?.noIndex !== undefined ? routeOverride.noIndex : Boolean(options.noIndex)

  return {
    title: finalTitle,
    description: finalDescription,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: finalCanonicalUrl,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: finalCanonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      type: options.type === "article" ? "article" : "website",
      locale: "en_IN",
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
      ...(options.authors ? { authors: options.authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [finalImage],
      creator: globalConfig.twitterHandle || "@adiktclothing",
      site: globalConfig.twitterHandle || "@adiktclothing",
    },
    robots: {
      index: !isNoIndex,
      follow: !isNoIndex,
      googleBot: {
        index: !isNoIndex,
        follow: !isNoIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

/**
 * Generates Product Schema.org structured data.
 * Adheres strictly to: "Do not generate fake ratings/reviews/schema data."
 * Checks real ReviewsDB and only includes aggregateRating if legitimate reviews exist.
 */
export function generateProductJsonLd(product: {
  id?: string
  title: string
  description?: string
  images: string[]
  price: number
  handle: string
  inStock?: boolean
  sku?: string
  category?: string
  currency?: string
}) {
  const globalConfig = SeoStore.getGlobal()
  const siteUrl = globalConfig.siteUrl || DEFAULT_SITE_URL
  const productUrl = `${siteUrl}/products/${product.handle}`
  const currency = product.currency || "INR"
  const sku = product.sku || `ADKT-${product.id || product.handle.toUpperCase()}`
  const images = product.images && product.images.length > 0 ? product.images : [globalConfig.defaultOgImage]

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.description ||
      `Buy the official ${product.title} crafted in 280-400 GSM custom fabrics by ADIKT.`,
    image: images,
    sku,
    mpn: sku,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "ADIKT",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.inStock !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  }

  // Aggregate Rating ONLY when legitimate reviews exist
  if (product.id) {
    try {
      if (typeof window === "undefined") {
        const { ReviewsDB } = eval('require("./reviews-db")')
        const reviewSummary = ReviewsDB?.getRatingSummary(product.id)
        if (reviewSummary && reviewSummary.totalReviews > 0) {
          schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: reviewSummary.averageRating.toString(),
            reviewCount: reviewSummary.totalReviews.toString(),
            bestRating: "5",
            worstRating: "1",
          }
        }
      }
    } catch {
      // Gracefully ignore if reviews db is unavailable
    }
  }

  return schema
}

/**
 * Generates Organization Schema.org structured data.
 */
export function generateOrganizationJsonLd() {
  const globalConfig = SeoStore.getGlobal()
  const siteUrl = globalConfig.siteUrl || DEFAULT_SITE_URL

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "ADIKT",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: globalConfig.socialLinks || [
      "https://instagram.com/adiktclothing",
      "https://twitter.com/adiktclothing",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-22-49201992",
      contactType: "Customer Support",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  }
}

/**
 * Generates WebSite & SearchAction Schema.org structured data.
 */
export function generateWebSiteJsonLd() {
  const globalConfig = SeoStore.getGlobal()
  const siteUrl = globalConfig.siteUrl || DEFAULT_SITE_URL

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/**
 * Generates BreadcrumbList Schema.org structured data.
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  const globalConfig = SeoStore.getGlobal()
  const siteUrl = globalConfig.siteUrl || DEFAULT_SITE_URL

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  }
}

/**
 * Generates CollectionPage / ItemList Schema.org structured data.
 */
export function generateCollectionJsonLd(collection: {
  title: string
  description?: string
  handle: string
  products: Array<{ title: string; handle: string; price: number; image?: string }>
}) {
  const globalConfig = SeoStore.getGlobal()
  const siteUrl = globalConfig.siteUrl || DEFAULT_SITE_URL

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description || `Browse the ${collection.title} collection by ADIKT.`,
    url: `${siteUrl}/collections/${collection.handle}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.products.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: p.title,
        url: `${siteUrl}/products/${p.handle}`,
      })),
    },
  }
}
