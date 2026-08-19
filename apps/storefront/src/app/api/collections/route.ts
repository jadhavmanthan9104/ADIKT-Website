import { NextRequest, NextResponse } from "next/server"
import {
  loadCollectionsFromDisk,
  saveCollectionsToDisk,
  PersistedCollectionItem,
} from "@/lib/server-storage"

const DEFAULT_COLLECTIONS: PersistedCollectionItem[] = [
  {
    id: "col_1",
    title: "Core Heavyweight",
    handle: "core-heavyweight",
    description: "Foundational 280–400 GSM luxury basics designed for perpetual replenishment.",
    launchDate: "Aug 2026",
    status: "Active",
    scheduledAt: null,
  },
  {
    id: "col_2",
    title: "French Terry Fleece",
    handle: "french-terry-fleece",
    description: "400 GSM custom loopback knit hoodies and high-density sweats.",
    launchDate: "Aug 2026",
    status: "Active",
    scheduledAt: null,
  },
  {
    id: "col_3",
    title: "Parachute Cargos",
    handle: "parachute-cargos",
    description: "Modular tactical utility bottoms cut in high-tensile ripstop.",
    launchDate: "Aug 2026",
    status: "Active",
    scheduledAt: null,
  },
  {
    id: "col_4",
    title: "Drop 04 Autumn",
    handle: "drop-04-autumn",
    description: "Limited seasonal capsule showcasing our heaviest knit structures to date.",
    launchDate: "Sep 2026",
    status: "Active",
    scheduledAt: null,
  },
]

export async function GET() {
  try {
    let collections = loadCollectionsFromDisk()
    if (!collections || collections.length === 0) {
      collections = DEFAULT_COLLECTIONS
      saveCollectionsToDisk(collections)
    }

    const now = Date.now()
    // Auto-activate scheduled collections whose release date has arrived
    let hasChanged = false
    const updatedCollections = collections.map((col) => {
      if (col.status === "Scheduled" && col.scheduledAt) {
        if (new Date(col.scheduledAt).getTime() <= now) {
          hasChanged = true
          return { ...col, status: "Active" as const }
        }
      }
      return col
    })

    if (hasChanged) {
      saveCollectionsToDisk(updatedCollections)
      collections = updatedCollections
    }

    return NextResponse.json({ collections, count: collections.length })
  } catch (err) {
    console.error("[API] Error loading collections:", err)
    return NextResponse.json({ error: "Failed to load collections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // If body has an entire collections array
    if (Array.isArray(body.collections)) {
      saveCollectionsToDisk(body.collections)
      return NextResponse.json({ success: true, collections: body.collections })
    }

    // Otherwise single collection upsert
    let collections = loadCollectionsFromDisk() || [...DEFAULT_COLLECTIONS]
    const collectionId = body.id || `col_${Date.now()}`
    const existingIdx = collections.findIndex((c) => c.id === collectionId)

    const collectionItem: PersistedCollectionItem = {
      id: collectionId,
      title: body.title || "New Collection",
      handle: body.handle || body.title?.toLowerCase().replace(/\s+/g, "-") || "new-collection",
      description: body.description || "",
      launchDate: body.launchDate || "Aug 2026",
      status: body.status || "Active",
      scheduledAt: body.scheduledAt || null,
    }

    if (existingIdx !== -1) {
      collections[existingIdx] = collectionItem
    } else {
      collections.unshift(collectionItem)
    }

    saveCollectionsToDisk(collections)
    return NextResponse.json({ success: true, collection: collectionItem, collections })
  } catch (err) {
    console.error("[API] Error saving collections:", err)
    return NextResponse.json({ error: "Failed to save collection" }, { status: 500 })
  }
}
