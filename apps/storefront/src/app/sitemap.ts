import { MetadataRoute } from "next"
import { STORE_PRODUCTS, MOCK_COLLECTIONS, MOCK_CATEGORIES } from "@/lib/store-api"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://adiktclothing.com"

  const staticRoutes = [
    "",
    "/shop",
    "/search",
    "/cart",
    "/checkout",
    "/account",
    "/account/profile",
    "/account/orders",
    "/account/addresses",
    "/account/wishlist",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/about",
    "/contact",
    "/faq",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }))

  const productRoutes = STORE_PRODUCTS.map((p) => ({
    url: `${baseUrl}/products/${p.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  const collectionRoutes = MOCK_COLLECTIONS.map((c) => ({
    url: `${baseUrl}/collections/${c.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const categoryRoutes = MOCK_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/categories/${cat.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes, ...collectionRoutes, ...categoryRoutes]
}
