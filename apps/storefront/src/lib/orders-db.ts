import fs from "fs"
import path from "path"
import { AdminOrder } from "./admin-api"
import { PaymentService } from "./payment-service"

export const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: "order_10492",
    displayId: "ADKT-10492",
    customer: {
      id: "cus_1",
      name: "Aditya Sharma",
      email: "aditya.sharma@example.com",
      phone: "+91 98765 43210",
    },
    createdAt: "2026-08-16T14:22:00Z",
    status: "Processing",
    paymentStatus: "Captured",
    fulfillmentStatus: "Unfulfilled",
    total: 3998,
    subtotal: 3998,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 190,
    paymentMethod: "Razorpay Online (Prepaid)",
    courier: "Delhivery",
    awb: "771239084120",
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
        title: "400 GSM Heavyweight Oversized Hoodie",
        variant: "L / Washed Charcoal",
        sku: "ADKT-HD-CHR-L",
        quantity: 1,
        price: 1999,
        thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
      },
    ],
    timeline: [
      { id: "t_1", time: "2026-08-16 14:22", title: "Order Placed", description: "Customer placed order via Razorpay." },
      { id: "t_2", time: "2026-08-16 14:23", title: "Payment Captured", description: "Razorpay payment authorized & verified." },
      { id: "t_3", time: "2026-08-16 15:00", title: "Order Packed", description: "Garments packaged with authentication tags." },
    ],
    notes: ["Customer requested signature delivery on parcel."],
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
    taxTotal: 142,
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
]

function getOrdersFilePath(): string {
  const possiblePaths = [
    path.join(process.cwd(), "apps", "storefront", "data", "orders.json"),
    path.join(process.cwd(), "data", "orders.json"),
    path.join(process.cwd(), "..", "data", "orders.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(process.cwd(), "apps", "storefront", "data", "orders.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

export class OrdersDB {
  private static memoryOrders: AdminOrder[] | null = null

  static getAll(): AdminOrder[] {
    try {
      const filePath = getOrdersFilePath()
      if (filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryOrders = parsed
          return parsed
        }
      }
      // Initialize file
      if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(INITIAL_ORDERS, null, 2), "utf-8")
      }
    } catch (err) {
      console.warn("Error reading orders database:", err)
    }

    if (!this.memoryOrders) {
      this.memoryOrders = [...INITIAL_ORDERS]
    }
    return this.memoryOrders
  }

  static getById(id: string): AdminOrder | undefined {
    const orders = this.getAll()
    return orders.find((o) => o.id === id || o.displayId === id)
  }

  static save(order: AdminOrder): AdminOrder {
    const orders = this.getAll()
    const existingIndex = orders.findIndex(
      (o) => o.id === order.id || o.displayId === order.displayId
    )

    if (existingIndex !== -1) {
      orders[existingIndex] = order
    } else {
      orders.unshift(order)
    }

    this.memoryOrders = orders

    try {
      const filePath = getOrdersFilePath()
      if (filePath) {
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error saving order to disk:", err)
    }

    return order
  }

  static updateStatus(
    id: string,
    status?: AdminOrder["status"],
    awb?: string,
    codCollected?: boolean,
    codNote?: string,
    courier?: string
  ): AdminOrder | undefined {
    const orders = this.getAll()
    const order = orders.find((o) => o.id === id || o.displayId === id)
    if (order) {
      if (status) order.status = status
      if (awb) order.awb = awb
      if (courier) order.courier = courier
      if (status === "Shipped" || status === "Delivered") {
        order.fulfillmentStatus = "Fulfilled"
      }

      // If COD order and cash collected confirmed
      const isCodOrder =
        order.paymentMethod?.toLowerCase().includes("cod") ||
        order.paymentMethod?.toLowerCase().includes("cash on delivery")

      if (status === "Delivered" && (codCollected || isCodOrder)) {
        order.paymentStatus = "Captured"
      }

      order.timeline = order.timeline || []

      let eventTitle = `Status Updated to ${status}`
      let eventDesc = awb
        ? `Assigned AWB ${awb} via ${order.courier}`
        : `Status transitioned to ${status} in Admin workspace.`

      if (status === "Delivered" && isCodOrder) {
        eventTitle = "Delivered & COD Cash Collected"
        eventDesc = `Cash on Delivery payment of ₹${order.total} confirmed and verified. ${codNote || ""}`
      }

      order.timeline.unshift({
        id: `t_${Date.now()}`,
        time: new Date().toISOString().replace("T", " ").substring(0, 16),
        title: eventTitle,
        description: eventDesc,
        user: "Admin",
      })

      this.save(order)

      // Sync with PaymentService ledger
      if (status === "Delivered" && isCodOrder) {
        try {
          PaymentService.settleCodPayment({
            orderId: order.displayId || order.id,
            amount: order.total,
            customerEmail: order.customer?.email,
            customerPhone: order.customer?.phone,
            notes: codNote || `Cash collected upon verified delivery by delivery agent (${order.courier || "Courier"})`,
          })
        } catch (payErr) {
          console.warn("Could not sync COD payment settlement:", payErr)
        }
      }

      return order
    }
    return undefined
  }

  static addNote(id: string, note: string): boolean {
    const orders = this.getAll()
    const order = orders.find((o) => o.id === id || o.displayId === id)
    if (order) {
      order.notes = order.notes || []
      order.notes.push(note)
      this.save(order)
      return true
    }
    return false
  }
}

export type OrderRecord = AdminOrder

export function loadOrdersFromStorage(): AdminOrder[] {
  return OrdersDB.getAll()
}

export function saveOrdersToStorage(orders: AdminOrder[]): void {
  try {
    const filePath = getOrdersFilePath()
    if (filePath) {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf-8")
    }
  } catch (err) {
    console.error("Error saving orders to storage:", err)
  }
}

