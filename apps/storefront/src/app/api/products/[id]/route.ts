import { NextRequest, NextResponse } from "next/server"
import { productStore } from "@/lib/product-store"
import { loadCatalogFromDisk, saveCatalogToDisk } from "@/lib/server-storage"

let hasHydrated = false
function ensureHydrated() {
  if (hasHydrated) return
  const persisted = loadCatalogFromDisk()
  if (persisted && persisted.adminProducts?.length > 0) {
    productStore.initFromPersisted(persisted.adminProducts, persisted.storeProducts)
  }
  hasHydrated = true
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  ensureHydrated()
  const { id } = await params

  const product = productStore.getAdminProductById(id)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({ product })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureHydrated()
    const { id } = await params
    const body = await request.json()

    const updated = productStore.updateFromAdmin(id, body)
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    saveCatalogToDisk(productStore.getAllAdminProducts(), productStore.getAllStoreProducts())

    return NextResponse.json({ success: true, product: updated })
  } catch (error) {
    console.error("[API] Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  ensureHydrated()
  const { id } = await params

  const deleted = productStore.deleteFromAdmin(id)
  if (!deleted) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  saveCatalogToDisk(productStore.getAllAdminProducts(), productStore.getAllStoreProducts())

  return NextResponse.json({ success: true })
}
