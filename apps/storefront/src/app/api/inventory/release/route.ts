import { NextRequest, NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory/inventory-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cartId } = body

    if (!cartId) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 })
    }

    if (cartId === "ALL") {
      const result = InventoryService.clearAllReservations()
      return NextResponse.json({
        success: true,
        message: `Cleared ${result.clearedCount} active reservation carts`,
      })
    }

    const result = InventoryService.releaseStock({ cartId })

    return NextResponse.json({
      success: true,
      message: `Released ${result.releasedCount} stock reservation(s)`,
    })
  } catch (error: any) {
    console.error("[Inventory Release Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to release stock" },
      { status: 500 }
    )
  }
}
