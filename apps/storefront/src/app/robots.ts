import { MetadataRoute } from "next"
import { SeoStore } from "@/lib/seo-store"

export default function robots(): MetadataRoute.Robots {
  const globalConfig = SeoStore.getGlobal()
  const siteUrl = (globalConfig.siteUrl || "https://adiktclothing.com").replace(/\/$/, "")

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/account",
          "/account/*",
          "/cart",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/uploads/*", "/images/*", "/*"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
