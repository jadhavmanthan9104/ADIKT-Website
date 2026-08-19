import fs from "fs"
import path from "path"

export interface DiscountRule {
  id: string
  code: string
  type: "percentage" | "fixed_amount" | "free_shipping"
  value: number
  minOrderValue: number
  maxDiscount?: number
  applicableTo: "all" | "products" | "collections" | "categories"
  restrictedProductIds?: string[]
  restrictedCollections?: string[]
  restrictedCategories?: string[]
  startsAt: string
  endsAt?: string
  usageLimit?: number
  usageCount: number
  customerUsageLimit?: number
  customerRedemptions: Record<string, number>
  status: "Active" | "Scheduled" | "Expired" | "Disabled"
  description?: string
  createdAt: string
  updatedAt: string
}

export interface DiscountValidationResult {
  valid: boolean
  error?: string
  discountAmount: number
  isFreeShipping?: boolean
  discount?: DiscountRule
}

export const INITIAL_DISCOUNTS: DiscountRule[] = [
  {
    id: "disc_1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderValue: 999,
    maxDiscount: 500,
    applicableTo: "all",
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: "2026-12-31T23:59:59Z",
    usageLimit: 10000,
    usageCount: 142,
    customerUsageLimit: 1,
    customerRedemptions: {
      "aditya.sharma@example.com": 1,
    },
    status: "Active",
    description: "10% off for first-time shoppers (Min order ₹999)",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-16T12:00:00Z",
  },
  {
    id: "disc_2",
    code: "ADIKT20",
    type: "percentage",
    value: 20,
    minOrderValue: 2999,
    maxDiscount: 1000,
    applicableTo: "all",
    startsAt: "2026-08-01T00:00:00Z",
    endsAt: "2026-09-30T23:59:59Z",
    usageLimit: 500,
    usageCount: 89,
    customerUsageLimit: 2,
    customerRedemptions: {},
    status: "Active",
    description: "20% off on drop orders above ₹2,999",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-16T12:00:00Z",
  },
  {
    id: "disc_3",
    code: "HIGHVALUE500",
    type: "fixed_amount",
    value: 500,
    minOrderValue: 3999,
    applicableTo: "all",
    startsAt: "2026-08-01T00:00:00Z",
    usageLimit: 200,
    usageCount: 34,
    customerUsageLimit: 1,
    customerRedemptions: {},
    status: "Active",
    description: "Flat ₹500 off on high-value orders over ₹3,999",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-16T12:00:00Z",
  },
  {
    id: "disc_4",
    code: "COMEBACK10",
    type: "percentage",
    value: 10,
    minOrderValue: 1499,
    maxDiscount: 400,
    applicableTo: "all",
    startsAt: "2026-08-01T00:00:00Z",
    endsAt: "2026-12-31T23:59:59Z",
    usageLimit: 1000,
    usageCount: 18,
    customerUsageLimit: 1,
    customerRedemptions: {},
    status: "Active",
    description: "Abandoned cart recovery 10% coupon",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-16T12:00:00Z",
  },
  {
    id: "disc_5",
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minOrderValue: 999,
    applicableTo: "all",
    startsAt: "2026-01-01T00:00:00Z",
    usageLimit: 5000,
    usageCount: 310,
    customerUsageLimit: 5,
    customerRedemptions: {},
    status: "Active",
    description: "Express Pan-India Free Shipping voucher",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-16T12:00:00Z",
  },
]

function getDiscountsFilePath(): string {
  const possiblePaths = [
    path.join(process.cwd(), "apps", "storefront", "data", "discounts.json"),
    path.join(process.cwd(), "data", "discounts.json"),
    path.join(process.cwd(), "..", "data", "discounts.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(process.cwd(), "apps", "storefront", "data", "discounts.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

export class DiscountsDB {
  private static memoryDiscounts: DiscountRule[] | null = null

  static getAll(): DiscountRule[] {
    try {
      const filePath = getDiscountsFilePath()
      if (filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryDiscounts = parsed
        }
      }
      if (!this.memoryDiscounts && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(INITIAL_DISCOUNTS, null, 2), "utf-8")
        this.memoryDiscounts = [...INITIAL_DISCOUNTS]
      }
    } catch (err) {
      console.warn("Error reading discounts database:", err)
    }

    if (!this.memoryDiscounts) {
      this.memoryDiscounts = [...INITIAL_DISCOUNTS]
    }

    return [...this.memoryDiscounts]
  }

  static getByCode(code: string): DiscountRule | undefined {
    const discounts = this.getAll()
    const cleanCode = (code || "").trim().toUpperCase()
    return discounts.find((d) => d.code.toUpperCase() === cleanCode)
  }

  static getById(id: string): DiscountRule | undefined {
    const discounts = this.getAll()
    return discounts.find((d) => d.id === id)
  }

  static validateDiscount(
    code: string,
    cartSubtotal: number,
    cartItems: { productId?: string; id?: string; price: number; quantity: number; category?: string }[] = [],
    customerEmail?: string
  ): DiscountValidationResult {
    const discount = this.getByCode(code)
    if (!discount) {
      return { valid: false, error: "Invalid coupon code.", discountAmount: 0 }
    }

    // 1. Status check
    if (discount.status !== "Active") {
      return { valid: false, error: `Coupon code is currently ${discount.status.toLowerCase()}.`, discountAmount: 0 }
    }

    // 2. Date checks
    const now = new Date()
    if (discount.startsAt && new Date(discount.startsAt) > now) {
      return { valid: false, error: "Coupon is not active yet.", discountAmount: 0 }
    }
    if (discount.endsAt && new Date(discount.endsAt) < now) {
      return { valid: false, error: "Coupon code has expired.", discountAmount: 0 }
    }

    // 3. Global usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return { valid: false, error: "Coupon redemption limit has been reached.", discountAmount: 0 }
    }

    // 4. Customer specific limit
    if (customerEmail) {
      const cleanEmail = customerEmail.toLowerCase().trim()
      const customerRedemptions = discount.customerRedemptions?.[cleanEmail] || 0
      const limit = discount.customerUsageLimit ?? 1
      if (customerRedemptions >= limit) {
        return {
          valid: false,
          error: `You have already used this coupon code the maximum allowed (${limit} ${limit === 1 ? "time" : "times"}).`,
          discountAmount: 0,
        }
      }
    }

    // 5. Minimum order value
    if (discount.minOrderValue && cartSubtotal < discount.minOrderValue) {
      return {
        valid: false,
        error: `Minimum cart value of ₹${discount.minOrderValue.toLocaleString()} required for this coupon. (Current: ₹${cartSubtotal.toLocaleString()})`,
        discountAmount: 0,
      }
    }

    // 6. Product / Collection restrictions
    let eligibleSubtotal = cartSubtotal
    if (discount.applicableTo === "products" && discount.restrictedProductIds && discount.restrictedProductIds.length > 0) {
      const eligibleItems = cartItems.filter((i) =>
        discount.restrictedProductIds?.some((rId) => rId === i.productId || rId === i.id)
      )
      if (eligibleItems.length === 0) {
        return {
          valid: false,
          error: "This coupon is only valid on select silhouettes.",
          discountAmount: 0,
        }
      }
      eligibleSubtotal = eligibleItems.reduce((acc, curr) => acc + curr.price * (curr.quantity || 1), 0)
    }

    // 7. Calculate discount amount
    let discountAmount = 0
    let isFreeShipping = false

    if (discount.type === "percentage") {
      discountAmount = Math.round((eligibleSubtotal * discount.value) / 100)
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount
      }
    } else if (discount.type === "fixed_amount") {
      discountAmount = Math.min(discount.value, eligibleSubtotal)
    } else if (discount.type === "free_shipping") {
      isFreeShipping = true
      discountAmount = 0
    }

    return {
      valid: true,
      discountAmount,
      isFreeShipping,
      discount,
    }
  }

  static recordDiscountUsage(code: string, customerEmail?: string): boolean {
    const discounts = this.getAll()
    const discount = discounts.find((d) => d.code.toUpperCase() === code.toUpperCase().trim())
    if (!discount) return false

    discount.usageCount = (discount.usageCount || 0) + 1
    if (customerEmail) {
      const cleanEmail = customerEmail.toLowerCase().trim()
      if (!discount.customerRedemptions) discount.customerRedemptions = {}
      discount.customerRedemptions[cleanEmail] = (discount.customerRedemptions[cleanEmail] || 0) + 1
    }
    discount.updatedAt = new Date().toISOString()
    this.memoryDiscounts = discounts

    try {
      const filePath = getDiscountsFilePath()
      if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(discounts, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error saving discount usage to disk:", err)
    }

    return true
  }

  static createDiscount(
    discountData: Omit<DiscountRule, "id" | "usageCount" | "customerRedemptions" | "createdAt" | "updatedAt">
  ): DiscountRule {
    const discounts = this.getAll()

    const newDiscount: DiscountRule = {
      ...discountData,
      id: `disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: discountData.code.toUpperCase().trim(),
      usageCount: 0,
      customerRedemptions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    discounts.unshift(newDiscount)
    this.memoryDiscounts = discounts

    try {
      const filePath = getDiscountsFilePath()
      if (filePath) {
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filePath, JSON.stringify(discounts, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error saving new discount to disk:", err)
    }

    return newDiscount
  }

  static updateDiscount(id: string, updates: Partial<DiscountRule>): DiscountRule | undefined {
    const discounts = this.getAll()
    const discount = discounts.find((d) => d.id === id)
    if (!discount) return undefined

    Object.assign(discount, updates, { updatedAt: new Date().toISOString() })
    this.memoryDiscounts = discounts

    try {
      const filePath = getDiscountsFilePath()
      if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(discounts, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error updating discount on disk:", err)
    }

    return discount
  }

  static deleteDiscount(id: string): boolean {
    let discounts = this.getAll()
    const initialLen = discounts.length
    discounts = discounts.filter((d) => d.id !== id)

    if (discounts.length !== initialLen) {
      this.memoryDiscounts = discounts
      try {
        const filePath = getDiscountsFilePath()
        if (filePath) {
          fs.writeFileSync(filePath, JSON.stringify(discounts, null, 2), "utf-8")
        }
      } catch (err) {
        console.error("Error deleting discount:", err)
      }
      return true
    }
    return false
  }
}
