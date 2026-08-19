import { NextRequest, NextResponse } from "next/server"
import { SeoStore, SeoGlobalConfig, SeoRouteOverride } from "@/lib/seo-store"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const config = SeoStore.getConfig()
    return NextResponse.json({
      success: true,
      global: config.global,
      overrides: Object.values(config.overrides),
    })
  } catch (error: any) {
    console.error("[Admin SEO GET Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch SEO configuration" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { global, override } = body

    if (global) {
      const updatedGlobal = SeoStore.updateGlobal(global)
      return NextResponse.json({
        success: true,
        global: updatedGlobal,
        message: "Global SEO defaults updated successfully.",
      })
    }

    if (override) {
      if (!override.route) {
        return NextResponse.json({ error: "Route path is required for SEO override" }, { status: 400 })
      }
      const savedOverride = SeoStore.setOverride(override)
      return NextResponse.json({
        success: true,
        override: savedOverride,
        message: `SEO override for ${savedOverride.route} saved successfully.`,
      })
    }

    return NextResponse.json({ error: "Invalid payload: 'global' or 'override' object expected." }, { status: 400 })
  } catch (error: any) {
    console.error("[Admin SEO POST Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to update SEO configuration" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const route = searchParams.get("route")

    if (!route) {
      return NextResponse.json({ error: "Route query parameter is required" }, { status: 400 })
    }

    const success = SeoStore.deleteOverride(route)
    if (!success) {
      return NextResponse.json({ error: `No override found for route: ${route}` }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `SEO override for ${route} deleted.`,
    })
  } catch (error: any) {
    console.error("[Admin SEO DELETE Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to delete SEO override" }, { status: 500 })
  }
}
