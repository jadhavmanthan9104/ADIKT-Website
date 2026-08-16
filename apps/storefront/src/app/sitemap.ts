import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://adiktclothing.com"

  const routes = [
    "",
    "/shop",
    "/about",
    "/faq",
    "/shipping-policy",
    "/return-refund-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }))

  const sampleProducts = [
    "boxy-heavyweight-tee-vintage-black",
    "french-terry-drop-shoulder-hoodie-olive",
    "parachute-utility-cargo-pants-charcoal",
    "high-density-puff-print-tee-bone-white",
  ].map((handle) => ({
    url: `${baseUrl}/products/${handle}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  return [...routes, ...sampleProducts]
}
