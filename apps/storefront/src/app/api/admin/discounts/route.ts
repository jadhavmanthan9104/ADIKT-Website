import { NextRequest, NextResponse } from "next/server"
import { DiscountsDB } from "@/lib/discounts-db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const discounts = DiscountsDB.getAll()
    return NextResponse.json({
      success: true,
      discounts,
      total: discounts.length,
    })
  } catch (error: any) {
    console.error("[Admin Discounts GET Error]:", error)
    return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      applicableTo,
      restrictedProductIds,
      restrictedCollections,
      restrictedCategories,
      startsAt,
      endsAt,
      usageLimit,
      customerUsageLimit,
      status,
      description,
    } = body

    if (!code || !type) {
      return NextResponse.json(
        { error: "Code and discount type are required." },
        { status: 400 }
      )
    }

    const existing = DiscountsDB.getByCode(code)
    if (existing) {
      return NextResponse.json(
        { error: `Coupon code '${code.toUpperCase()}' already exists.` },
        { status: 409 }
      )
    }

    const created = DiscountsDB.createDiscount({
      code,
      type,
      value: Number(value) || 0,
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      applicableTo: applicableTo || "all",
      restrictedProductIds: Array.isArray(restrictedProductIds) ? restrictedProductIds : [],
      restrictedCollections: Array.isArray(restrictedCollections) ? restrictedCollections : [],
      restrictedCategories: Array.isArray(restrictedCategories) ? restrictedCategories : [],
      startsAt: startsAt || new Date().toISOString(),
      endsAt: endsAt || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      customerUsageLimit: customerUsageLimit ? Number(customerUsageLimit) : 1,
      status: status || "Active",
      description: description || "",
    })

    return NextResponse.json({
      success: true,
      discount: created,
      message: "Discount coupon created successfully.",
    }, { status: 201 })
  } catch (error: any) {
    console.error("[Admin Discounts POST Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to create discount" }, { status: 500 })
  }
}
