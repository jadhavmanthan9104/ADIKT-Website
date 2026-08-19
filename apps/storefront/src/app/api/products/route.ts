import { NextRequest, NextResponse } from "next/server"
import { productStore } from "@/lib/product-store"
import { loadCatalogFromDisk, saveCatalogToDisk } from "@/lib/server-storage"

/**
 * GET /api/products — List all products (admin + storefront)
 * Hydrates from disk storage on first load if available.
 *
 * POST /api/products — Create a new product from admin and persist to disk.
 */

// Hydrate productStore from disk once on the server if persisted data exists
let hasHydrated = false
function ensureHydrated() {
  if (hasHydrated) return
  const persisted = loadCatalogFromDisk()
  if (persisted && persisted.adminProducts?.length > 0) {
    productStore.initFromPersisted(persisted.adminProducts, persisted.storeProducts)
  }
  hasHydrated = true
}

export async function GET() {
  try {
    ensureHydrated()

    const adminProducts = productStore.getAllAdminProducts()
    const storeProducts = productStore.getAllStoreProducts()

    return NextResponse.json({
      adminProducts,
      storeProducts,
      count: storeProducts.length,
    })
  } catch (error) {
    console.error("[API] Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureHydrated()
    const body = await request.json()

    const created = productStore.createFromAdmin({
      title: body.title,
      handle: body.handle || `garment-${Date.now()}`,
      subtitle: body.subtitle || "",
      description: body.description || "",
      seriesName: typeof body.seriesName === "string" ? body.seriesName : undefined,
      status: body.status || "published",
      scheduledAt: body.scheduledAt || null,
      category: body.category || "Heavyweight Tees",
      collection: body.collection || "Core Heavyweight",
      gsm: Number(body.gsm) || 280,
      price: Number(body.price) || 1999,
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      costPrice: body.costPrice ? Number(body.costPrice) : undefined,
      isGstIncluded: typeof body.isGstIncluded === "boolean" ? body.isGstIncluded : true,
      gstType: body.gstType || "percentage",
      gstRate: typeof body.gstRate === "number" ? body.gstRate : undefined,
      thumbnail: body.thumbnail || "",
      images: body.images && body.images.length > 0 ? body.images : [body.thumbnail || ""],
      colorImages: body.colorImages || {},
      colorCodes: body.colorCodes || {},
      fabricEngineering: body.fabricEngineering,
      modelFitAdvisory: body.modelFitAdvisory,
      modelInfo: body.modelFitAdvisory || body.modelInfo,
      fabric: body.fabric,
      garmentCare: body.garmentCare,
      specifications: body.specifications || body.fabricEngineering,
      care: body.care,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map((t: string) => t.trim()) : []),
      variants: body.variants || [],
    })

    // Persist updated catalog to disk
    saveCatalogToDisk(productStore.getAllAdminProducts(), productStore.getAllStoreProducts())

    return NextResponse.json({ success: true, product: created }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
