import { NextRequest, NextResponse } from "next/server"
import { CampaignsDB } from "@/lib/campaigns-db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const campaigns = CampaignsDB.getAll()
    const totalAttributedRevenue = campaigns.reduce((acc, c) => acc + (c.attributedRevenue || 0), 0)
    const totalAttributedOrders = campaigns.reduce((acc, c) => acc + (c.attributedOrders || 0), 0)

    return NextResponse.json({
      success: true,
      campaigns,
      summary: {
        totalCampaigns: campaigns.length,
        totalAttributedRevenue,
        totalAttributedOrders,
      },
    })
  } catch (error: any) {
    console.error("[Campaigns GET Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, channel, targetSegment, discountCode, message } = body

    if (!name || !channel || !targetSegment || !message) {
      return NextResponse.json(
        { error: "Name, channel, target segment, and broadcast message are required." },
        { status: 400 }
      )
    }

    const campaign = CampaignsDB.createCampaign({
      name: name.trim(),
      channel,
      targetSegment,
      discountCode: discountCode?.trim() || undefined,
      message: message.trim(),
    })

    return NextResponse.json({
      success: true,
      campaign,
      message: "Campaign dispatched successfully.",
    }, { status: 201 })
  } catch (error: any) {
    console.error("[Campaigns POST Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 })
  }
}
