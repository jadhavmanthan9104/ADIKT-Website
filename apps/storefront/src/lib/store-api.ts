import { medusa, DEFAULT_CURRENCY, DEFAULT_REGION } from "./medusa"

export interface StoreProduct {
  id: string
  title: string
  handle: string
  subtitle?: string
  description?: string
  category: "tees" | "hoodies" | "cargos" | "sweats" | "accessories"
  price: number
  originalPrice?: number
  gsm: number
  fit: string
  fabric: string
  weave: string
  modelInfo: string
  care: string[]
  colors: { name: string; hex: string }[]
  sizes: { size: string; inStock: boolean; stockCount: number }[]
  images: string[]
  inStock: boolean
  isNewArrival?: boolean
  isBestSeller?: boolean
  collectionHandle?: string
}

export interface StoreCollection {
  id: string
  title: string
  handle: string
  description: string
  image: string
  productCount: number
}

export interface StoreCategory {
  id: string
  name: string
  handle: string
  description: string
  itemCount: number
}

export const MOCK_COLLECTIONS: StoreCollection[] = [
  {
    id: "col_1",
    title: "Core Heavyweight Series",
    handle: "core-heavyweight",
    description: "280–400 GSM custom combed cotton garments engineered for permanent structure and zero shrink.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
    productCount: 8,
  },
  {
    id: "col_2",
    title: "French Terry Fleece & Sweats",
    handle: "french-terry-fleece",
    description: "400 GSM brushed and loopback French Terry hoodies and relaxed sweatpants.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
    productCount: 6,
  },
  {
    id: "col_3",
    title: "Parachute & Utility Cargos",
    handle: "parachute-cargos",
    description: "Technical nylon-cotton blends, adjustable cinch hems, and multi-compartment utility silhouettes.",
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85",
    productCount: 4,
  },
  {
    id: "col_4",
    title: "Drop 04 // Autumn Archives",
    handle: "drop-04-autumn",
    description: "Limited run acid wash zip-ups and high-density puff prints.",
    image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85",
    productCount: 5,
  },
]

export const MOCK_CATEGORIES: StoreCategory[] = [
  { id: "cat_1", name: "Heavyweight Tees", handle: "tees", description: "240 to 280 GSM oversized boxy cut tees", itemCount: 12 },
  { id: "cat_2", name: "Hoodies & Zip-Ups", handle: "hoodies", description: "400 GSM French Terry drop-shoulder hoodies", itemCount: 8 },
  { id: "cat_3", name: "Pants & Cargos", handle: "cargos", description: "Straight-leg parachute and utility pants", itemCount: 6 },
  { id: "cat_4", name: "Sweatpants & Shorts", handle: "sweats", description: "Heavy double-knit cotton fleece bottoms", itemCount: 5 },
]

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "prod_1",
    title: "280 GSM Boxy Heavyweight Tee - Vintage Black",
    handle: "boxy-heavyweight-tee-vintage-black",
    subtitle: "Custom Milled 100% Combed Compact Cotton",
    description: "Our signature heavyweight boxy tee. Crafted from 280 GSM combed compact cotton with a high-density 1x1 rib neckline that retains shape wear after wear.",
    category: "tees",
    price: 1999,
    originalPrice: 2499,
    gsm: 280,
    fit: "Oversized Boxy",
    fabric: "100% Combed Compact Cotton",
    weave: "Single Jersey (Milled in Tirupur)",
    modelInfo: "Model is 6'1\" (185cm), 39\" chest wearing size L",
    care: [
      "Machine wash cold inside out with like colors",
      "Do not bleach or tumble dry",
      "Iron on reverse; do not iron direct print",
      "Dry flat in shade to preserve garment shape",
    ],
    colors: [
      { name: "Vintage Black", hex: "#18181b" },
      { name: "Bone White", hex: "#f4f4f5" },
      { name: "Olive Washed", hex: "#3f4a3c" },
    ],
    sizes: [
      { size: "S", inStock: true, stockCount: 6 },
      { size: "M", inStock: true, stockCount: 14 },
      { size: "L", inStock: true, stockCount: 3 },
      { size: "XL", inStock: true, stockCount: 9 },
      { size: "XXL", inStock: false, stockCount: 0 },
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: false,
    isBestSeller: true,
    collectionHandle: "core-heavyweight",
  },
  {
    id: "prod_2",
    title: "400 GSM French Terry Drop-Shoulder Hoodie - Olive",
    handle: "french-terry-drop-shoulder-hoodie-olive",
    subtitle: "Heavyweight 400 GSM Loopback Fleece",
    description: "Engineered for maximum drape and structural warmth. Features double-layered hood without drawstrings for a clean architectural silhouette.",
    category: "hoodies",
    price: 3499,
    originalPrice: 4299,
    gsm: 400,
    fit: "Relaxed Heavyweight",
    fabric: "100% Cotton French Terry",
    weave: "Loopback Heavy Knit",
    modelInfo: "Model is 6'2\" (188cm), wearing size XL",
    care: [
      "Machine wash gentle at 30°C",
      "Reshape while damp",
      "Do not tumble dry",
      "Warm iron if needed",
    ],
    colors: [
      { name: "Olive Washed", hex: "#3f4a3c" },
      { name: "Vintage Black", hex: "#18181b" },
      { name: "Oatmeal Heather", hex: "#d6d3d1" },
    ],
    sizes: [
      { size: "S", inStock: true, stockCount: 4 },
      { size: "M", inStock: true, stockCount: 8 },
      { size: "L", inStock: true, stockCount: 11 },
      { size: "XL", inStock: true, stockCount: 5 },
      { size: "XXL", inStock: true, stockCount: 2 },
    ],
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: true,
    isBestSeller: true,
    collectionHandle: "french-terry-fleece",
  },
  {
    id: "prod_3",
    title: "Multi-Pocket Parachute Utility Cargo Pants - Charcoal",
    handle: "parachute-utility-cargo-pants-charcoal",
    subtitle: "Technical Ripstop with Cinch Bungee Cords",
    description: "Versatile straight-to-wide leg cargo pants featuring 6 gusseted 3D utility pockets, adjustable ankle bungee toggles, and an elasticated waistband.",
    category: "cargos",
    price: 2999,
    originalPrice: 3799,
    gsm: 320,
    fit: "Straight Wide-Leg",
    fabric: "70% Cotton / 30% Technical Nylon",
    weave: "Durable Ripstop",
    modelInfo: "Model is 6'0\" (183cm), 32\" waist wearing size L",
    care: [
      "Machine wash cold",
      "Wash with fasteners closed",
      "Do not dry clean",
      "Cool iron on reverse",
    ],
    colors: [
      { name: "Charcoal Grey", hex: "#27272a" },
      { name: "Matte Black", hex: "#09090b" },
      { name: "Desert Sand", hex: "#a8a29e" },
    ],
    sizes: [
      { size: "S", inStock: true, stockCount: 5 },
      { size: "M", inStock: true, stockCount: 10 },
      { size: "L", inStock: true, stockCount: 8 },
      { size: "XL", inStock: true, stockCount: 4 },
      { size: "XXL", inStock: false, stockCount: 0 },
    ],
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: false,
    isBestSeller: true,
    collectionHandle: "parachute-cargos",
  },
  {
    id: "prod_4",
    title: "280 GSM High-Density Puff Print Tee - Bone White",
    handle: "high-density-puff-print-tee-bone-white",
    subtitle: "Architectural 3D Puff Screen Print",
    description: "Features tactile high-density puff graphic prints across the back and chest, stamped on our signature 280 GSM combed compact cotton.",
    category: "tees",
    price: 2199,
    originalPrice: 2699,
    gsm: 280,
    fit: "Oversized Boxy",
    fabric: "100% Combed Compact Cotton",
    weave: "Single Jersey",
    modelInfo: "Model is 6'1\" (185cm), wearing size L",
    care: [
      "Machine wash cold inside out only",
      "Never iron directly over 3D puff print",
      "Air dry in shade",
    ],
    colors: [
      { name: "Bone White", hex: "#f4f4f5" },
      { name: "Vintage Black", hex: "#18181b" },
    ],
    sizes: [
      { size: "S", inStock: true, stockCount: 7 },
      { size: "M", inStock: true, stockCount: 12 },
      { size: "L", inStock: true, stockCount: 6 },
      { size: "XL", inStock: true, stockCount: 3 },
      { size: "XXL", inStock: true, stockCount: 1 },
    ],
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: true,
    isBestSeller: false,
    collectionHandle: "drop-04-autumn",
  },
  {
    id: "prod_5",
    title: "400 GSM Acid Wash Zip-Up Hoodie - Washed Onyx",
    handle: "acid-wash-zip-up-hoodie-washed-onyx",
    subtitle: "Custom Mineral Wash with Heavy YKK Hardware",
    description: "Every piece undergoes an artisanal mineral acid wash treatment, resulting in unique fading patterns. Equipped with custom two-way heavy metal YKK zip.",
    category: "hoodies",
    price: 3899,
    originalPrice: 4799,
    gsm: 400,
    fit: "Boxy Cropped",
    fabric: "100% Cotton French Terry",
    weave: "Loopback Fleece",
    modelInfo: "Model is 6'2\" (188cm), wearing size XL",
    care: [
      "Wash separately for initial 2 washes due to mineral wash dye",
      "Cold machine wash",
      "Lay flat to dry",
    ],
    colors: [
      { name: "Washed Onyx", hex: "#27272a" },
      { name: "Acid Sage", hex: "#475569" },
    ],
    sizes: [
      { size: "S", inStock: true, stockCount: 3 },
      { size: "M", inStock: true, stockCount: 9 },
      { size: "L", inStock: true, stockCount: 15 },
      { size: "XL", inStock: true, stockCount: 4 },
      { size: "XXL", inStock: false, stockCount: 0 },
    ],
    images: [
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: true,
    isBestSeller: false,
    collectionHandle: "drop-04-autumn",
  },
  {
    id: "prod_6",
    title: "Heavy Double-Knit Relaxed Sweatpants - Heather Grey",
    handle: "heavy-double-knit-relaxed-sweatpants-heather-grey",
    subtitle: "380 GSM Heavyweight Double-Knit Cotton",
    description: "Relaxed fit sweatpants with clean deep front slash pockets, a heavy cotton drawstring, and structured bottom cuffs that sit perfectly over chunky sneakers.",
    category: "sweats",
    price: 2699,
    originalPrice: 3299,
    gsm: 380,
    fit: "Relaxed Tapered",
    fabric: "100% Combed Cotton Double Knit",
    weave: "Interlock Knit",
    modelInfo: "Model is 6'0\" (183cm), wearing size M",
    care: [
      "Machine wash cold",
      "Do not bleach",
      "Dry in shade",
    ],
    colors: [
      { name: "Heather Grey", hex: "#9ca3af" },
      { name: "Vintage Black", hex: "#18181b" },
    ],
    sizes: [
      { size: "S", inStock: true, stockCount: 8 },
      { size: "M", inStock: true, stockCount: 14 },
      { size: "L", inStock: true, stockCount: 7 },
      { size: "XL", inStock: true, stockCount: 2 },
      { size: "XXL", inStock: false, stockCount: 0 },
    ],
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: false,
    isBestSeller: true,
    collectionHandle: "french-terry-fleece",
  },
]

/**
 * Fetch all products with filtering options
 */
export async function getProducts(options?: {
  category?: string
  collection?: string
  limit?: number
  search?: string
  sort?: "featured" | "price_asc" | "price_desc" | "newest"
}): Promise<StoreProduct[]> {
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
        subtitle: p.subtitle || "Engineered D2C Garment",
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

  // Use verified local store products dataset
  let result = [...STORE_PRODUCTS]

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
  const products = await getProducts()
  return products.find((p) => p.handle === handle) || products[0] || null
}

/**
 * Fetch all collections
 */
export async function getCollections(): Promise<StoreCollection[]> {
  return MOCK_COLLECTIONS
}

/**
 * Fetch a collection by handle
 */
export async function getCollectionByHandle(handle: string): Promise<StoreCollection | null> {
  return MOCK_COLLECTIONS.find((c) => c.handle === handle) || MOCK_COLLECTIONS[0]
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
