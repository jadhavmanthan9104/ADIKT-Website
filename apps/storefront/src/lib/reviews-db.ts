import fs from "fs"
import path from "path"
import { OrdersDB } from "./orders-db"

export interface ReviewRecord {
  id: string
  productId: string
  productTitle: string
  productHandle?: string
  customerEmail: string
  customerName: string
  customerId?: string
  orderId?: string
  rating: number // 1 to 5
  title: string
  comment: string
  images?: string[]
  fitFeedback?: "Runs Small" | "True to Size" | "Runs Oversized"
  status: "Approved" | "Pending" | "Rejected"
  verifiedPurchase: boolean
  createdAt: string
  updatedAt: string
}

export interface RatingSummary {
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export const INITIAL_REVIEWS: ReviewRecord[] = [
  {
    id: "rev_1",
    productId: "prod_01JADIKT01",
    productTitle: "280 GSM Boxy Heavyweight Tee",
    productHandle: "boxy-heavyweight-tee-vintage-black",
    customerEmail: "aditya.sharma@example.com",
    customerName: "Aditya S.",
    rating: 5,
    fitFeedback: "True to Size",
    title: "Unreal drape and neckline structure",
    comment: "The 280 GSM combed cotton has the exact heavyweight vintage feel I was hunting for. The collar stays completely flat after 5 washes and the boxy drop shoulder cut is perfection.",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    ],
    status: "Approved",
    verifiedPurchase: true,
    createdAt: "2026-08-14T10:30:00Z",
    updatedAt: "2026-08-14T10:30:00Z",
  },
  {
    id: "rev_2",
    productId: "prod_01JADIKT01",
    productTitle: "280 GSM Boxy Heavyweight Tee",
    productHandle: "boxy-heavyweight-tee-vintage-black",
    customerEmail: "rohan.varma@gmail.com",
    customerName: "Rohan V.",
    rating: 5,
    fitFeedback: "True to Size",
    title: "Best Indian streetwear blank",
    comment: "Substantial weight without being stifling in humidity. Worth every rupee for the custom milled GSM.",
    status: "Approved",
    verifiedPurchase: true,
    createdAt: "2026-08-12T14:15:00Z",
    updatedAt: "2026-08-12T14:15:00Z",
  },
  {
    id: "rev_3",
    productId: "prod_01JADIKT02",
    productTitle: "400 GSM Heavyweight Oversized Hoodie",
    productHandle: "oversized-heavyweight-hoodie-washed-charcoal",
    customerEmail: "pooja.h@outlook.com",
    customerName: "Pooja H.",
    rating: 5,
    fitFeedback: "Runs Oversized",
    title: "The double-layered hood is phenomenal",
    comment: "Stands up structured without collapsing. Fleece lining is super soft. Will definitely pick up the other colorways.",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    ],
    status: "Approved",
    verifiedPurchase: true,
    createdAt: "2026-08-10T16:45:00Z",
    updatedAt: "2026-08-10T16:45:00Z",
  },
  {
    id: "rev_4",
    productId: "prod_01JADIKT03",
    productTitle: "Multi-Pocket Parachute Utility Cargo Pants",
    productHandle: "multi-pocket-parachute-utility-cargo-pants-charcoal",
    customerEmail: "vikram.m@gmail.com",
    customerName: "Vikram M.",
    rating: 4,
    fitFeedback: "True to Size",
    title: "Heavy-duty hardware and water resistant",
    comment: "Pockets have real functional volume and the ankle toggle adjusters let you switch between wide leg and tapered fit instantly.",
    status: "Approved",
    verifiedPurchase: true,
    createdAt: "2026-08-08T09:20:00Z",
    updatedAt: "2026-08-08T09:20:00Z",
  },
]

function getReviewsFilePath(): string {
  const possiblePaths = [
    path.join(process.cwd(), "apps", "storefront", "data", "reviews.json"),
    path.join(process.cwd(), "data", "reviews.json"),
    path.join(process.cwd(), "..", "data", "reviews.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(process.cwd(), "apps", "storefront", "data", "reviews.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

export class ReviewsDB {
  private static memoryReviews: ReviewRecord[] | null = null

  static getAll(status?: string, productId?: string): ReviewRecord[] {
    try {
      const filePath = getReviewsFilePath()
      if (filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryReviews = parsed
        }
      }
      if (!this.memoryReviews && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(INITIAL_REVIEWS, null, 2), "utf-8")
        this.memoryReviews = [...INITIAL_REVIEWS]
      }
    } catch (err) {
      console.warn("Error reading reviews database:", err)
    }

    if (!this.memoryReviews) {
      this.memoryReviews = [...INITIAL_REVIEWS]
    }

    let result = [...this.memoryReviews]

    if (productId) {
      result = result.filter(
        (r) =>
          r.productId === productId ||
          (r.productHandle && r.productHandle === productId) ||
          r.productTitle?.toLowerCase().includes(productId.toLowerCase())
      )
    }

    if (status && status !== "all") {
      result = result.filter((r) => r.status.toLowerCase() === status.toLowerCase())
    }

    return result
  }

  static getById(id: string): ReviewRecord | undefined {
    const reviews = this.getAll()
    return reviews.find((r) => r.id === id)
  }

  static checkPurchaseVerification(customerEmail: string, productId: string): { isVerified: boolean; orderId?: string } {
    if (!customerEmail) return { isVerified: false }
    try {
      const orders = OrdersDB.getAll()
      const cleanEmail = customerEmail.toLowerCase().trim()

      for (const order of orders) {
        const orderEmail = order.customer?.email?.toLowerCase().trim()
        if (orderEmail === cleanEmail && (order.paymentStatus === "Captured" || order.status === "Delivered" || order.status === "Shipped" || order.paymentMethod?.toLowerCase().includes("cod"))) {
          const hasItem = (order.items || []).some(
            (item: any) =>
              item.id === productId ||
              item.productId === productId ||
              item.sku?.toLowerCase().includes(productId.toLowerCase()) ||
              item.title?.toLowerCase().includes(productId.toLowerCase()) ||
              (productId === "prod_01JADIKT01" && item.title?.includes("Boxy")) ||
              (productId === "prod_01JADIKT02" && item.title?.includes("Hoodie")) ||
              (productId === "prod_01JADIKT03" && item.title?.includes("Cargo"))
          )
          if (hasItem) {
            return { isVerified: true, orderId: order.displayId || order.id }
          }
        }
      }
    } catch (err) {
      console.warn("Error verifying purchase:", err)
    }

    return { isVerified: false }
  }

  static checkDuplicateReview(customerEmail: string, productId: string): boolean {
    if (!customerEmail) return false
    const reviews = this.getAll()
    const cleanEmail = customerEmail.toLowerCase().trim()
    return reviews.some(
      (r) =>
        r.customerEmail.toLowerCase().trim() === cleanEmail &&
        (r.productId === productId || r.productHandle === productId) &&
        r.status !== "Rejected"
    )
  }

  static createReview(reviewData: Omit<ReviewRecord, "id" | "createdAt" | "updatedAt">): ReviewRecord {
    const reviews = this.getAll()

    const newReview: ReviewRecord = {
      ...reviewData,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    reviews.unshift(newReview)
    this.memoryReviews = reviews

    try {
      const filePath = getReviewsFilePath()
      if (filePath) {
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error saving review to disk:", err)
    }

    return newReview
  }

  static updateStatus(id: string, status: ReviewRecord["status"]): ReviewRecord | undefined {
    const reviews = this.getAll()
    const review = reviews.find((r) => r.id === id)
    if (review) {
      review.status = status
      review.updatedAt = new Date().toISOString()
      this.memoryReviews = reviews

      try {
        const filePath = getReviewsFilePath()
        if (filePath) {
          fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2), "utf-8")
        }
      } catch (err) {
        console.error("Error updating review status:", err)
      }

      return review
    }
    return undefined
  }

  static deleteReview(id: string): boolean {
    let reviews = this.getAll()
    const initialLen = reviews.length
    reviews = reviews.filter((r) => r.id !== id)

    if (reviews.length !== initialLen) {
      this.memoryReviews = reviews
      try {
        const filePath = getReviewsFilePath()
        if (filePath) {
          fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2), "utf-8")
        }
      } catch (err) {
        console.error("Error deleting review:", err)
      }
      return true
    }
    return false
  }

  static getRatingSummary(productId: string): RatingSummary {
    const approvedReviews = this.getAll("Approved", productId)

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }

    let sum = 0

    for (const r of approvedReviews) {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5
      distribution[rounded] = (distribution[rounded] || 0) + 1
      sum += r.rating
    }

    const totalReviews = approvedReviews.length
    const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 5.0

    return {
      averageRating,
      totalReviews,
      distribution,
    }
  }
}
