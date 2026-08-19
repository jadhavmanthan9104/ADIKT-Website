export interface SeoGlobalConfig {
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  siteUrl: string
  defaultOgImage: string
  twitterHandle: string
  instagramHandle: string
  socialLinks: string[]
}

export interface SeoRouteOverride {
  route: string // e.g. "/products/280-gsm-boxy-heavyweight-tee" or "/collections/heavyweight-winter"
  seoTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  ogImage?: string
  noIndex?: boolean
  updatedAt?: string
}

export interface SeoDatabase {
  global: SeoGlobalConfig
  overrides: Record<string, SeoRouteOverride>
}

const DEFAULT_SEO_CONFIG: SeoDatabase = {
  global: {
    defaultTitle: "ADIKT | Heavyweight Luxury Streetwear",
    titleTemplate: "%s | ADIKT",
    defaultDescription:
      "Direct-to-consumer luxury streetwear engineered with 280–400 GSM custom fabrics, raw hems, and architectural drape. Crafted in India.",
    siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://adiktclothing.com",
    defaultOgImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
    twitterHandle: "@adiktclothing",
    instagramHandle: "@adiktclothing",
    socialLinks: [
      "https://instagram.com/adiktclothing",
      "https://twitter.com/adiktclothing",
      "https://youtube.com/@adiktclothing",
    ],
  },
  overrides: {
    "/shop": {
      route: "/shop",
      seoTitle: "Shop All Heavyweights & Limited Drops | ADIKT",
      metaDescription:
        "Explore our complete catalog of 280 GSM tees, French Terry hoodies, knit balaclavas, and tactical cargo pieces. Worldwide shipping.",
      canonicalUrl: "https://adiktclothing.com/shop",
    },
    "/about": {
      route: "/about",
      seoTitle: "The ADIKT Blueprint | Fabric Obsession & Architectural Streetwear",
      metaDescription:
        "ADIKT was born out of frustration with flimsy, lightweight cottons. Discover our relentless focus on custom knit GSM weights and drop-shoulder silhouettes.",
      canonicalUrl: "https://adiktclothing.com/about",
    },
  },
}

function getFsAndPath() {
  if (typeof window === "undefined") {
    try {
      const req = eval("require")
      return { fs: req("fs"), path: req("path") }
    } catch {}
  }
  return { fs: null, path: null }
}

function getSeoFilePath(): string | null {
  const { fs, path } = getFsAndPath()
  if (!fs || !path) return null

  const possiblePaths = [
    path.join(process.cwd(), "apps", "storefront", "data", "seo-config.json"),
    path.join(process.cwd(), "data", "seo-config.json"),
    path.join(process.cwd(), "..", "data", "seo-config.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(process.cwd(), "apps", "storefront", "data", "seo-config.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

export class SeoStore {
  private static memoryDb: SeoDatabase | null = null

  static getConfig(): SeoDatabase {
    try {
      const { fs } = getFsAndPath()
      const filePath = getSeoFilePath()
      if (fs && filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (parsed && parsed.global) {
          this.memoryDb = parsed
        }
      }
      if (!this.memoryDb && fs && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(DEFAULT_SEO_CONFIG, null, 2), "utf-8")
        this.memoryDb = JSON.parse(JSON.stringify(DEFAULT_SEO_CONFIG))
      }
    } catch (err) {
      console.warn("Error reading SEO config database:", err)
    }

    if (!this.memoryDb) {
      this.memoryDb = JSON.parse(JSON.stringify(DEFAULT_SEO_CONFIG))
    }

    return this.memoryDb!
  }

  static getGlobal(): SeoGlobalConfig {
    return this.getConfig().global
  }

  static getOverride(route: string): SeoRouteOverride | undefined {
    const config = this.getConfig()
    // Normalize route (strip trailing slash except root)
    const normalized = route === "/" ? "/" : route.replace(/\/$/, "")
    return config.overrides[normalized] || config.overrides[route]
  }

  static updateGlobal(updated: Partial<SeoGlobalConfig>): SeoGlobalConfig {
    const config = this.getConfig()
    config.global = {
      ...config.global,
      ...updated,
    }
    this.saveConfig(config)
    return config.global
  }

  static setOverride(override: SeoRouteOverride): SeoRouteOverride {
    const config = this.getConfig()
    const normalized = override.route === "/" ? "/" : override.route.replace(/\/$/, "")
    const record: SeoRouteOverride = {
      ...override,
      route: normalized,
      updatedAt: new Date().toISOString(),
    }
    config.overrides[normalized] = record
    this.saveConfig(config)
    return record
  }

  static deleteOverride(route: string): boolean {
    const config = this.getConfig()
    const normalized = route === "/" ? "/" : route.replace(/\/$/, "")
    if (config.overrides[normalized] || config.overrides[route]) {
      delete config.overrides[normalized]
      delete config.overrides[route]
      this.saveConfig(config)
      return true
    }
    return false
  }

  private static saveConfig(config: SeoDatabase) {
    this.memoryDb = config
    try {
      const { fs } = getFsAndPath()
      const filePath = getSeoFilePath()
      if (fs && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error writing SEO config database:", err)
    }
  }
}
