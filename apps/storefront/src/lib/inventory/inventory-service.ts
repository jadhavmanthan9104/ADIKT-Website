import fs from "fs"
import path from "path"
import { productStore } from "../product-store"

/**
 * Medusa-Aligned Inventory Management Service
 * 
 * Supports the strict Medusa hierarchy:
 * Product -> Variant -> Size -> Color -> SKU -> Inventory Item -> Location -> Stocked / Reserved / Available
 * 
 * Implements:
 * - Atomic stock reservations with optimistic concurrency locks (preventing overselling)
 * - Stock deduction on payment capture
 * - Stock release on payment failure or checkout abandonment
 * - Stock restoration on order cancellation
 * - Reverse logistics returns (Restockable vs Damaged Quarantine)
 * - Manual adjustments & warehouse cycle counts
 * - Low-stock & Out-of-stock threshold triggers
 * - Chronological inventory audit history
 */

export interface InventoryItem {
  id: string
  sku: string
  barcode: string
  productId: string
  productTitle: string
  variantId: string
  variantTitle: string
  size: string
  color: string
  gsm?: number
  location: string
  stockedQuantity: number
  reservedQuantity: number
  availableQuantity: number
  lowStockThreshold: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
  weightGrams?: number
  price: number
  thumbnail?: string
}

export interface StockReservation {
  id: string
  cartId: string
  sku: string
  quantity: number
  expiresAt: number // timestamp
  createdAt: string
}

export type InventoryAdjustmentType =
  | "RESTOCK"
  | "MANUAL_ADJUSTMENT"
  | "RESERVATION"
  | "RELEASE"
  | "PURCHASE_DEDUCTION"
  | "CANCELLATION_RESTORE"
  | "RETURN_RESTOCK"
  | "DAMAGED_QUARANTINE"

export interface InventoryHistoryEntry {
  id: string
  sku: string
  productTitle: string
  variantTitle: string
  delta: number
  previousStocked: number
  newStocked: number
  previousReserved?: number
  newReserved?: number
  type: InventoryAdjustmentType
  reason: string
  location: string
  user: string
  timestamp: string
}

// In-Memory reservations map: cartId -> StockReservation[]
const activeReservations: Map<string, StockReservation[]> = new Map()

function normalizeInventoryRequestItems<T extends { sku?: string; variantId?: string; id?: string; title?: string; quantity: number }>(
  items: T[]
): T[] {
  const normalized = new Map<string, T>()

  for (const item of items) {
    const key = (item.sku || item.variantId || item.id || item.title || "").toLowerCase().trim()
    const existing = normalized.get(key)

    if (existing) {
      normalized.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      })
    } else {
      normalized.set(key, { ...item })
    }
  }

  return [...normalized.values()]
}

// In-Memory history log with disk persistence
let memoryHistoryLogs: InventoryHistoryEntry[] = [
  {
    id: "hist_1",
    sku: "ADKT-TEE-BLK-L",
    productTitle: "280 GSM Boxy Heavyweight Tee",
    variantTitle: "L / Vintage Black",
    delta: 50,
    previousStocked: 12,
    newStocked: 62,
    type: "RESTOCK",
    reason: "Tirupur Milled Garment Restock Batch #409",
    location: "Tirupur Warehouse WH-1",
    user: "Inventory Manager",
    timestamp: "2026-08-16 10:00",
  },
  {
    id: "hist_2",
    sku: "ADKT-HD-OLV-M",
    productTitle: "400 GSM French Terry Drop-Shoulder Hoodie",
    variantTitle: "M / Olive",
    delta: -1,
    previousStocked: 29,
    newStocked: 28,
    type: "DAMAGED_QUARANTINE",
    reason: "Marked damaged in packaging inspection (Quarantine)",
    location: "Tirupur Warehouse WH-1",
    user: "QA Inspector",
    timestamp: "2026-08-15 14:30",
  },
]

function getHistoryFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "inventory-history.json"),
    path.join(process.cwd(), "data", "inventory-history.json"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[0]
}

function loadHistoryFromDisk() {
  if (typeof window === "undefined") {
    try {
      const filePath = getHistoryFilePath()
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const data = JSON.parse(raw)
        if (Array.isArray(data)) {
          memoryHistoryLogs = data
        } else if (data?.history && Array.isArray(data.history)) {
          memoryHistoryLogs = data.history
        }
      }
    } catch (err) {
      console.error("[InventoryService] Error reading inventory history from disk:", err)
    }
  }
}

function saveHistoryToDisk() {
  if (typeof window === "undefined") {
    try {
      const jsonStr = JSON.stringify(memoryHistoryLogs, null, 2)
      const targets = [
        path.join(process.cwd(), "apps", "storefront", "data", "inventory-history.json"),
        path.join(process.cwd(), "data", "inventory-history.json"),
      ]
      for (const target of targets) {
        try {
          const dir = path.dirname(target)
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(target, jsonStr, "utf-8")
        } catch {}
      }
    } catch (err) {
      console.error("[InventoryService] Error saving inventory history to disk:", err)
    }
  }
}

loadHistoryFromDisk()

// In-Memory reservation mutex lock
let reservationLock = Promise.resolve()

export class InventoryService {
  /**
   * 1. Get Complete Inventory Matrix (Product -> Variant -> SKU -> Inventory Item)
   */
  static getInventoryMatrix(): InventoryItem[] {
    const products = productStore.getAllAdminProducts()
    const matrix: InventoryItem[] = []

    // Calculate currently reserved units per SKU & sweep expired
    const now = Date.now()
    const reservedCounts: Record<string, number> = {}
    for (const [cartId, reservations] of activeReservations.entries()) {
      const valid = reservations.filter((r) => r.expiresAt > now)
      if (valid.length === 0) {
        activeReservations.delete(cartId)
      } else {
        activeReservations.set(cartId, valid)
        for (const r of valid) {
          reservedCounts[r.sku] = (reservedCounts[r.sku] || 0) + r.quantity
        }
      }
    }

    for (const prod of products) {
      for (const variant of prod.variants || []) {
        const reserved = reservedCounts[variant.sku] || 0
        const stocked = variant.inventory ?? 0
        const available = Math.max(0, stocked - reserved)
        const lowThreshold = 5

        let status: InventoryItem["status"] = "In Stock"
        if (available === 0) {
          status = "Out of Stock"
        } else if (available <= lowThreshold) {
          status = "Low Stock"
        }

        matrix.push({
          id: `inv_${variant.id}`,
          sku: variant.sku,
          barcode: variant.barcode || `890${variant.id.replace(/\D/g, "").padStart(9, "0")}`,
          productId: prod.id,
          productTitle: prod.title,
          variantId: variant.id,
          variantTitle: variant.title,
          size: variant.size,
          color: variant.color,
          gsm: prod.gsm,
          location: "Tirupur Warehouse (WH-1)",
          stockedQuantity: stocked,
          reservedQuantity: reserved,
          availableQuantity: available,
          lowStockThreshold: lowThreshold,
          status,
          weightGrams: variant.weightGrams || 300,
          price: variant.price || prod.price,
          thumbnail: prod.thumbnail,
        })
      }
    }

    return matrix
  }

  /**
   * 2. Get Single Inventory Item by SKU or Variant ID
   */
  static getInventoryItem(skuOrVariantId: string): InventoryItem | undefined {
    const matrix = this.getInventoryMatrix()
    const clean = skuOrVariantId.toLowerCase().trim()
    return matrix.find(
      (item) =>
        item.sku.toLowerCase() === clean ||
        item.variantId.toLowerCase() === clean ||
        item.id.toLowerCase() === clean
    )
  }

  /**
   * Helper to resolve an inventory item by SKU, variant ID, or cart attributes
   */
  static findItemInMatrix(
    matrix: InventoryItem[],
    item: {
      sku?: string
      variantId?: string
      id?: string
      title?: string
      handle?: string
      size?: string
      color?: string
    }
  ): InventoryItem | undefined {
    const skuRef = (item.sku || "").trim().toLowerCase()
    const varRef = (item.variantId || item.id || "").trim().toLowerCase()
    const sizeRef = (item.size || "").trim().toLowerCase()
    const titleRef = (item.title || "").trim().toLowerCase()
    const handleRef = (item.handle || "").trim().toLowerCase()

    if (skuRef) {
      const bySku = matrix.find((i) => i.sku.toLowerCase() === skuRef)
      if (bySku) return bySku
    }

    if (varRef && !varRef.startsWith("item_")) {
      const byVar = matrix.find((i) => i.variantId.toLowerCase() === varRef || i.id.toLowerCase() === varRef)
      if (byVar) return byVar
    }

    // Match by title or handle + size
    if (sizeRef && (titleRef || handleRef)) {
      const byDetails = matrix.find((i) => {
        const matchesSize = i.size.toLowerCase() === sizeRef
        const matchesTitle = titleRef && (i.productTitle.toLowerCase().includes(titleRef) || titleRef.includes(i.productTitle.toLowerCase()))
        const matchesHandle = handleRef && (i.productId.toLowerCase().includes(handleRef) || handleRef.includes(i.productId.toLowerCase()))
        return matchesSize && (matchesTitle || matchesHandle)
      })
      if (byDetails) return byDetails
    }

    if (sizeRef) {
      const bySize = matrix.find((i) => i.size.toLowerCase() === sizeRef)
      if (bySize) return bySize
    }

    return matrix[0]
  }

  /**
   * 3. Reserve Stock Atomically (Prevents Overselling during Checkout)
   */
  static async reserveStock(params: {
    cartId: string
    items: {
      sku?: string
      variantId?: string
      id?: string
      title?: string
      handle?: string
      size?: string
      color?: string
      quantity: number
    }[]
    reservationTtlMs?: number
  }): Promise<{ success: boolean; reservations: StockReservation[] }> {
    // Acquire mutex lock to ensure atomic reservation across concurrent requests
    return new Promise((resolve, reject) => {
      reservationLock = reservationLock.then(async () => {
        try {
          const normalizedItems = normalizeInventoryRequestItems(params.items)
          const matrix = this.getInventoryMatrix()
          const ttl = params.reservationTtlMs || 15 * 60 * 1000 // 15 mins
          const expiresAt = Date.now() + ttl
          const newReservations: StockReservation[] = []

          // Step A: Pre-validation of available stock
          for (const item of normalizedItems) {
            const invItem = this.findItemInMatrix(matrix, item)

            if (!invItem) {
              throw new Error(`Inventory item for ${item.sku || item.title || "item"} not found in catalog`)
            }

            if (invItem.availableQuantity < item.quantity) {
              throw new Error(
                `Insufficient stock for ${invItem.productTitle} (${invItem.variantTitle}). Requested: ${item.quantity}, Available: ${invItem.availableQuantity}`
              )
            }
          }

          // Step B: Record reservations
          // Clear any previous reservations for this same cart to allow idempotent updates
          activeReservations.delete(params.cartId)

          for (const item of normalizedItems) {
            const invItem = this.findItemInMatrix(matrix, item)!

            const resObj: StockReservation = {
              id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              cartId: params.cartId,
              sku: invItem.sku,
              quantity: item.quantity,
              expiresAt,
              createdAt: new Date().toISOString(),
            }

            newReservations.push(resObj)
          }

          activeReservations.set(params.cartId, newReservations)
          resolve({ success: true, reservations: newReservations })
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  /**
   * 4. Release Stock Reservations (On Failed Payment / Abandonment)
   */
  static releaseStock(params: { cartId: string }): { releasedCount: number } {
    const reservations = activeReservations.get(params.cartId) || []
    activeReservations.delete(params.cartId)
    return { releasedCount: reservations.length }
  }

  /**
   * Get reservation KPIs for admin dashboards.
   * activeCheckoutSessions counts carts currently holding stock.
   * totalReservedUnits counts the actual reserved quantity across all SKUs.
   */
  static getReservationStats(): { activeCheckoutSessions: number; totalReservedUnits: number } {
    const matrix = this.getInventoryMatrix()
    return {
      activeCheckoutSessions: activeReservations.size,
      totalReservedUnits: matrix.reduce((acc, item) => acc + item.reservedQuantity, 0),
    }
  }

  /**
   * Clear all active reservations (Admin / Test utility)
   */
  static clearAllReservations(): { clearedCount: number } {
    const count = activeReservations.size
    activeReservations.clear()
    return { clearedCount: count }
  }

  /**
   * 5. Deduct Stock Permanently on Verified Order Placement / Payment Capture
   */
  static deductStock(params: {
    orderId: string
    cartId?: string
    items: { sku?: string; variantId?: string; title?: string; quantity: number }[]
  }): { success: boolean; updatedItems: { sku: string; newStocked: number }[] } {
    loadHistoryFromDisk()
    const updatedItems: { sku: string; newStocked: number }[] = []
    const nowReadable = new Date().toISOString().replace("T", " ").slice(0, 16)
    const normalizedItems = normalizeInventoryRequestItems(params.items)

    // Release any temporary hold
    if (params.cartId) {
      activeReservations.delete(params.cartId)
    }

    const products = productStore.getAllAdminProducts()

    for (const reqItem of normalizedItems) {
      const cleanRef = (reqItem.sku || reqItem.variantId || "").toLowerCase()
      let matchedVariant: any = null
      let matchedProduct: any = null

      for (const prod of products) {
        const v = (prod.variants || []).find(
          (varItem: any) =>
            varItem.sku.toLowerCase() === cleanRef ||
            varItem.id.toLowerCase() === cleanRef ||
            (reqItem.title && prod.title.toLowerCase().includes(reqItem.title.toLowerCase()))
        )
        if (v) {
          matchedVariant = v
          matchedProduct = prod
          break
        }
      }

      if (matchedVariant && matchedProduct) {
        const prevStock = matchedVariant.inventory ?? 0
        const newStock = Math.max(0, prevStock - reqItem.quantity)
        matchedVariant.inventory = newStock
        productStore.syncFromAdmin(matchedProduct)

        updatedItems.push({ sku: matchedVariant.sku, newStocked: newStock })

        // Log audit history entry
        memoryHistoryLogs.unshift({
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          sku: matchedVariant.sku,
          productTitle: matchedProduct.title,
          variantTitle: matchedVariant.title,
          delta: -reqItem.quantity,
          previousStocked: prevStock,
          newStocked: newStock,
          type: "PURCHASE_DEDUCTION",
          reason: `Order #${params.orderId} placed & payment captured`,
          location: "Tirupur Warehouse WH-1",
          user: "Payment Engine",
          timestamp: nowReadable,
        })
      }
    }

    saveHistoryToDisk()
    return { success: true, updatedItems }
  }

  /**
   * 6. Restore Stock on Order Cancellation
   */
  static restoreStock(params: {
    orderId: string
    items: { sku?: string; quantity: number }[]
    reason?: string
  }): { success: boolean } {
    loadHistoryFromDisk()
    const nowReadable = new Date().toISOString().replace("T", " ").slice(0, 16)
    const products = productStore.getAllAdminProducts()
    const normalizedItems = normalizeInventoryRequestItems(params.items)

    for (const item of normalizedItems) {
      const cleanSku = (item.sku || "").toLowerCase()
      for (const prod of products) {
        const v = (prod.variants || []).find((varItem: any) => varItem.sku.toLowerCase() === cleanSku)
        if (v) {
          const prev = v.inventory ?? 0
          const newStock = prev + item.quantity
          v.inventory = newStock
          productStore.syncFromAdmin(prod)

          memoryHistoryLogs.unshift({
            id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            sku: v.sku,
            productTitle: prod.title,
            variantTitle: v.title,
            delta: item.quantity,
            previousStocked: prev,
            newStocked: newStock,
            type: "CANCELLATION_RESTORE",
            reason: params.reason || `Order #${params.orderId} cancelled - stock restored`,
            location: "Tirupur Warehouse WH-1",
            user: "Order Service",
            timestamp: nowReadable,
          })
          break
        }
      }
    }

    saveHistoryToDisk()
    return { success: true }
  }

  /**
   * 7. Record Customer Return (Restocked vs Damaged Quarantine)
   */
  static recordReturn(params: {
    orderId: string
    items: { sku: string; quantity: number }[]
    condition: "restockable" | "damaged"
    reason: string
    user?: string
  }): { success: boolean; restocked: boolean } {
    loadHistoryFromDisk()
    const nowReadable = new Date().toISOString().replace("T", " ").slice(0, 16)
    const products = productStore.getAllAdminProducts()
    const isRestockable = params.condition === "restockable"
    const normalizedItems = normalizeInventoryRequestItems(params.items)

    for (const item of normalizedItems) {
      const cleanSku = item.sku.toLowerCase()
      for (const prod of products) {
        const v = (prod.variants || []).find((varItem: any) => varItem.sku.toLowerCase() === cleanSku)
        if (v) {
          const prev = v.inventory ?? 0
          const newStock = isRestockable ? prev + item.quantity : prev
          if (isRestockable) {
            v.inventory = newStock
            productStore.syncFromAdmin(prod)
          }

          memoryHistoryLogs.unshift({
            id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            sku: v.sku,
            productTitle: prod.title,
            variantTitle: v.title,
            delta: isRestockable ? item.quantity : 0,
            previousStocked: prev,
            newStocked: newStock,
            type: isRestockable ? "RETURN_RESTOCK" : "DAMAGED_QUARANTINE",
            reason: isRestockable
              ? `Return inspection passed (Order #${params.orderId}): ${params.reason}`
              : `Return damaged / defective (Order #${params.orderId}): Quarantined from sellable stock. ${params.reason}`,
            location: isRestockable ? "Tirupur Warehouse WH-1" : "Damage Quarantine Bay",
            user: params.user || "Returns QA Inspector",
            timestamp: nowReadable,
          })
          break
        }
      }
    }

    saveHistoryToDisk()
    return { success: true, restocked: isRestockable }
  }

  /**
   * 8. Manual Stock Adjustment & Cycle Count
   */
  static adjustStock(params: {
    sku: string
    delta: number
    type?: InventoryAdjustmentType
    reason: string
    location?: string
    user?: string
  }): { success: boolean; newStocked: number } {
    loadHistoryFromDisk()
    const nowReadable = new Date().toISOString().replace("T", " ").slice(0, 16)
    const products = productStore.getAllAdminProducts()
    const cleanSku = params.sku.toLowerCase()

    let newStocked = 0
    let found = false

    for (const prod of products) {
      const v = (prod.variants || []).find((varItem: any) => varItem.sku.toLowerCase() === cleanSku)
      if (v) {
        const prev = v.inventory ?? 0
        newStocked = Math.max(0, prev + params.delta)
        v.inventory = newStocked
        productStore.syncFromAdmin(prod)
        found = true

        memoryHistoryLogs.unshift({
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          sku: v.sku,
          productTitle: prod.title,
          variantTitle: v.title,
          delta: params.delta,
          previousStocked: prev,
          newStocked,
          type: params.type || (params.delta > 0 ? "RESTOCK" : "MANUAL_ADJUSTMENT"),
          reason: params.reason || "Manual warehouse inventory reconciliation",
          location: params.location || "Tirupur Warehouse WH-1",
          user: params.user || "Warehouse Manager",
          timestamp: nowReadable,
        })
        break
      }
    }

    if (!found) {
      throw new Error(`SKU ${params.sku} not found in inventory matrix`)
    }

    saveHistoryToDisk()
    return { success: true, newStocked }
  }

  /**
   * 9. Get Grouped Inventory by Parent Product
   */
  static getInventoryByProduct(): {
    productId: string
    title: string
    handle: string
    category: string
    thumbnail: string
    totalStocked: number
    totalReserved: number
    totalAvailable: number
    variantCount: number
    status: "Healthy" | "Low Stock" | "Out of Stock"
  }[] {
    const matrix = this.getInventoryMatrix()
    const groups: Record<string, any> = {}

    for (const item of matrix) {
      if (!groups[item.productId]) {
        groups[item.productId] = {
          productId: item.productId,
          title: item.productTitle,
          handle: item.productId,
          category: "Fashion & Streetwear",
          thumbnail: item.thumbnail || "",
          totalStocked: 0,
          totalReserved: 0,
          totalAvailable: 0,
          variantCount: 0,
          hasLowStock: false,
          hasOutOfStock: false,
        }
      }

      groups[item.productId].totalStocked += item.stockedQuantity
      groups[item.productId].totalReserved += item.reservedQuantity
      groups[item.productId].totalAvailable += item.availableQuantity
      groups[item.productId].variantCount += 1

      if (item.status === "Low Stock") groups[item.productId].hasLowStock = true
      if (item.status === "Out of Stock") groups[item.productId].hasOutOfStock = true
    }

    return Object.values(groups).map((g) => ({
      productId: g.productId,
      title: g.title,
      handle: g.handle,
      category: g.category,
      thumbnail: g.thumbnail,
      totalStocked: g.totalStocked,
      totalReserved: g.totalReserved,
      totalAvailable: g.totalAvailable,
      variantCount: g.variantCount,
      status: g.totalAvailable === 0 ? "Out of Stock" : g.hasLowStock ? "Low Stock" : "Healthy",
    }))
  }

  /**
   * 10. Get Low Stock Items
   */
  static getLowStockItems(): InventoryItem[] {
    return this.getInventoryMatrix().filter((item) => item.status === "Low Stock")
  }

  /**
   * 11. Get Out of Stock Items
   */
  static getOutOfStockItems(): InventoryItem[] {
    return this.getInventoryMatrix().filter((item) => item.status === "Out of Stock")
  }

  /**
   * 12. Get Inventory History Audit Trail
   */
  static getInventoryHistory(): InventoryHistoryEntry[] {
    loadHistoryFromDisk()
    return [...memoryHistoryLogs]
  }
}
