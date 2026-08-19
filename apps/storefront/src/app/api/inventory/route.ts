import { NextRequest, NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory/inventory-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const matrix = InventoryService.getInventoryMatrix()
    const byProduct = InventoryService.getInventoryByProduct()
    const lowStock = InventoryService.getLowStockItems()
    const outOfStock = InventoryService.getOutOfStockItems()
    const history = InventoryService.getInventoryHistory()
    const reservationStats = InventoryService.getReservationStats()

    const totalStocked = matrix.reduce((acc, i) => acc + i.stockedQuantity, 0)
    const totalReserved = reservationStats.totalReservedUnits
    const totalAvailable = matrix.reduce((acc, i) => acc + i.availableQuantity, 0)

    return NextResponse.json({
      success: true,
      matrix,
      byProduct,
      lowStock,
      outOfStock,
      history,
      kpis: {
        totalStocked,
        totalReserved,
        activeCheckoutSessions: reservationStats.activeCheckoutSessions,
        totalAvailable,
        totalSkus: matrix.length,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        locations: ["Tirupur Warehouse (WH-1)", "Mumbai Metro Hub (WH-2)"],
      },
    })
  } catch (error: any) {
    console.error("[Inventory API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch inventory data" },
      { status: 500 }
    )
  }
}
