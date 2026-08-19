import { NextRequest, NextResponse } from "next/server"
import { contentStore } from "@/lib/content-store"
import { loadContentFromDisk, saveContentToDisk } from "@/lib/server-storage"

let hasHydrated = false
function ensureHydrated() {
  if (hasHydrated) return
  const persisted = loadContentFromDisk()
  if (persisted && persisted.content) {
    contentStore.initFromPersisted(persisted.content)
  }
  hasHydrated = true
}

export async function GET() {
  try {
    ensureHydrated()
    const content = contentStore.getContent()
    return NextResponse.json({ content })
  } catch (error) {
    console.error("[API] Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    ensureHydrated()
    const body = await request.json()

    const updated = contentStore.updateContent(body)
    saveContentToDisk(updated)

    return NextResponse.json({ success: true, content: updated })
  } catch (error) {
    console.error("[API] Error updating content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return PUT(request)
}
