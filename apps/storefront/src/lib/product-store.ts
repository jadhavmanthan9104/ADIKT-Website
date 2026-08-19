import {
  StoreProduct,
  AdminProduct,
  INITIAL_STORE_PRODUCTS,
  INITIAL_ADMIN_PRODUCTS,
} from "./catalog-data"

export { type StoreProduct, type AdminProduct }

/**
 * Isomorphic Shared Product Store
 *
 * This singleton is safe for both Client and Server execution.
 * It serves as the single source of truth for products across the application.
 * When admin creates, updates, or deletes a product, it synchronizes both
 * the admin catalog and the customer storefront catalog immediately.
 */

// Category mapping: admin category name → storefront category slug
const CATEGORY_MAP: Record<string, StoreProduct["category"]> = {
  "Heavyweight Tees": "tees",
  "Hoodies & Fleece": "hoodies",
  "Cargos & Bottoms": "cargos",
  "Sweatshirts": "sweats",
  "Accessories": "accessories",
}

// Collection mapping
const COLLECTION_MAP: Record<string, string> = {
  "Core Heavyweight": "core-heavyweight",
  "French Terry Fleece": "french-terry-fleece",
  "Parachute Cargos": "parachute-cargos",
  "Drop 04 Autumn": "drop-04-autumn",
}

// Default product attribute mappings
const FIT_MAP: Record<string, string> = {
  tees: "Oversized Boxy",
  hoodies: "Relaxed Heavyweight",
  cargos: "Straight Wide-Leg",
  sweats: "Relaxed Tapered",
  accessories: "One Size",
}

const FABRIC_MAP: Record<string, string> = {
  tees: "100% Combed Compact Cotton",
  hoodies: "100% Cotton French Terry",
  cargos: "70% Cotton / 30% Technical Nylon",
  sweats: "100% Combed Cotton Double Knit",
  accessories: "Mixed Fabric",
}

const WEAVE_MAP: Record<string, string> = {
  tees: "Single Jersey (Milled in Tirupur)",
  hoodies: "Loopback Heavy Knit",
  cargos: "Durable Ripstop",
  sweats: "Interlock Knit",
  accessories: "Custom Weave",
}

const COLOR_HEX_MAP: Record<string, string> = {
  "Vintage Black": "#18181b",
  "Bone White": "#f4f4f5",
  "Olive Washed": "#3f4a3c",
  "Olive": "#3f4a3c",
  "Oatmeal Heather": "#d6d3d1",
  "Charcoal Grey": "#27272a",
  "Charcoal": "#27272a",
  "Matte Black": "#09090b",
  "Desert Sand": "#a8a29e",
  "Heather Grey": "#9ca3af",
  "Washed Onyx": "#27272a",
  "Acid Sage": "#475569",
}

export function convertAdminToStoreProduct(adminProduct: AdminProduct): StoreProduct {
  const categorySlug = CATEGORY_MAP[adminProduct.category] || "tees"

  // Extract unique colors from variants and associate colorImages
  const seenColors = new Set<string>()
  const colors: { name: string; hex: string; images?: string[] }[] = []
  const colorImagesMap: Record<string, string[]> = { ...(adminProduct.colorImages || {}) }

  for (const v of adminProduct.variants || []) {
    if (v.images && v.images.length > 0 && !colorImagesMap[v.color]) {
      colorImagesMap[v.color] = v.images
    } else if (v.image && !colorImagesMap[v.color]) {
      colorImagesMap[v.color] = [v.image]
    }
    if (!seenColors.has(v.color)) {
      seenColors.add(v.color)
      const customHex = adminProduct.colorCodes?.[v.color] || COLOR_HEX_MAP[v.color] || "#18181b"
      colors.push({
        name: v.color,
        hex: customHex,
        images: colorImagesMap[v.color] || undefined,
      })
    }
  }

  return {
    id: adminProduct.id,
    title: adminProduct.title,
    handle: adminProduct.handle,
    subtitle: adminProduct.subtitle || undefined,
    description: adminProduct.description || "",
    category: categorySlug,
    price: adminProduct.price,
    originalPrice: adminProduct.compareAtPrice,
    gsm: adminProduct.gsm,
    fit: FIT_MAP[categorySlug] || "Oversized Boxy",
    specifications: adminProduct.specifications || adminProduct.fabricEngineering,
    fabricEngineering:
      adminProduct.fabricEngineering ||
      adminProduct.specifications ||
      (adminProduct.fabric
        ? `${adminProduct.fabric} • ${adminProduct.gsm} GSM heavyweight weave • Pre-shrunk & bio-washed in South India.`
        : undefined),
    fabric: adminProduct.fabric || FABRIC_MAP[categorySlug] || "100% Combed Compact Cotton",
    weave: WEAVE_MAP[categorySlug] || "Single Jersey",
    modelInfo:
      adminProduct.modelFitAdvisory ||
      adminProduct.modelInfo ||
      `Model is 6'1" (185cm), wearing size L`,
    modelFitAdvisory:
      adminProduct.modelFitAdvisory ||
      adminProduct.modelInfo ||
      `Model is 6'1" (185cm), wearing size L`,
    garmentCare:
      adminProduct.garmentCare ||
      (adminProduct.care ? adminProduct.care.join("\n") : undefined),
    care:
      adminProduct.care && adminProduct.care.length > 0
        ? adminProduct.care
        : adminProduct.garmentCare
        ? adminProduct.garmentCare
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : [
            "Machine wash cold inside out with like colors",
            "Do not bleach or tumble dry",
            "Iron on reverse; do not iron direct print",
            "Dry flat in shade to preserve garment shape",
          ],
    colors: colors.length > 0 ? colors : [{ name: "Standard", hex: "#18181b" }],
    variantImages: colorImagesMap,
    colorCodes: adminProduct.colorCodes || {},
    variants: adminProduct.variants,
    sizes: (adminProduct.variants || []).map((v) => ({
      size: v.size,
      inStock: v.inventory > 0,
      stockCount: v.inventory,
    })),
    images:
      adminProduct.images && adminProduct.images.length > 0
        ? adminProduct.images
        : [adminProduct.thumbnail || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"],
    inStock: (adminProduct.variants || []).some((v) => v.inventory > 0) || true,
    isNewArrival: true,
    isBestSeller: false,
    collection: adminProduct.collection,
    collectionHandle:
      COLLECTION_MAP[adminProduct.collection] ||
      adminProduct.collection?.toLowerCase().replace(/\s+/g, "-") ||
      "core-heavyweight",
    status: adminProduct.status,
    scheduledAt: adminProduct.scheduledAt || null,
    isGstIncluded: adminProduct.isGstIncluded ?? true,
    gstType: adminProduct.gstType || "percentage",
    gstRate: adminProduct.gstRate ?? (adminProduct.isGstIncluded ? 0 : 18),
    seriesName: adminProduct.seriesName !== undefined ? adminProduct.seriesName : "ADIKT Core Series",
  }
}

type ProductChangeListener = () => void

class ProductStore {
  private storeProducts: StoreProduct[]
  private adminProducts: AdminProduct[]
  private listeners: ProductChangeListener[] = []
  private initialized = false
  private sourceMtimeMs = 0

  constructor() {
    this.storeProducts = [...INITIAL_STORE_PRODUCTS]
    this.adminProducts = [...INITIAL_ADMIN_PRODUCTS]
    this.loadFromDiskIfServer()
  }

  private loadFromDiskIfServer() {
    if (typeof window === "undefined") {
      try {
        const fs = require("fs")
        const path = require("path")
        const candidates = [
          path.join(process.cwd(), "apps", "storefront", "data", "products.json"),
          path.join(process.cwd(), "data", "products.json"),
        ]
        let selectedFile: string | null = null
        let selectedMtime = 0
        for (const file of candidates) {
          if (fs.existsSync(file)) {
            const stat = fs.statSync(file)
            if (stat.mtimeMs > selectedMtime) {
              selectedFile = file
              selectedMtime = stat.mtimeMs
            }
          }
        }

        if (!selectedFile) return
        if (this.initialized && selectedMtime <= this.sourceMtimeMs) return

        const raw = fs.readFileSync(selectedFile, "utf-8")
        const data = JSON.parse(raw)
        if (data?.adminProducts && data.adminProducts.length > 0) {
          this.adminProducts = data.adminProducts
        }
        if (data?.storeProducts && data.storeProducts.length > 0) {
          this.storeProducts = data.storeProducts
        }
        this.initialized = true
        this.sourceMtimeMs = selectedMtime
      } catch {}
    }
  }

  private saveToDiskIfServer() {
    if (typeof window === "undefined") {
      try {
        const fs = require("fs")
        const path = require("path")
        const data = {
          adminProducts: this.adminProducts,
          storeProducts: this.storeProducts,
          lastUpdated: new Date().toISOString(),
        }
        const jsonStr = JSON.stringify(data, null, 2)
        const targets = [
          path.join(process.cwd(), "apps", "storefront", "data", "products.json"),
          path.join(process.cwd(), "data", "products.json"),
        ]
        for (const target of targets) {
          try {
            const dir = path.dirname(target)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
            fs.writeFileSync(target, jsonStr, "utf-8")
          } catch {}
        }
      } catch (err) {
        console.error("[ProductStore] Error saving products to disk:", err)
      }
    }
  }

  /**
   * Initialize or sync with persisted data (e.g. from server storage)
   */
  initFromPersisted(adminProducts: AdminProduct[], storeProducts: StoreProduct[]) {
    if (adminProducts && adminProducts.length > 0) {
      this.adminProducts = adminProducts
    }
    if (storeProducts && storeProducts.length > 0) {
      this.storeProducts = storeProducts
    }
    this.initialized = true
    this.saveToDiskIfServer()
    this.notifyListeners()
  }

  isInitialized(): boolean {
    return this.initialized
  }

  subscribe(listener: ProductChangeListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l())
  }

  /**
   * Get all storefront products
   */
  getAllStoreProducts(): StoreProduct[] {
    this.loadFromDiskIfServer()
    const now = Date.now()

    // Automatically synchronize scheduled items whose drop time has arrived
    for (const ap of this.adminProducts) {
      if (ap.status === "scheduled" && ap.scheduledAt) {
        const isNowLive = new Date(ap.scheduledAt).getTime() <= now
        const storeIdx = this.storeProducts.findIndex((p) => p.id === ap.id)
        if (isNowLive && storeIdx === -1) {
          this.storeProducts.unshift(convertAdminToStoreProduct(ap))
        } else if (!isNowLive && storeIdx !== -1) {
          this.storeProducts.splice(storeIdx, 1)
        }
      }
    }

    return [...this.storeProducts]
  }

  /**
   * Get all admin products
   */
  getAllAdminProducts(): AdminProduct[] {
    this.loadFromDiskIfServer()
    return [...this.adminProducts]
  }

  /**
   * Get a single admin product by ID
   */
  getAdminProductById(id: string): AdminProduct | undefined {
    this.loadFromDiskIfServer()
    const cleanId = (id || "").trim().toLowerCase()
    return this.adminProducts.find((p) => p.id.toLowerCase() === cleanId || p.handle.toLowerCase() === cleanId)
  }

  /**
   * Get a single storefront product by handle or ID
   */
  getStoreProductByHandle(handle: string): StoreProduct | undefined {
    this.loadFromDiskIfServer()
    const cleanHandle = decodeURIComponent(handle || "").trim().toLowerCase()
    const prod = this.storeProducts.find(
      (p) => p.handle.toLowerCase() === cleanHandle || p.id.toLowerCase() === cleanHandle
    )
    return prod
  }

  /**
   * Synchronize an AdminProduct into both admin and storefront catalog
   */
  syncFromAdmin(adminProduct: AdminProduct) {
    // 1. Sync in admin products
    const adminIdx = this.adminProducts.findIndex((p) => p.id === adminProduct.id)
    if (adminIdx !== -1) {
      this.adminProducts[adminIdx] = adminProduct
    } else {
      this.adminProducts.unshift(adminProduct)
    }

    // 2. Sync in storefront products
    const storeIdx = this.storeProducts.findIndex((p) => p.id === adminProduct.id)
    const isLive =
      adminProduct.status === "published" ||
      (adminProduct.status === "scheduled" &&
        Boolean(adminProduct.scheduledAt) &&
        new Date(adminProduct.scheduledAt!).getTime() <= Date.now())

    if (isLive) {
      const storeProduct = convertAdminToStoreProduct(adminProduct)
      if (storeIdx !== -1) {
        this.storeProducts[storeIdx] = storeProduct
      } else {
        this.storeProducts.unshift(storeProduct)
      }
    } else if (storeIdx !== -1) {
      // Draft, archived, or scheduled for future release: remove from public customer storefront
      this.storeProducts.splice(storeIdx, 1)
    }

    this.saveToDiskIfServer()
    this.notifyListeners()
  }

  /**
   * Create a new product from admin
   */
  createFromAdmin(product: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">): AdminProduct {
    const created: AdminProduct = {
      ...product,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.syncFromAdmin(created)
    return created
  }

  /**
   * Update an existing product
   */
  updateFromAdmin(id: string, updates: Partial<AdminProduct>): AdminProduct | undefined {
    const existing = this.getAdminProductById(id)
    if (!existing) return undefined

    const updated: AdminProduct = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.syncFromAdmin(updated)
    return updated
  }

  /**
   * Delete a product
   */
  deleteFromAdmin(id: string): boolean {
    const initialAdminLen = this.adminProducts.length
    this.adminProducts = this.adminProducts.filter((p) => p.id !== id)
    this.storeProducts = this.storeProducts.filter((p) => p.id !== id)
    this.notifyListeners()
    return this.adminProducts.length < initialAdminLen
  }

  /**
   * Remove a product from store
   */
  removeProduct(id: string) {
    this.deleteFromAdmin(id)
  }
}

// Global singleton instance
export const productStore = new ProductStore()
