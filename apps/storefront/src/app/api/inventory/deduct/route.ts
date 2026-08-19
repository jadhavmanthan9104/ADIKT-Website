import { NextRequest, NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory/inventory-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, cartId, items } = body

    if (!orderId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Order ID and valid items array are required" },
        { status: 400 }
      )
    }

    const result = InventoryService.deductStock({
      orderId,
      cartId,
      items,
    })

    return NextResponse.json({
      success: true,
      message: `Stock successfully deducted for Order #${orderId}`,
      updatedItems: result.updatedItems,
    })
  } catch (error: any) {
    console.error("[Inventory Deduction Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to deduct inventory stock" },
      { status: 500 }
    )
  }
}
