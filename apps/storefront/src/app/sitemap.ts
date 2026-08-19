import { MetadataRoute } from "next"
import { STORE_PRODUCTS, MOCK_COLLECTIONS, MOCK_CATEGORIES } from "@/lib/store-api"
import { productStore } from "@/lib/product-store"
import { SeoStore } from "@/lib/seo-store"

export default function sitemap(): MetadataRoute.Sitemap {
  const globalConfig = SeoStore.getGlobal()
  const baseUrl = (globalConfig.siteUrl || "https://adiktclothing.com").replace(/\/$/, "")

  // 1. High-priority Public Static Routes
  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/search", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/lookbook", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/shipping", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/returns", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
  ]
    .filter((r) => {
      const override = SeoStore.getOverride(r.path || "/")
      return !override?.noIndex
    })
    .map((r) => {
      const override = SeoStore.getOverride(r.path || "/")
      return {
        url: override?.canonicalUrl || `${baseUrl}${r.path}`,
        lastModified: new Date(),
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      }
    })

  // 2. Dynamic Product Catalog Routes
  const allProducts = productStore?.getAllStoreProducts?.() || STORE_PRODUCTS
  const productRoutes = allProducts
    .filter((p) => {
      const override = SeoStore.getOverride(`/products/${p.handle}`)
      return !override?.noIndex
    })
    .map((p) => {
      const override = SeoStore.getOverride(`/products/${p.handle}`)
      return {
        url: override?.canonicalUrl || `${baseUrl}/products/${p.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }
    })

  // 3. Dynamic Collection Routes
  const collectionRoutes = MOCK_COLLECTIONS
    .filter((c) => {
      const override = SeoStore.getOverride(`/collections/${c.handle}`)
      return !override?.noIndex
    })
    .map((c) => {
      const override = SeoStore.getOverride(`/collections/${c.handle}`)
      return {
        url: override?.canonicalUrl || `${baseUrl}/collections/${c.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }
    })

  // 4. Dynamic Category Routes
  const categoryRoutes = MOCK_CATEGORIES
    .filter((cat) => {
      const override = SeoStore.getOverride(`/categories/${cat.handle}`)
      return !override?.noIndex
    })
    .map((cat) => {
      const override = SeoStore.getOverride(`/categories/${cat.handle}`)
      return {
        url: override?.canonicalUrl || `${baseUrl}/categories/${cat.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }
    })

  return [...staticRoutes, ...productRoutes, ...collectionRoutes, ...categoryRoutes]
}
