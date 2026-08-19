import { medusa, DEFAULT_CURRENCY, DEFAULT_REGION } from "./medusa"
import {
  StoreProduct,
  StoreCollection,
  StoreCategory,
  MOCK_COLLECTIONS,
  MOCK_CATEGORIES,
  INITIAL_STORE_PRODUCTS as STORE_PRODUCTS,
} from "./catalog-data"
import { productStore } from "./product-store"

export type { StoreProduct, StoreCollection, StoreCategory }
export { MOCK_COLLECTIONS, MOCK_CATEGORIES, STORE_PRODUCTS }

/**
 * Fetch all products with filtering options.
 * Reads from the shared productStore which includes both initial catalog
 * products AND any products created or updated via the admin dashboard.
 */
export async function getProducts(options?: {
  category?: string
  collection?: string
  limit?: number
  search?: string
  sort?: "featured" | "price_asc" | "price_desc" | "newest"
}): Promise<StoreProduct[]> {
  // If running in browser (client-side), query the server API to ensure all custom admin products are present
  if (typeof window !== "undefined") {
    try {
      const apiRes = await fetch("/api/products")
      if (apiRes.ok) {
        const data = await apiRes.json()
        if (Array.isArray(data.storeProducts) && data.storeProducts.length > 0) {
          let result: StoreProduct[] = [...data.storeProducts]

          if (options?.category && options.category !== "all") {
            result = result.filter((p) => p.category === options.category)
          }
          if (options?.collection && options.collection !== "all") {
            result = result.filter((p) => p.collectionHandle === options.collection)
          }
          if (options?.search && options.search.trim()) {
            const q = options.search.toLowerCase()
            result = result.filter(
              (p) =>
                p.title.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.fabric?.toLowerCase().includes(q) ||
                p.fit?.toLowerCase().includes(q)
            )
          }
          if (options?.sort) {
            if (options.sort === "price_asc") result.sort((a, b) => a.price - b.price)
            if (options.sort === "price_desc") result.sort((a, b) => b.price - a.price)
            if (options.sort === "newest") result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0))
          }
          if (options?.limit) {
            result = result.slice(0, options.limit)
          }
          return result
        }
      }
    } catch (e) {
      // fallback to memory
    }
  }

  try {
    // Attempt query to live Medusa v2 Store API
    const response = await medusa.store.product.list({
      limit: options?.limit || 20,
    }).catch(() => null)

    if (response?.products && response.products.length > 0) {
      // Map Medusa product to our StoreProduct
      return response.products.map((p: any) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        subtitle: p.subtitle || undefined,
        description: p.description || "",
        category: (p.categories?.[0]?.handle as any) || "tees",
        price: p.variants?.[0]?.calculated_price?.calculated_amount || 1999,
        originalPrice: p.variants?.[0]?.calculated_price?.original_amount,
        gsm: p.metadata?.gsm || 280,
        fit: p.metadata?.fit || "Oversized Boxy",
        fabric: p.metadata?.fabric || "100% Combed Compact Cotton",
        weave: p.metadata?.weave || "Single Jersey",
        modelInfo: p.metadata?.modelInfo || "Model wearing size L",
        care: Array.isArray(p.metadata?.care) ? p.metadata.care : ["Machine wash cold"],
        colors: [{ name: "Vintage Black", hex: "#18181b" }],
        sizes: (p.variants || []).map((v: any) => ({
          size: v.title,
          inStock: (v.inventory_quantity ?? 10) > 0,
          stockCount: v.inventory_quantity ?? 10,
        })),
        images: (p.images || []).map((img: any) => img.url),
        inStock: true,
      }))
    }
  } catch (err) {
    // fallback gracefully
  }

  // Read from shared product store (includes admin-created & persisted products)
  let result = productStore.getAllStoreProducts()

  if (options?.category && options.category !== "all") {
    result = result.filter((p) => p.category === options.category)
  }
  if (options?.collection && options.collection !== "all") {
    result = result.filter((p) => p.collectionHandle === options.collection)
  }
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.fit.toLowerCase().includes(q)
    )
  }
  if (options?.sort) {
    if (options.sort === "price_asc") result.sort((a, b) => a.price - b.price)
    if (options.sort === "price_desc") result.sort((a, b) => b.price - a.price)
    if (options.sort === "newest") result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0))
  }
  if (options?.limit) {
    result = result.slice(0, options.limit)
  }

  return result
}

/**
 * Fetch a single product by handle
 */
export async function getProductByHandle(handle: string): Promise<StoreProduct | null> {
  const decoded = decodeURIComponent(handle || "").trim().toLowerCase()
  const product = productStore.getStoreProductByHandle(decoded)
  if (product) return product

  const products = await getProducts()
  return (
    products.find(
      (p) => p.handle.toLowerCase() === decoded || p.id.toLowerCase() === decoded
    ) || null
  )
}

/**
 * Fetch all collections (combines CMS featured collections and standard capsules)
 */
export async function getCollections(): Promise<StoreCollection[]> {
  try {
    const { contentStore } = await import("./content-store")
    const cmsContent = contentStore.getContent()
    const cmsCollections = cmsContent?.homepage?.featuredCollections || []

    const combined: StoreCollection[] = []
    const seenHandles = new Set<string>()

    // 1. Add CMS collections first
    for (const c of cmsCollections) {
      if (c.handle && !seenHandles.has(c.handle.toLowerCase())) {
        seenHandles.add(c.handle.toLowerCase())
        combined.push({
          id: c.id || `col_${c.handle}`,
          title: c.title,
          handle: c.handle,
          description: c.description || "Exclusive engineered luxury streetwear collection.",
          image: c.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
          itemCount: 4,
        })
      }
    }

    // 2. Add persisted collections from admin if available
    if (typeof window === "undefined") {
      try {
        const { loadCollectionsFromDisk } = await import("./server-storage")
        const persisted = loadCollectionsFromDisk()
        if (persisted && persisted.length > 0) {
          const now = Date.now()
          for (const pc of persisted) {
            const isLive =
              pc.status === "Active" ||
              (pc.status === "Scheduled" &&
                pc.scheduledAt &&
                new Date(pc.scheduledAt).getTime() <= now)

            if (isLive && !seenHandles.has(pc.handle.toLowerCase())) {
              seenHandles.add(pc.handle.toLowerCase())
              combined.push({
                id: pc.id,
                title: pc.title,
                handle: pc.handle,
                description: pc.description,
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
                itemCount: 4,
                status: pc.status,
                scheduledAt: pc.scheduledAt,
              })
            }
          }
        }
      } catch {}
    }

    // 3. Add mock collections if not already present
    for (const c of MOCK_COLLECTIONS) {
      if (!seenHandles.has(c.handle.toLowerCase())) {
        seenHandles.add(c.handle.toLowerCase())
        combined.push(c)
      }
    }

    return combined
  } catch {
    return MOCK_COLLECTIONS
  }
}

/**
 * Fetch a collection by handle (dynamically resolves custom CMS & admin collections)
 */
export async function getCollectionByHandle(handle: string): Promise<StoreCollection | null> {
  const decoded = decodeURIComponent(handle || "").trim().toLowerCase()
  const allCollections = await getCollections()

  const found = allCollections.find(
    (c) => c.handle.toLowerCase() === decoded || c.id.toLowerCase() === decoded
  )
  if (found) return found

  // If handle is not found in predefined list, dynamically create a collection object
  const formattedTitle = decoded
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    id: `col_${decoded}`,
    title: formattedTitle,
    handle: decoded,
    description: `Exclusive engineered luxury streetwear capsule: ${formattedTitle}. Crafted with 280-400 GSM custom fabrics in India.`,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
    itemCount: 0,
  }
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<StoreCategory[]> {
  return MOCK_CATEGORIES
}

/**
 * Fetch a category by handle
 */
export async function getCategoryByHandle(handle: string): Promise<StoreCategory | null> {
  return MOCK_CATEGORIES.find((c) => c.handle === handle) || MOCK_CATEGORIES[0]
}
