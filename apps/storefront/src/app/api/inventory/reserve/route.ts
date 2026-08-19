import { NextRequest, NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory/inventory-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cartId, items, reservationTtlMs } = body

    if (!cartId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart ID and a non-empty items array are required for stock reservation" },
        { status: 400 }
      )
    }

    const result = await InventoryService.reserveStock({
      cartId,
      items,
      reservationTtlMs,
    })

    return NextResponse.json({
      success: true,
      message: "Stock successfully reserved for checkout session",
      reservations: result.reservations,
    })
  } catch (error: any) {
    console.error("[Inventory Reservation Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to reserve stock" },
      { status: 409 } // 409 Conflict when stock is insufficient
    )
  }
}
