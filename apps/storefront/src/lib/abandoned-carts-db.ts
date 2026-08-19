import fs from "fs"
import path from "path"

export interface AbandonedCartItem {
  id: string
  productId: string
  title: string
  size: string
  color: string
  price: number
  quantity: number
  thumbnail: string
}

export interface AbandonedCartRecord {
  id: string
  cartId: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  marketingConsent: boolean
  cartValue: number
  items: AbandonedCartItem[]
  createdAt: string
  lastActivityAt: string
  recoveryStatus: "Active" | "Email Sent" | "Recovered" | "Expired"
  recoveryCode?: string
  recoverySentAt?: string
  recoveredOrderId?: string
  recoveryNotes?: string
}

export const INITIAL_ABANDONED_CARTS: AbandonedCartRecord[] = [
  {
    id: "ab_cart_1",
    cartId: "cart_live_9011",
    customerEmail: "neha.kapoor@gmail.com",
    customerName: "Neha Kapoor",
    customerPhone: "9820011223",
    marketingConsent: true,
    cartValue: 5998,
    items: [
      {
        id: "item_1",
        productId: "prod_01JADIKT01",
        title: "280 GSM Boxy Heavyweight Tee",
        size: "M",
        color: "Vintage Black",
        price: 1999,
        quantity: 1,
        thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "item_2",
        productId: "prod_01JADIKT02",
        title: "400 GSM Heavyweight Oversized Hoodie",
        size: "L",
        color: "Washed Charcoal",
        price: 3999,
        quantity: 1,
        thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
      },
    ],
    createdAt: "2026-08-16T14:30:00Z",
    lastActivityAt: "2026-08-16T14:45:00Z",
    recoveryStatus: "Active",
  },
  {
    id: "ab_cart_2",
    cartId: "cart_live_8420",
    customerEmail: "siddharth.m@outlook.com",
    customerName: "Siddharth Malhotra",
    customerPhone: "9819988776",
    marketingConsent: true,
    cartValue: 3499,
    items: [
      {
        id: "item_3",
        productId: "prod_01JADIKT03",
        title: "Multi-Pocket Parachute Utility Cargo Pants",
        size: "32",
        color: "Charcoal",
        price: 3499,
        quantity: 1,
        thumbnail: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80",
      },
    ],
    createdAt: "2026-08-15T18:10:00Z",
    lastActivityAt: "2026-08-15T18:25:00Z",
    recoveryStatus: "Email Sent",
    recoveryCode: "COMEBACK10",
    recoverySentAt: "2026-08-16T09:00:00Z",
    recoveryNotes: "10% Recovery email dispatched to customer",
  },
  {
    id: "ab_cart_3",
    cartId: "cart_live_7211",
    customerEmail: "ananya.r@gmail.com",
    customerName: "Ananya Roy",
    customerPhone: "9769001122",
    marketingConsent: false, // Explicitly opted out
    cartValue: 1999,
    items: [
      {
        id: "item_4",
        productId: "prod_01JADIKT01",
        title: "280 GSM Boxy Heavyweight Tee",
        size: "S",
        color: "Vintage Black",
        price: 1999,
        quantity: 1,
        thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      },
    ],
    createdAt: "2026-08-14T11:00:00Z",
    lastActivityAt: "2026-08-14T11:15:00Z",
    recoveryStatus: "Active",
  },
]

function getAbandonedCartsFilePath(): string {
  const possiblePaths = [
    path.join(process.cwd(), "apps", "storefront", "data", "abandoned-carts.json"),
    path.join(process.cwd(), "data", "abandoned-carts.json"),
    path.join(process.cwd(), "..", "data", "abandoned-carts.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(process.cwd(), "apps", "storefront", "data", "abandoned-carts.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

export class AbandonedCartsDB {
  private static memoryCarts: AbandonedCartRecord[] | null = null

  static getAll(): AbandonedCartRecord[] {
    try {
      const filePath = getAbandonedCartsFilePath()
      if (filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryCarts = parsed
        }
      }
      if (!this.memoryCarts && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(INITIAL_ABANDONED_CARTS, null, 2), "utf-8")
        this.memoryCarts = [...INITIAL_ABANDONED_CARTS]
      }
    } catch (err) {
      console.warn("Error reading abandoned carts database:", err)
    }

    if (!this.memoryCarts) {
      this.memoryCarts = [...INITIAL_ABANDONED_CARTS]
    }

    return [...this.memoryCarts]
  }

  static getById(id: string): AbandonedCartRecord | undefined {
    const carts = this.getAll()
    return carts.find((c) => c.id === id || c.cartId === id)
  }

  static trackCart(cartData: {
    cartId: string
    customerEmail: string
    customerName?: string
    customerPhone?: string
    marketingConsent?: boolean
    cartValue: number
    items: AbandonedCartItem[]
  }): AbandonedCartRecord {
    const carts = this.getAll()
    const existingIndex = carts.findIndex(
      (c) => c.cartId === cartData.cartId || (cartData.customerEmail && c.customerEmail.toLowerCase() === cartData.customerEmail.toLowerCase() && c.recoveryStatus === "Active")
    )

    if (existingIndex > -1) {
      const existing = carts[existingIndex]
      existing.cartValue = cartData.cartValue
      existing.items = cartData.items
      existing.lastActivityAt = new Date().toISOString()
      if (cartData.customerName) existing.customerName = cartData.customerName
      if (cartData.customerPhone) existing.customerPhone = cartData.customerPhone
      if (typeof cartData.marketingConsent === "boolean") existing.marketingConsent = cartData.marketingConsent
      this.memoryCarts = carts
      this.saveToDisk()
      return existing
    }

    const newRecord: AbandonedCartRecord = {
      id: `ab_cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      cartId: cartData.cartId || `cart_${Date.now()}`,
      customerEmail: cartData.customerEmail,
      customerName: cartData.customerName || "Shopper",
      customerPhone: cartData.customerPhone,
      marketingConsent: cartData.marketingConsent ?? true,
      cartValue: cartData.cartValue,
      items: cartData.items || [],
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      recoveryStatus: "Active",
    }

    carts.unshift(newRecord)
    this.memoryCarts = carts
    this.saveToDisk()
    return newRecord
  }

  static markAsRecovered(cartIdOrEmail: string, orderId: string): boolean {
    const carts = this.getAll()
    const target = carts.find(
      (c) =>
        (c.cartId === cartIdOrEmail || c.customerEmail.toLowerCase() === cartIdOrEmail.toLowerCase()) &&
        c.recoveryStatus !== "Recovered"
    )

    if (target) {
      target.recoveryStatus = "Recovered"
      target.recoveredOrderId = orderId
      target.lastActivityAt = new Date().toISOString()
      this.memoryCarts = carts
      this.saveToDisk()
      return true
    }
    return false
  }

  static sendRecoveryCampaign(id: string, discountCode: string = "COMEBACK10"): { success: boolean; error?: string } {
    const carts = this.getAll()
    const cart = carts.find((c) => c.id === id)
    if (!cart) {
      return { success: false, error: "Abandoned cart not found." }
    }

    // Consent Validation
    if (cart.marketingConsent === false) {
      return {
        success: false,
        error: "Cannot send recovery marketing message: Customer has explicitly opted out of marketing communications.",
      }
    }

    cart.recoveryStatus = "Email Sent"
    cart.recoveryCode = discountCode
    cart.recoverySentAt = new Date().toISOString()
    cart.recoveryNotes = `Recovery broadcast dispatched with coupon ${discountCode}`
    this.memoryCarts = carts
    this.saveToDisk()

    return { success: true }
  }

  static deleteCart(id: string): boolean {
    let carts = this.getAll()
    const initialLen = carts.length
    carts = carts.filter((c) => c.id !== id)

    if (carts.length !== initialLen) {
      this.memoryCarts = carts
      this.saveToDisk()
      return true
    }
    return false
  }

  private static saveToDisk() {
    try {
      const filePath = getAbandonedCartsFilePath()
      if (filePath && this.memoryCarts) {
        fs.writeFileSync(filePath, JSON.stringify(this.memoryCarts, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error saving abandoned carts to disk:", err)
    }
  }
}
