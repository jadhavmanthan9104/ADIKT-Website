import { NextRequest, NextResponse } from "next/server"
import { DiscountsDB } from "@/lib/discounts-db"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const updated = DiscountsDB.updateDiscount(id, body)
    if (!updated) {
      return NextResponse.json({ error: "Discount rule not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      discount: updated,
      message: "Discount rule updated successfully.",
    })
  } catch (error: any) {
    console.error("[Admin Discount Update Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to update discount" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = DiscountsDB.deleteDiscount(id)
    if (!deleted) {
      return NextResponse.json({ error: "Discount rule not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Discount coupon deleted successfully.",
    })
  } catch (error: any) {
    console.error("[Admin Discount Delete Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to delete discount" }, { status: 500 })
  }
}
