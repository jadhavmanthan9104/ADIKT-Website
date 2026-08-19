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

export interface AdminInventoryItem {
  id: string
  productTitle: string
  productId: string
  variantTitle: string
  sku: string
  barcode: string
  gsm: number
  available: number
  reserved: number
  incoming: number
  lowStockThreshold: number
  location: string
  lastUpdated: string
}

export interface AdminOrder {
  id: string
  displayId: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  createdAt: string
  status: "Pending" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Refunded"
  paymentStatus: "Captured" | "Settled" | "Pending" | "Refunded" | "Failed"
  fulfillmentStatus: "Unfulfilled" | "Fulfilled" | "Partially Fulfilled" | "Returned"
  total: number
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  paymentMethod: "Razorpay Online (Prepaid)" | "Cash on Delivery (COD)"
  courier: string
  awb?: string
  shippingAddress: {
    name: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  billingAddress?: {
    name: string
    addressLine1: string
    city: string
    pincode: string
  }
  items: {
    id: string
    title: string
    variant: string
    sku: string
    quantity: number
    price: number
    thumbnail: string
  }[]
  timeline: {
    id: string
    time: string
    title: string
    description: string
    user?: string
  }[]
  notes: string[]
}

export interface AdminCustomer {
  id: string
  name: string
  email: string
  phone: string
  orderCount: number
  totalSpent: number
  aov: number
  lastOrderDate: string
  status: "Active" | "Inactive" | "VIP"
  city: string
  state: string
  createdAt: string
  tags: string[]
  notes?: string
}

export interface AdminDiscount {
  id: string
  code: string
  type: "percentage" | "fixed_amount" | "free_shipping"
  value: number
  minOrderValue: number
  maxDiscount?: number
  usageCount: number
  usageLimit?: number
  startsAt: string
  endsAt?: string
  status: "Active" | "Scheduled" | "Expired" | "Disabled"
  applicableTo: "all" | "products" | "categories"
}

export interface AdminReturn {
  id: string
  orderId: string
  orderDisplayId: string
  customerName: string
  customerEmail: string
  createdAt: string
  status: "Requested" | "Approved" | "Picked Up" | "Received & Restocked" | "Rejected" | "Refunded"
  reason: "Size / Fit Issue" | "Fabric / GSM Mismatch" | "Damaged in Transit" | "Defective Stitching"
  items: {
    title: string
    variant: string
    quantity: number
    refundAmount: number
  }[]
  totalRefund: number
}

export interface AdminReview {
  id: string
  productId: string
  productTitle: string
  customerName: string
  customerEmail: string
  rating: number
  fitFeedback: "Runs Small" | "True to Size" | "Runs Oversized"
  title: string
  comment: string
  status: "Approved" | "Pending" | "Rejected"
  createdAt: string
  verifiedPurchase: boolean
}

export interface AdminContentItem {
  hero: {
    badge: string
    headline: string
    subheadline: string
    ctaText: string
    ctaLink: string
    secondaryCtaText: string
    secondaryCtaLink: string
    bannerImage: string
  }
  announcement: {
    text: string
    active: boolean
  }
  faqItems: {
    id: string
    category: string
    question: string
    answer: string
  }[]
}

// Initial In-Memory Admin State Cache for Instant Fast Operations
const INITIAL_ADMIN_PRODUCTS: AdminProduct[] = [
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

const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: "order_10492",
    displayId: "ADKT-10492",
    customer: {
      id: "cus_1",
      name: "Aditya Sharma",
      email: "aditya.sharma@example.com",
      phone: "+91 98765 43210",
    },
    createdAt: "2026-08-16T14:30:00Z",
    status: "Processing",
    paymentStatus: "Captured",
    fulfillmentStatus: "Unfulfilled",
    total: 4948,
    subtotal: 5498,
    discountTotal: 550,
    shippingTotal: 0,
    taxTotal: 236,
    paymentMethod: "Razorpay Online (Prepaid)",
    courier: "Delhivery Express",
    awb: "14328909871",
    shippingAddress: {
      name: "Aditya Sharma",
      phone: "+91 98765 43210",
      addressLine1: "B-402, Highline Residences, Linking Road",
      addressLine2: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
    },
    items: [
      {
        id: "item_1",
        title: "280 GSM Boxy Heavyweight Tee",
        variant: "L / Vintage Black",
        sku: "ADKT-TEE-BLK-L",
        quantity: 1,
        price: 1999,
        thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "item_2",
        title: "400 GSM French Terry Drop-Shoulder Hoodie",
        variant: "XL / Olive",
        sku: "ADKT-HD-OLV-XL",
        quantity: 1,
        price: 3499,
        thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
      },
    ],
    timeline: [
      { id: "t_1", time: "2026-08-16 14:30", title: "Order Placed", description: "Customer paid ₹4,948 via Razorpay UPI." },
      { id: "t_2", time: "2026-08-16 14:31", title: "Payment Captured", description: "Razorpay Payment ID: pay_Oz91823Jlkasdf" },
      { id: "t_3", time: "2026-08-16 15:10", title: "Fulfillment Initialized", description: "Warehouse allocated inventory items." },
    ],
    notes: ["Customer requested priority dispatch for upcoming event."],
  },
  {
    id: "order_10491",
    displayId: "ADKT-10491",
    customer: {
      id: "cus_2",
      name: "Rohan Varma",
      email: "rohan.varma@gmail.com",
      phone: "+91 98111 22334",
    },
    createdAt: "2026-08-16T11:15:00Z",
    status: "Shipped",
    paymentStatus: "Captured",
    fulfillmentStatus: "Fulfilled",
    total: 2999,
    subtotal: 2999,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 143,
    paymentMethod: "Razorpay Online (Prepaid)",
    courier: "Bluedart Express",
    awb: "881273918",
    shippingAddress: {
      name: "Rohan Varma",
      phone: "+91 98111 22334",
      addressLine1: "Flat 12A, Brigade Gateway",
      addressLine2: "Malleshwaram",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560055",
    },
    items: [
      {
        id: "item_3",
        title: "Multi-Pocket Parachute Utility Cargo Pants",
        variant: "32 / Charcoal",
        sku: "ADKT-CRG-CHR-32",
        quantity: 1,
        price: 2999,
        thumbnail: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=400&q=80",
      },
    ],
    timeline: [
      { id: "t_4", time: "2026-08-16 11:15", title: "Order Placed", description: "Paid via Razorpay NetBanking." },
      { id: "t_5", time: "2026-08-16 13:00", title: "Dispatched", description: "Bluedart tracking AWB 881273918 assigned." },
    ],
    notes: [],
  },
  {
    id: "order_10490",
    displayId: "ADKT-10490",
    customer: {
      id: "cus_3",
      name: "Pooja Hegde",
      email: "pooja.h@outlook.com",
      phone: "+91 97654 11223",
    },
    createdAt: "2026-08-15T18:45:00Z",
    status: "Delivered",
    paymentStatus: "Captured",
    fulfillmentStatus: "Fulfilled",
    total: 3998,
    subtotal: 3998,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 190,
    paymentMethod: "Razorpay Online (Prepaid)",
    courier: "Delhivery Express",
    awb: "14829103982",
    shippingAddress: {
      name: "Pooja Hegde",
      phone: "+91 97654 11223",
      addressLine1: "A-301, Palm Meadows",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
    },
    items: [
      {
        id: "item_4",
        title: "280 GSM Boxy Heavyweight Tee",
        variant: "M / Vintage Black",
        sku: "ADKT-TEE-BLK-M",
        quantity: 2,
        price: 1999,
        thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      },
    ],
    timeline: [
      { id: "t_6", time: "2026-08-15 18:45", title: "Order Placed", description: "Prepaid Razorpay." },
      { id: "t_7", time: "2026-08-16 17:00", title: "Delivered", description: "Successfully delivered to customer." },
    ],
    notes: [],
  },
  {
    id: "order_10489",
    displayId: "ADKT-10489",
    customer: {
      id: "cus_4",
      name: "Vikram Malhotra",
      email: "vikram.m@gmail.com",
      phone: "+91 98200 44556",
    },
    createdAt: "2026-08-15T12:20:00Z",
    status: "Pending",
    paymentStatus: "Pending",
    fulfillmentStatus: "Unfulfilled",
    total: 3499,
    subtotal: 3499,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 166,
    paymentMethod: "Cash on Delivery (COD)",
    courier: "Delhivery Express",
    shippingAddress: {
      name: "Vikram Malhotra",
      phone: "+91 98200 44556",
      addressLine1: "C-14, Hauz Khas Enclave",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110016",
    },
    items: [
      {
        id: "item_5",
        title: "400 GSM French Terry Drop-Shoulder Hoodie",
        variant: "L / Olive",
        sku: "ADKT-HD-OLV-L",
        quantity: 1,
        price: 3499,
        thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
      },
    ],
    timeline: [
      { id: "t_8", time: "2026-08-15 12:20", title: "COD Order Placed", description: "Awaiting automated OTP verification." },
    ],
    notes: ["COD OTP confirmed via WhatsApp."],
  },
]

const INITIAL_ADMIN_CUSTOMERS: AdminCustomer[] = [
  {
    id: "cus_1",
    name: "Aditya Sharma",
    email: "aditya.sharma@example.com",
    phone: "+91 98765 43210",
    orderCount: 5,
    totalSpent: 18450,
    aov: 3690,
    lastOrderDate: "2026-08-16",
    status: "VIP",
    city: "Mumbai",
    state: "Maharashtra",
    createdAt: "2026-04-12",
    tags: ["High AOV", "Streetwear Enthusiast", "Frequent Buyer"],
  },
  {
    id: "cus_2",
    name: "Rohan Varma",
    email: "rohan.varma@gmail.com",
    phone: "+91 98111 22334",
    orderCount: 2,
    totalSpent: 6498,
    aov: 3249,
    lastOrderDate: "2026-08-16",
    status: "Active",
    city: "Bengaluru",
    state: "Karnataka",
    createdAt: "2026-06-20",
    tags: ["Cargo Lover"],
  },
  {
    id: "cus_3",
    name: "Pooja Hegde",
    email: "pooja.h@outlook.com",
    phone: "+91 97654 11223",
    orderCount: 3,
    totalSpent: 8997,
    aov: 2999,
    lastOrderDate: "2026-08-15",
    status: "Active",
    city: "Hyderabad",
    state: "Telangana",
    createdAt: "2026-05-18",
    tags: ["Tees Collector"],
  },
  {
    id: "cus_4",
    name: "Vikram Malhotra",
    email: "vikram.m@gmail.com",
    phone: "+91 98200 44556",
    orderCount: 1,
    totalSpent: 3499,
    aov: 3499,
    lastOrderDate: "2026-08-15",
    status: "Active",
    city: "New Delhi",
    state: "Delhi",
    createdAt: "2026-08-15",
    tags: ["COD Buyer"],
  },
]

const INITIAL_ADMIN_DISCOUNTS: AdminDiscount[] = [
  {
    id: "disc_1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderValue: 999,
    maxDiscount: 500,
    usageCount: 184,
    usageLimit: 1000,
    startsAt: "2026-01-01",
    status: "Active",
    applicableTo: "all",
  },
  {
    id: "disc_2",
    code: "ADIKT20",
    type: "percentage",
    value: 20,
    minOrderValue: 3999,
    maxDiscount: 1000,
    usageCount: 62,
    usageLimit: 200,
    startsAt: "2026-08-01",
    endsAt: "2026-08-31",
    status: "Active",
    applicableTo: "all",
  },
  {
    id: "disc_3",
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minOrderValue: 1499,
    usageCount: 420,
    startsAt: "2026-01-01",
    status: "Active",
    applicableTo: "all",
  },
]

const INITIAL_ADMIN_RETURNS: AdminReturn[] = [
  {
    id: "ret_1",
    orderId: "order_10388",
    orderDisplayId: "ADKT-10388",
    customerName: "Aditya Sharma",
    customerEmail: "aditya.sharma@example.com",
    createdAt: "2026-08-10",
    status: "Approved",
    reason: "Size / Fit Issue",
    items: [
      { title: "Multi-Pocket Parachute Utility Cargo Pants", variant: "34 / Charcoal", quantity: 1, refundAmount: 2999 },
    ],
    totalRefund: 2999,
  },
]

const INITIAL_ADMIN_REVIEWS: AdminReview[] = [
  {
    id: "rev_1",
    productId: "prod_01JADIKT01",
    productTitle: "280 GSM Boxy Heavyweight Tee",
    customerName: "Kabir S.",
    customerEmail: "kabir.s@gmail.com",
    rating: 5,
    fitFeedback: "Runs Oversized",
    title: "Best heavyweight tee in India by far",
    comment: "The 280 GSM density feels substantial without being stifling. Collar does not bacon after 5 washes.",
    status: "Approved",
    createdAt: "2026-08-12",
    verifiedPurchase: true,
  },
  {
    id: "rev_2",
    productId: "prod_01JADIKT02",
    productTitle: "400 GSM French Terry Drop-Shoulder Hoodie",
    customerName: "Dev M.",
    customerEmail: "dev.m@gmail.com",
    rating: 5,
    fitFeedback: "True to Size",
    title: "Insane structured hood",
    comment: "Worth every rupee. The 400 GSM loopback fleece stands up on its own.",
    status: "Approved",
    createdAt: "2026-08-14",
    verifiedPurchase: true,
  },
]

const INITIAL_ADMIN_CONTENT: AdminContentItem = {
  hero: {
    badge: "HEAVYWEIGHT SERIES DROP 04",
    headline: "ENGINEERED 280–400 GSM ARCHIVAL STREETWEAR",
    subheadline: "Custom knit in India with single-origin combed cotton. Cut for an uncompromising boxy silhouette with zero shrinkage.",
    ctaText: "Explore Drop 04",
    ctaLink: "/shop",
    secondaryCtaText: "Material Science",
    secondaryCtaLink: "/about",
    bannerImage: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1800&q=85",
  },
  announcement: {
    text: "⚡ FREE EXPRESS SHIPPING ON ORDERS OVER ₹1,999 | CRAFTED IN INDIA WITH 280-400 GSM FABRICS",
    active: true,
  },
  faqItems: [
    { id: "faq_1", category: "Fabric & GSM", question: "What does 280–400 GSM mean?", answer: "GSM stands for Grams per Square Meter. Standard commercial t-shirts are 160–180 GSM. Our tees start at 280 GSM and hoodies at 400 GSM, delivering unrivaled durability." },
    { id: "faq_2", category: "Delivery", question: "How long does shipping take in India?", answer: "All orders are dispatched within 24 hours via Delhivery Express or Bluedart Air with 2-4 business days delivery." },
  ],
}

// Service Layer
import { productStore } from "./product-store"
import { contentStore } from "./content-store"

export class AdminDataService {
  private static orders: AdminOrder[] = [...INITIAL_ADMIN_ORDERS]
  private static customers: AdminCustomer[] = [...INITIAL_ADMIN_CUSTOMERS]
  private static discounts: AdminDiscount[] = [...INITIAL_ADMIN_DISCOUNTS]
  private static returns: AdminReturn[] = [...INITIAL_ADMIN_RETURNS]
  private static reviews: AdminReview[] = [...INITIAL_ADMIN_REVIEWS]

  // Metrics
  static getMetrics() {
    const totalRevenue = this.orders.reduce((acc, o) => acc + (o.paymentStatus === "Captured" ? o.total : 0), 0)
    const netRevenue = totalRevenue - 2999 // minus refunds
    const todayOrders = this.orders.filter(o => o.createdAt.startsWith("2026-08-16")).length
    const todaySales = this.orders.filter(o => o.createdAt.startsWith("2026-08-16")).reduce((acc, o) => acc + o.total, 0)
    const aov = Math.round(totalRevenue / (this.orders.length || 1))

    return {
      todaySales,
      todayOrders,
      totalRevenue,
      netRevenue,
      totalOrders: this.orders.length,
      aov,
      newCustomers: 14,
      returningCustomers: 28,
      conversionRate: 3.8,
      refunds: 2999,
      cancelledOrders: 0,
      lowStockAlerts: 4,
    }
  }

  // Products
  static getProducts(): AdminProduct[] {
    return productStore.getAllAdminProducts()
  }

  static getProductById(id: string): AdminProduct | undefined {
    return productStore.getAdminProductById(id)
  }

  static createProduct(product: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">): AdminProduct {
    return productStore.createFromAdmin(product)
  }

  static updateProduct(id: string, updates: Partial<AdminProduct>): AdminProduct | undefined {
    return productStore.updateFromAdmin(id, updates)
  }

  static deleteProduct(id: string): boolean {
    return productStore.deleteFromAdmin(id)
  }

  // Inventory Matrix
  static getInventoryMatrix(): AdminInventoryItem[] {
    const items: AdminInventoryItem[] = []
    const prods = productStore.getAllAdminProducts()
    for (const prod of prods) {
      for (const v of prod.variants || []) {
        items.push({
          id: `${prod.id}_${v.id}`,
          productId: prod.id,
          productTitle: prod.title,
          variantTitle: v.title,
          sku: v.sku,
          barcode: v.barcode,
          gsm: prod.gsm,
          available: v.inventory,
          reserved: Math.floor(v.inventory * 0.15),
          incoming: 50,
          lowStockThreshold: 10,
          location: "Warehouse Mumbai Alpha (WH-1)",
          lastUpdated: prod.updatedAt || new Date().toISOString(),
        })
      }
    }
    return items
  }

  static adjustStock(sku: string, delta: number, reason: string): boolean {
    const prods = productStore.getAllAdminProducts()
    for (const prod of prods) {
      const v = prod.variants?.find(item => item.sku === sku)
      if (v) {
        v.inventory = Math.max(0, v.inventory + delta)
        prod.updatedAt = new Date().toISOString()
        productStore.syncFromAdmin(prod)
        return true
      }
    }
    return false
  }

  // Orders
  static getOrders(): AdminOrder[] {
    return this.orders
  }

  static getOrderById(id: string): AdminOrder | undefined {
    const orders = this.getOrders()
    return orders.find(o => o.id === id || o.displayId === id)
  }

  static createOrder(order: AdminOrder): AdminOrder {
    const orders = this.getOrders()
    const existingIndex = orders.findIndex(o => o.id === order.id || o.displayId === order.displayId)
    if (existingIndex !== -1) {
      orders[existingIndex] = order
    } else {
      orders.unshift(order)
    }
    this.orders = orders
    return order
  }

  static updateOrderStatus(id: string, status: AdminOrder["status"], awb?: string): AdminOrder | undefined {
    const orders = this.getOrders()
    const order = orders.find(o => o.id === id || o.displayId === id)
    if (order) {
      order.status = status
      if (awb) order.awb = awb
      if (status === "Shipped") order.fulfillmentStatus = "Fulfilled"
      order.timeline.push({
        id: `t_${Date.now()}`,
        time: new Date().toISOString().replace("T", " ").substring(0, 16),
        title: `Status Updated to ${status}`,
        description: awb ? `Assigned AWB ${awb} via ${order.courier}` : "Status transitioned in Admin workspace.",
        user: "Admin",
      })
      this.orders = orders
      return order
    }
    return undefined
  }

  static addOrderNote(id: string, note: string): boolean {
    const orders = this.getOrders()
    const order = orders.find(o => o.id === id || o.displayId === id)
    if (order) {
      order.notes.push(note)
      this.orders = orders
      return true
    }
    return false
  }

  // Customers
  static getCustomers(): AdminCustomer[] {
    return this.customers
  }

  static getCustomerById(id: string): AdminCustomer | undefined {
    return this.customers.find(c => c.id === id)
  }

  // Discounts
  static getDiscounts(): AdminDiscount[] {
    return this.discounts
  }

  static createDiscount(discount: Omit<AdminDiscount, "id" | "usageCount">): AdminDiscount {
    const created: AdminDiscount = {
      ...discount,
      id: `disc_${Date.now()}`,
      usageCount: 0,
    }
    this.discounts.unshift(created)
    return created
  }

  static toggleDiscountStatus(id: string): boolean {
    const disc = this.discounts.find(d => d.id === id)
    if (disc) {
      disc.status = disc.status === "Active" ? "Disabled" : "Active"
      return true
    }
    return false
  }

  // Returns
  static getReturns(): AdminReturn[] {
    return this.returns
  }

  static updateReturnStatus(id: string, status: AdminReturn["status"]): boolean {
    const ret = this.returns.find(r => r.id === id)
    if (ret) {
      ret.status = status

      // Non-blocking asynchronous notification dispatch
      if (typeof window !== "undefined" && ret.customerEmail) {
        let notifType: string | null = null
        if (status === "Approved") notifType = "return_approved"
        else if (status === "Rejected") notifType = "return_rejected"
        else if (status === "Received & Restocked") notifType = "return_received"

        if (notifType) {
          fetch("/api/admin/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: notifType,
              recipientEmail: ret.customerEmail,
              customerName: ret.customerName,
              data: {
                returnId: ret.id,
                orderId: ret.orderDisplayId,
                reason: ret.reason,
                refundAmount: ret.totalRefund,
              },
            }),
          }).catch(() => {})
        }
      }

      return true
    }
    return false
  }

  // Reviews
  static getReviews(): AdminReview[] {
    return this.reviews
  }

  static updateReviewStatus(id: string, status: AdminReview["status"]): boolean {
    const rev = this.reviews.find(r => r.id === id)
    if (rev) {
      rev.status = status
      return true
    }
    return false
  }

  // Content CMS
  static getContent(): AdminContentItem {
    return contentStore.getContent()
  }

  static updateContent(updates: Partial<AdminContentItem>): AdminContentItem {
    return contentStore.updateContent(updates)
  }
}
