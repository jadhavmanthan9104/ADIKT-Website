import { NextRequest, NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory/inventory-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sku, delta, type, reason, location, user, action } = body

    if (!sku) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 })
    }

    let numericDelta = Number(delta)
    if (isNaN(numericDelta)) {
      return NextResponse.json({ error: "Delta must be a valid number" }, { status: 400 })
    }

    if (action === "damaged" && numericDelta > 0) {
      numericDelta = -numericDelta
    } else if (action === "remove" && numericDelta > 0) {
      numericDelta = -numericDelta
    }

    const result = InventoryService.adjustStock({
      sku,
      delta: numericDelta,
      type,
      reason: reason || "Manual warehouse inventory reconciliation",
      location: location || "Tirupur Warehouse (WH-1)",
      user: user || "Warehouse Administrator",
    })

    return NextResponse.json({
      success: true,
      message: `Stock for ${sku} updated. New Stocked Quantity: ${result.newStocked}`,
      newStocked: result.newStocked,
    })
  } catch (error: any) {
    console.error("[Inventory Adjustment Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to adjust inventory" },
      { status: 500 }
    )
  }
}
