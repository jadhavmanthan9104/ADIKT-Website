import { NextRequest, NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory/inventory-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const history = InventoryService.getInventoryHistory()
    return NextResponse.json({
      success: true,
      history,
      total: history.length,
    })
  } catch (error: any) {
    console.error("[Inventory History API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch inventory history" },
      { status: 500 }
    )
  }
}
