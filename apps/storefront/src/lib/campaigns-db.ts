import fs from "fs"
import path from "path"
import { SegmentsService } from "./segments-service"

export interface MarketingCampaign {
  id: string
  name: string
  channel: "SMS & WhatsApp" | "Email Broadcast" | "Push Notification"
  targetSegment: string
  targetSegmentName: string
  discountCode?: string
  message: string
  recipientsCount: number
  openRate: string
  clickRate: string
  attributedOrders: number
  attributedRevenue: number
  sentAt: string
  status: "Sent" | "Scheduled" | "Draft"
  createdAt: string
}

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: "camp_1",
    name: "Drop 04 Early Access VIP Announcement",
    channel: "SMS & WhatsApp",
    targetSegment: "high-value",
    targetSegmentName: "High-Value VIPs",
    discountCode: "HIGHVALUE500",
    message: "Hey {first_name}, VIP early access to Drop 04 is now live. Use code HIGHVALUE500 for flat ₹500 off.",
    recipientsCount: 2450,
    openRate: "94.2%",
    clickRate: "38.5%",
    attributedOrders: 64,
    attributedRevenue: 148200,
    sentAt: "2026-08-15T10:00:00Z",
    status: "Sent",
    createdAt: "2026-08-15T09:30:00Z",
  },
  {
    id: "camp_2",
    name: "400 GSM French Terry Restock Alert",
    channel: "Email Broadcast",
    targetSegment: "returning",
    targetSegmentName: "Returning Customers",
    discountCode: "ADIKT20",
    message: "Back in stock: 400 GSM heavyweight hoodies in Washed Charcoal & Oatmeal. Take 20% off with ADIKT20.",
    recipientsCount: 3820,
    openRate: "48.6%",
    clickRate: "22.1%",
    attributedOrders: 41,
    attributedRevenue: 92500,
    sentAt: "2026-08-10T14:00:00Z",
    status: "Sent",
    createdAt: "2026-08-10T13:00:00Z",
  },
  {
    id: "camp_3",
    name: "Weekend Free Shipping Push",
    channel: "SMS & WhatsApp",
    targetSegment: "no-purchase",
    targetSegmentName: "Customers with No Purchase",
    discountCode: "FREESHIP",
    message: "Unlock free express pan-India delivery on your first drop order this weekend. Code: FREESHIP",
    recipientsCount: 4100,
    openRate: "91.8%",
    clickRate: "29.4%",
    attributedOrders: 32,
    attributedRevenue: 64800,
    sentAt: "2026-08-02T16:00:00Z",
    status: "Sent",
    createdAt: "2026-08-02T15:00:00Z",
  },
]

function getCampaignsFilePath(): string {
  const possiblePaths = [
    path.join(process.cwd(), "apps", "storefront", "data", "campaigns.json"),
    path.join(process.cwd(), "data", "campaigns.json"),
    path.join(process.cwd(), "..", "data", "campaigns.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(process.cwd(), "apps", "storefront", "data", "campaigns.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

export class CampaignsDB {
  private static memoryCampaigns: MarketingCampaign[] | null = null

  static getAll(): MarketingCampaign[] {
    try {
      const filePath = getCampaignsFilePath()
      if (filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryCampaigns = parsed
        }
      }
      if (!this.memoryCampaigns && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(INITIAL_CAMPAIGNS, null, 2), "utf-8")
        this.memoryCampaigns = [...INITIAL_CAMPAIGNS]
      }
    } catch (err) {
      console.warn("Error reading campaigns database:", err)
    }

    if (!this.memoryCampaigns) {
      this.memoryCampaigns = [...INITIAL_CAMPAIGNS]
    }

    return [...this.memoryCampaigns]
  }

  static createCampaign(campaignData: {
    name: string
    channel: MarketingCampaign["channel"]
    targetSegment: string
    discountCode?: string
    message: string
  }): MarketingCampaign {
    const campaigns = this.getAll()
    const segment = SegmentsService.getSegmentBySlug(campaignData.targetSegment)
    const consentedMembers = segment ? segment.members.filter((m) => m.marketingConsent) : []
    const recipientsCount = Math.max(1, consentedMembers.length || 1200)

    const newCampaign: MarketingCampaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: campaignData.name,
      channel: campaignData.channel,
      targetSegment: campaignData.targetSegment,
      targetSegmentName: segment?.name || "Target Segment",
      discountCode: campaignData.discountCode,
      message: campaignData.message,
      recipientsCount,
      openRate: campaignData.channel === "SMS & WhatsApp" ? "92.4%" : "44.8%",
      clickRate: campaignData.channel === "SMS & WhatsApp" ? "31.2%" : "18.5%",
      attributedOrders: 0,
      attributedRevenue: 0,
      sentAt: new Date().toISOString(),
      status: "Sent",
      createdAt: new Date().toISOString(),
    }

    campaigns.unshift(newCampaign)
    this.memoryCampaigns = campaigns

    try {
      const filePath = getCampaignsFilePath()
      if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(campaigns, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error saving campaign to disk:", err)
    }

    return newCampaign
  }
}
