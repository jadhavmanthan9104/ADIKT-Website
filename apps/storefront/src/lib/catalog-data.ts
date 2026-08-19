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
  modelFitAdvisory?: string
  fabricEngineering?: string
  garmentCare?: string
  specifications?: string
  care: string[]
  colors: { name: string; hex: string; images?: string[] }[]
  variantImages?: Record<string, string[]>
  colorCodes?: Record<string, string>
  sizes: { size: string; inStock: boolean; stockCount: number }[]
  variants?: {
    id: string
    title: string
    sku: string
    barcode?: string
    size: string
    color: string
    inventory: number
    price: number
    weightGrams?: number
    image?: string
    images?: string[]
  }[]
  images: string[]
  inStock: boolean
  isNewArrival?: boolean
  isBestSeller?: boolean
  collectionHandle?: string
  collection?: string
  status?: "published" | "draft" | "scheduled" | "archived"
  scheduledAt?: string | null
  isGstIncluded?: boolean
  gstType?: "percentage" | "amount"
  gstRate?: number
  seriesName?: string
}

export interface StoreCollection {
  id: string
  title: string
  handle: string
  description: string
  image: string
  itemCount: number
  status?: "Active" | "Scheduled" | "Draft" | "Archived"
  scheduledAt?: string | null
}

export interface StoreCategory {
  id: string
  name: string
  handle: "tees" | "hoodies" | "cargos" | "sweats" | "accessories"
  description: string
  itemCount: number
}

export interface AdminProduct {
  id: string
  title: string
  handle: string
  subtitle?: string
  description?: string
  seriesName?: string
  status: "published" | "draft" | "scheduled" | "archived"
  scheduledAt?: string | null
  isGstIncluded?: boolean
  gstType?: "percentage" | "amount"
  gstRate?: number
  category: string
  collection: string
  gsm: number
  price: number
  compareAtPrice?: number
  costPrice?: number
  thumbnail: string
  images: string[]
  colorImages?: Record<string, string[]>
  colorCodes?: Record<string, string>
  fabricEngineering?: string
  modelFitAdvisory?: string
  modelInfo?: string
  fabric?: string
  garmentCare?: string
  specifications?: string
  care?: string[]
  tags: string[]
  variants: {
    id: string
    title: string
    sku: string
    barcode: string
    size: string
    color: string
    inventory: number
    price: number
    weightGrams: number
    image?: string
    images?: string[]
  }[]
  createdAt?: string
  updatedAt?: string
  seoTitle?: string
  seoDescription?: string
}

export const MOCK_COLLECTIONS: StoreCollection[] = [
  {
    id: "col_1",
    title: "Core Heavyweight",
    handle: "core-heavyweight",
    description: "280 GSM combed compact cotton essentials built for timeless rotation.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
    itemCount: 8,
  },
  {
    id: "col_2",
    title: "French Terry Fleece",
    handle: "french-terry-fleece",
    description: "400 GSM loopback cotton fleece engineered with double-layered hoods.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
    itemCount: 6,
  },
  {
    id: "col_3",
    title: "Parachute Cargos",
    handle: "parachute-cargos",
    description: "Structured high-tensile ripstop pants with modular storage pockets.",
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85",
    itemCount: 4,
  },
  {
    id: "col_4",
    title: "Drop 04 Autumn",
    handle: "drop-04-autumn",
    description: "Architectural proportions in mineral-washed earth tones and acid washes.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
    itemCount: 10,
  },
]

export const MOCK_CATEGORIES: StoreCategory[] = [
  { id: "cat_1", name: "Heavyweight Tees", handle: "tees", description: "240 to 280 GSM oversized boxy cut tees", itemCount: 12 },
  { id: "cat_2", name: "Hoodies & Zip-Ups", handle: "hoodies", description: "400 GSM French Terry drop-shoulder hoodies", itemCount: 8 },
  { id: "cat_3", name: "Pants & Cargos", handle: "cargos", description: "Straight-leg parachute and utility pants", itemCount: 6 },
  { id: "cat_4", name: "Sweatpants & Shorts", handle: "sweats", description: "Heavy double-knit cotton fleece bottoms", itemCount: 5 },
]

export const INITIAL_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "prod_01JADIKT01",
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
    id: "prod_01JADIKT02",
    title: "400 GSM French Terry Drop-Shoulder Hoodie - Olive",
    handle: "french-terry-hoodie-olive",
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
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: false,
    isBestSeller: true,
    collectionHandle: "french-terry-fleece",
  },
  {
    id: "prod_01JADIKT03",
    title: "Multi-Pocket Parachute Utility Cargo Pants - Charcoal",
    handle: "parachute-cargo-pants-charcoal",
    subtitle: "High-Tensile Cotton Ripstop • 8 Modular Pockets",
    description: "Tactical streetwear pants with elasticated drawcord hem, heavy duty YKK hardware, and articulated knees for mobility.",
    category: "cargos",
    price: 2999,
    originalPrice: 3799,
    gsm: 320,
    fit: "Straight Wide-Leg",
    fabric: "70% Cotton / 30% Technical Nylon",
    weave: "Durable Ripstop",
    modelInfo: "Model is 6'0\" (183cm), 32\" waist wearing size 32",
    care: [
      "Machine wash cold inside out",
      "Wash with similar dark tones",
      "Hang dry only",
      "Cool iron on reverse",
    ],
    colors: [
      { name: "Charcoal Grey", hex: "#27272a" },
      { name: "Matte Black", hex: "#09090b" },
      { name: "Desert Sand", hex: "#a8a29e" },
    ],
    sizes: [
      { size: "30", inStock: true, stockCount: 5 },
      { size: "32", inStock: true, stockCount: 12 },
      { size: "34", inStock: true, stockCount: 8 },
      { size: "36", inStock: false, stockCount: 0 },
    ],
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: true,
    isBestSeller: false,
    collectionHandle: "parachute-cargos",
  },
  {
    id: "prod_01JADIKT04",
    title: "380 GSM Heavyweight Oversized Crewneck - Heather Grey",
    handle: "oversized-crewneck-heather-grey",
    subtitle: "380 GSM Diagonal Fleece • Ribbed V-Insert",
    description: "Relaxed vintage silhouette with drop shoulders and reinforced coverstitching across all strain seams.",
    category: "sweats",
    price: 2799,
    originalPrice: 3299,
    gsm: 380,
    fit: "Relaxed Tapered",
    fabric: "100% Combed Cotton Double Knit",
    weave: "Interlock Knit",
    modelInfo: "Model is 6'1\" (185cm), wearing size L",
    care: [
      "Machine wash cold",
      "Do not tumble dry",
      "Do not dry clean",
      "Dry flat in shade",
    ],
    colors: [
      { name: "Heather Grey", hex: "#9ca3af" },
      { name: "Vintage Black", hex: "#18181b" },
    ],
    sizes: [
      { size: "S", inStock: true, stockCount: 3 },
      { size: "M", inStock: true, stockCount: 9 },
      { size: "L", inStock: true, stockCount: 7 },
      { size: "XL", inStock: true, stockCount: 4 },
    ],
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85",
    ],
    inStock: true,
    isNewArrival: true,
    isBestSeller: false,
    collectionHandle: "core-heavyweight",
  },
]

export const INITIAL_ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: "prod_01JADIKT01",
    title: "280 GSM Boxy Heavyweight Tee",
    handle: "boxy-heavyweight-tee-vintage-black",
    subtitle: "100% Combed Compact Cotton • Pre-Shrunk Single Jersey",
    description: "Engineered for superior drape and longevity with zero torque. Features high-density 280 GSM single jersey with ribbed collar and drop-shoulder boxy cut.",
    status: "published",
    category: "Heavyweight Tees",
    collection: "Core Heavyweight",
    gsm: 280,
    price: 1999,
    compareAtPrice: 2499,
    costPrice: 650,
    thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["Heavyweight", "Boxy", "Vintage Black", "280 GSM"],
    variants: [
      { id: "var_1_s", title: "S / Vintage Black", sku: "ADKT-TEE-BLK-S", barcode: "890123400101", size: "S", color: "Vintage Black", inventory: 45, price: 1999, weightGrams: 280 },
      { id: "var_1_m", title: "M / Vintage Black", sku: "ADKT-TEE-BLK-M", barcode: "890123400102", size: "M", color: "Vintage Black", inventory: 60, price: 1999, weightGrams: 300 },
      { id: "var_1_l", title: "L / Vintage Black", sku: "ADKT-TEE-BLK-L", barcode: "890123400103", size: "L", color: "Vintage Black", inventory: 12, price: 1999, weightGrams: 320 },
      { id: "var_1_xl", title: "XL / Vintage Black", sku: "ADKT-TEE-BLK-XL", barcode: "890123400104", size: "XL", color: "Vintage Black", inventory: 3, price: 1999, weightGrams: 340 },
    ],
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-16T15:00:00Z",
    seoTitle: "280 GSM Boxy Heavyweight Tee in Vintage Black | ADIKT",
    seoDescription: "Shop the authentic 280 GSM boxy heavyweight cotton t-shirt. Precision engineered in India.",
  },
  {
    id: "prod_01JADIKT02",
    title: "400 GSM French Terry Drop-Shoulder Hoodie",
    handle: "french-terry-hoodie-olive",
    subtitle: "400 GSM Loopback Fleece • Double-Layered Hood",
    description: "Custom milled French Terry cotton with zero synthetic filler. Features seamless cuffs and a structured double-layer hood.",
    status: "published",
    category: "Hoodies & Fleece",
    collection: "French Terry Fleece",
    gsm: 400,
    price: 3499,
    compareAtPrice: 4299,
    costPrice: 1200,
    thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["Fleece", "French Terry", "400 GSM", "Heavyweight"],
    variants: [
      { id: "var_2_m", title: "M / Olive", sku: "ADKT-HD-OLV-M", barcode: "890123400202", size: "M", color: "Olive", inventory: 28, price: 3499, weightGrams: 750 },
      { id: "var_2_l", title: "L / Olive", sku: "ADKT-HD-OLV-L", barcode: "890123400203", size: "L", color: "Olive", inventory: 34, price: 3499, weightGrams: 800 },
      { id: "var_2_xl", title: "XL / Olive", sku: "ADKT-HD-OLV-XL", barcode: "890123400204", size: "XL", color: "Olive", inventory: 15, price: 3499, weightGrams: 850 },
    ],
    createdAt: "2026-08-05T12:00:00Z",
    updatedAt: "2026-08-16T14:30:00Z",
  },
  {
    id: "prod_01JADIKT03",
    title: "Multi-Pocket Parachute Utility Cargo Pants",
    handle: "parachute-cargo-pants-charcoal",
    subtitle: "High-Tensile Cotton Ripstop • 8 Modular Pockets",
    description: "Tactical streetwear pants with elasticated drawcord hem, heavy duty YKK hardware, and articulated knees for mobility.",
    status: "published",
    category: "Cargos & Bottoms",
    collection: "Parachute Cargos",
    gsm: 320,
    price: 2999,
    compareAtPrice: 3799,
    costPrice: 950,
    thumbnail: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["Cargos", "Ripstop", "Utility", "Streetwear"],
    variants: [
      { id: "var_3_30", title: "30 / Charcoal", sku: "ADKT-CRG-CHR-30", barcode: "890123400301", size: "30", color: "Charcoal", inventory: 20, price: 2999, weightGrams: 520 },
      { id: "var_3_32", title: "32 / Charcoal", sku: "ADKT-CRG-CHR-32", barcode: "890123400302", size: "32", color: "Charcoal", inventory: 40, price: 2999, weightGrams: 540 },
      { id: "var_3_34", title: "34 / Charcoal", sku: "ADKT-CRG-CHR-34", barcode: "890123400303", size: "34", color: "Charcoal", inventory: 18, price: 2999, weightGrams: 560 },
    ],
    createdAt: "2026-08-08T09:00:00Z",
    updatedAt: "2026-08-16T12:00:00Z",
  },
  {
    id: "prod_01JADIKT04",
    title: "380 GSM Heavyweight Oversized Crewneck",
    handle: "oversized-crewneck-heather-grey",
    subtitle: "380 GSM Diagonal Fleece • Ribbed V-Insert",
    description: "Relaxed vintage silhouette with drop shoulders and reinforced coverstitching across all strain seams.",
    status: "published",
    category: "Sweatshirts",
    collection: "Core Heavyweight",
    gsm: 380,
    price: 2799,
    compareAtPrice: 3299,
    costPrice: 850,
    thumbnail: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["Crewneck", "Fleece", "Heather Grey", "380 GSM"],
    variants: [
      { id: "var_4_m", title: "M / Heather Grey", sku: "ADKT-CRW-GRY-M", barcode: "890123400402", size: "M", color: "Heather Grey", inventory: 25, price: 2799, weightGrams: 620 },
      { id: "var_4_l", title: "L / Heather Grey", sku: "ADKT-CRW-GRY-L", barcode: "890123400403", size: "L", color: "Heather Grey", inventory: 8, price: 2799, weightGrams: 650 },
    ],
    createdAt: "2026-08-10T14:00:00Z",
    updatedAt: "2026-08-16T10:00:00Z",
  },
]
