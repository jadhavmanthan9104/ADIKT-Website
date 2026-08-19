import { NextRequest, NextResponse } from "next/server"
import { OrdersDB } from "@/lib/orders-db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const query = searchParams.get("q")?.toLowerCase()

    let orders = OrdersDB.getAll()

    if (status && status !== "all") {
      orders = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase())
    }

    if (query) {
      orders = orders.filter(
        (o) =>
          o.displayId.toLowerCase().includes(query) ||
          o.customer.name.toLowerCase().includes(query) ||
          o.customer.email.toLowerCase().includes(query) ||
          (o.awb && o.awb.toLowerCase().includes(query))
      )
    }

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    })
  } catch (error: any) {
    console.error("[Admin Orders GET Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || !body.displayId) {
      return NextResponse.json(
        { error: "Valid order object is required" },
        { status: 400 }
      )
    }

    const created = OrdersDB.save(body)
    return NextResponse.json({
      success: true,
      order: created,
    })
  } catch (error: any) {
    console.error("[Admin Orders POST Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save order" },
      { status: 500 }
    )
  }
}
