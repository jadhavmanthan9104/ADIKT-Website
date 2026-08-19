import fs from "fs"
import path from "path"
import { AdminProduct } from "./admin-api"
import { AdminContentItem } from "./content-store"
import { StoreProduct } from "./store-api"

/**
 * Server-Side Persistent Storage
 *
 * This module is ONLY imported in server-side API routes (Node.js runtime).
 * It reads and writes catalog and CMS content data to data/products.json and
 * data/content.json so that changes made in the admin dashboard persist across
 * dev server restarts.
 */

function getProductsFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "products.json"),
    path.join(process.cwd(), "data", "products.json"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[0]
}

function getContentFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "content.json"),
    path.join(process.cwd(), "data", "content.json"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[0]
}

export interface PersistedCatalog {
  adminProducts: AdminProduct[]
  storeProducts: StoreProduct[]
  lastUpdated: string
}

export interface PersistedContent {
  content: AdminContentItem
  lastUpdated: string
}

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// ==================== Products Catalog ====================

export function loadCatalogFromDisk(): PersistedCatalog | null {
  try {
    const filePath = getProductsFilePath()
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(raw) as PersistedCatalog
    }
  } catch (err) {
    console.error("[ServerStorage] Error reading persisted catalog:", err)
  }
  return null
}

export function saveCatalogToDisk(adminProducts: AdminProduct[], storeProducts: StoreProduct[]) {
  try {
    const data: PersistedCatalog = {
      adminProducts,
      storeProducts,
      lastUpdated: new Date().toISOString(),
    }
    const jsonStr = JSON.stringify(data, null, 2)

    // Save to all possible candidate locations
    const targets = [
      path.join(process.cwd(), "apps", "storefront", "data", "products.json"),
      path.join(process.cwd(), "data", "products.json"),
    ]
    for (const target of targets) {
      try {
        ensureDirectoryExists(target)
        fs.writeFileSync(target, jsonStr, "utf-8")
      } catch {}
    }
  } catch (err) {
    console.error("[ServerStorage] Error saving catalog to disk:", err)
  }
}

// ==================== CMS & Content ====================

export function loadContentFromDisk(): PersistedContent | null {
  try {
    const filePath = getContentFilePath()
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(raw) as PersistedContent
    }
  } catch (err) {
    console.error("[ServerStorage] Error reading persisted content:", err)
  }
  return null
}

export function saveContentToDisk(content: AdminContentItem) {
  try {
    const data: PersistedContent = {
      content,
      lastUpdated: new Date().toISOString(),
    }
    const jsonStr = JSON.stringify(data, null, 2)

    const targets = [
      path.join(process.cwd(), "apps", "storefront", "data", "content.json"),
      path.join(process.cwd(), "data", "content.json"),
    ]
    for (const target of targets) {
      try {
        ensureDirectoryExists(target)
        fs.writeFileSync(target, jsonStr, "utf-8")
      } catch {}
    }
  } catch (err) {
    console.error("[ServerStorage] Error saving content to disk:", err)
  }
}

// ==================== Collections ====================

function getCollectionsFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "collections.json"),
    path.join(process.cwd(), "data", "collections.json"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[0]
}

export interface PersistedCollectionItem {
  id: string
  title: string
  handle: string
  description: string
  launchDate: string
  status: "Active" | "Scheduled" | "Draft" | "Archived"
  scheduledAt?: string | null
}

export function loadCollectionsFromDisk(): PersistedCollectionItem[] | null {
  try {
    const filePath = getCollectionsFilePath()
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8")
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.collections)) {
        return parsed.collections
      }
    }
  } catch (err) {
    console.error("[ServerStorage] Error reading persisted collections:", err)
  }
  return null
}

export function saveCollectionsToDisk(collections: PersistedCollectionItem[]) {
  try {
    const data = {
      collections,
      lastUpdated: new Date().toISOString(),
    }
    const jsonStr = JSON.stringify(data, null, 2)
    const targets = [
      path.join(process.cwd(), "apps", "storefront", "data", "collections.json"),
      path.join(process.cwd(), "data", "collections.json"),
    ]
    for (const target of targets) {
      try {
        ensureDirectoryExists(target)
        fs.writeFileSync(target, jsonStr, "utf-8")
      } catch {}
    }
  } catch (err) {
    console.error("[ServerStorage] Error saving collections to disk:", err)
  }
}

