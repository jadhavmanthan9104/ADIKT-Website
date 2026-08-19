import { AnalyticsEvent, AnalyticsEventType } from "./analytics-types"

export interface StoredAnalyticsEvent {
  id: string
  event: AnalyticsEventType
  payload: any
  timestamp: string
  sessionId?: string
  userId?: string
  ip?: string
  userAgent?: string
}

function getFsAndPath() {
  if (typeof window === "undefined") {
    try {
      const req = eval("require")
      return { fs: req("fs"), path: req("path") }
    } catch {}
  }
  return { fs: null, path: null }
}

function getAnalyticsFilePath(): string | null {
  const { fs, path } = getFsAndPath()
  if (!fs || !path) return null

  const possiblePaths = [
    path.join(process.cwd(), "apps", "storefront", "data", "analytics-events.json"),
    path.join(process.cwd(), "data", "analytics-events.json"),
    path.join(process.cwd(), "..", "data", "analytics-events.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(process.cwd(), "apps", "storefront", "data", "analytics-events.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

// Generate realistic initial 30-day historical seed events
function generateSeedEvents(): StoredAnalyticsEvent[] {
  const seed: StoredAnalyticsEvent[] = []
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  for (let i = 29; i >= 0; i--) {
    const dayDate = new Date(now - i * dayMs).toISOString()
    const visits = 800 + Math.floor(Math.random() * 400) // 800 - 1200 visits/day
    const prodViews = Math.floor(visits * 0.65)
    const cartAdds = Math.floor(prodViews * 0.18)
    const checkouts = Math.floor(cartAdds * 0.45)
    const purchases = Math.floor(checkouts * 0.72)

    seed.push({
      id: `seed_pv_${i}`,
      event: "page_view",
      payload: { page_title: "Home | ADIKT", count: visits },
      timestamp: dayDate,
    })
    seed.push({
      id: `seed_view_${i}`,
      event: "product_view",
      payload: { product_id: "prod_01JADIKT01", count: prodViews },
      timestamp: dayDate,
    })
    seed.push({
      id: `seed_cart_${i}`,
      event: "add_to_cart",
      payload: { count: cartAdds },
      timestamp: dayDate,
    })
    seed.push({
      id: `seed_chk_${i}`,
      event: "begin_checkout",
      payload: { count: checkouts },
      timestamp: dayDate,
    })
    seed.push({
      id: `seed_pur_${i}`,
      event: "purchase",
      payload: { count: purchases, value: purchases * 2850 },
      timestamp: dayDate,
    })
  }

  return seed
}

export class AnalyticsDB {
  private static memoryEvents: StoredAnalyticsEvent[] | null = null

  static getAll(): StoredAnalyticsEvent[] {
    try {
      const { fs } = getFsAndPath()
      const filePath = getAnalyticsFilePath()
      if (fs && filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryEvents = parsed
        }
      }
      if (!this.memoryEvents && fs && filePath) {
        const seed = generateSeedEvents()
        fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), "utf-8")
        this.memoryEvents = seed
      }
    } catch (err) {
      console.warn("Error reading analytics events DB:", err)
    }

    if (!this.memoryEvents) {
      this.memoryEvents = generateSeedEvents()
    }

    return [...this.memoryEvents]
  }

  static recordEvent(event: Partial<StoredAnalyticsEvent>): StoredAnalyticsEvent {
    const list = this.getAll()
    const record: StoredAnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event: event.event || "page_view",
      payload: event.payload || {},
      timestamp: event.timestamp || new Date().toISOString(),
      sessionId: event.sessionId,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
    }

    list.unshift(record)
    // Cap memory list at 50,000 recent events
    if (list.length > 50000) list.pop()

    this.memoryEvents = list

    try {
      const { fs } = getFsAndPath()
      const filePath = getAnalyticsFilePath()
      if (fs && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error saving analytics event to disk:", err)
    }

    return record
  }

  static getEventsByTimeframe(startDate: Date, endDate: Date): StoredAnalyticsEvent[] {
    const all = this.getAll()
    const startMs = startDate.getTime()
    const endMs = endDate.getTime()

    return all.filter((e) => {
      const t = new Date(e.timestamp).getTime()
      return t >= startMs && t <= endMs
    })
  }
}
