import { OrdersDB } from "./orders-db"
import { CustomerAuthService } from "./auth/customer-auth-service"

export interface CustomerSegmentMember {
  id: string
  name: string
  email: string
  phone?: string
  orderCount: number
  totalSpend: number
  avgOrderValue: number
  lastOrderDate?: string
  marketingConsent: boolean
  registeredAt: string
}

export interface CustomerSegment {
  id: string
  name: string
  slug: string
  description: string
  memberCount: number
  percentageOfTotal: number
  avgLtv: number
  members: CustomerSegmentMember[]
}

export class SegmentsService {
  static getCustomerStats(): CustomerSegmentMember[] {
    const rawCustomers = CustomerAuthService.getAllCustomersAdmin()
    const allOrders = OrdersDB.getAll()

    return rawCustomers.map((c) => {
      const customerOrders = allOrders.filter(
        (o) =>
          (o.customer?.email && o.customer.email.toLowerCase().trim() === c.email.toLowerCase().trim()) ||
          o.customer?.id === c.id
      )

      const orderCount = customerOrders.length
      const totalSpend = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      const avgOrderValue = orderCount > 0 ? Math.round(totalSpend / orderCount) : 0

      // Find latest order date
      let lastOrderDate: string | undefined = undefined
      if (orderCount > 0) {
        const sortedOrders = [...customerOrders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        lastOrderDate = sortedOrders[0]?.createdAt
      }

      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName || ""}`.trim() || "Valued Customer",
        email: c.email,
        phone: c.phone,
        orderCount,
        totalSpend,
        avgOrderValue,
        lastOrderDate,
        marketingConsent: c.marketingConsent ?? true, // Default to true on account creation
        registeredAt: c.createdAt,
      }
    })
  }

  static getSegments(): CustomerSegment[] {
    const members = this.getCustomerStats()
    const totalCount = Math.max(1, members.length)
    const now = new Date().getTime()
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000

    // 1. All customers
    const allMembers = [...members]

    // 2. New customers (registered <= 30 days ago or 0-1 orders)
    const newMembers = members.filter(
      (m) => now - new Date(m.registeredAt).getTime() <= thirtyDaysMs || m.orderCount <= 1
    )

    // 3. Returning customers (>= 2 completed orders)
    const returningMembers = members.filter((m) => m.orderCount >= 2)

    // 4. High-value customers (Lifetime spend >= 8,000 or AOV >= 3,500)
    const highValueMembers = members.filter((m) => m.totalSpend >= 8000 || m.avgOrderValue >= 3500)

    // 5. Inactive customers (has orders, but none in past 60 days)
    const inactiveMembers = members.filter((m) => {
      if (m.orderCount === 0 || !m.lastOrderDate) return false
      return now - new Date(m.lastOrderDate).getTime() > sixtyDaysMs
    })

    // 6. Customers with no purchase
    const noPurchaseMembers = members.filter((m) => m.orderCount === 0)

    // 7. Customers with multiple purchases (>= 2 orders)
    const multiplePurchasesMembers = members.filter((m) => m.orderCount >= 2)

    const buildSegment = (
      id: string,
      name: string,
      slug: string,
      description: string,
      segMembers: CustomerSegmentMember[]
    ): CustomerSegment => {
      const segTotalSpend = segMembers.reduce((acc, m) => acc + m.totalSpend, 0)
      const avgLtv = segMembers.length > 0 ? Math.round(segTotalSpend / segMembers.length) : 0
      return {
        id,
        name,
        slug,
        description,
        memberCount: segMembers.length,
        percentageOfTotal: Math.round((segMembers.length / totalCount) * 100),
        avgLtv,
        members: segMembers,
      }
    }

    return [
      buildSegment("seg_all", "All Customers", "all", "Total registered customer base with marketing consent tracking", allMembers),
      buildSegment("seg_new", "New Customers", "new", "Recently onboarded shoppers registered within 30 days", newMembers),
      buildSegment("seg_returning", "Returning Customers", "returning", "Loyal repeat buyers with 2+ completed drop orders", returningMembers),
      buildSegment("seg_high_value", "High-Value VIPs", "high-value", "Top-tier clientele with ₹8,000+ LTV or premium AOV", highValueMembers),
      buildSegment("seg_inactive", "Inactive Customers", "inactive", "Shoppers with past purchases but no activity in 60+ days", inactiveMembers),
      buildSegment("seg_no_purchase", "Customers with No Purchase", "no-purchase", "Registered accounts that haven't placed their first drop order", noPurchaseMembers),
      buildSegment("seg_multiple", "Multiple Purchases", "multiple-purchases", "Customers who have completed 2 or more separate orders", multiplePurchasesMembers),
    ]
  }

  static getSegmentBySlug(slug: string): CustomerSegment | undefined {
    const segments = this.getSegments()
    return segments.find((s) => s.slug === slug || s.id === slug)
  }
}
