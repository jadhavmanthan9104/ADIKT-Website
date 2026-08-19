import {
  NotificationEventType,
  NotificationPayloadData,
  TemplateRegistry,
} from "./templates/template-registry"
import { getNotificationProvider } from "./providers/provider-factory"

export interface NotificationRecord {
  id: string
  type: NotificationEventType
  recipientEmail: string
  recipientName: string
  subject: string
  htmlBody: string
  textBody: string
  status: "Sent" | "Failed" | "Pending" | "Retrying"
  provider: string
  messageId?: string
  error?: string
  attempts: number
  sentAt: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "notif_seed_1",
    type: "order_confirmation",
    recipientEmail: "aditya.sharma@example.com",
    recipientName: "Aditya Sharma",
    subject: "Order Confirmed: ADKT-10492 | ADIKT",
    htmlBody: "<p>Order ADKT-10492 confirmed.</p>",
    textBody: "Order ADKT-10492 confirmed.",
    status: "Sent",
    provider: "mock",
    messageId: "mock_msg_initial_1",
    attempts: 1,
    sentAt: "2026-08-16T18:30:00Z",
    createdAt: "2026-08-16T18:30:00Z",
    updatedAt: "2026-08-16T18:30:00Z",
    metadata: { orderId: "ADKT-10492", total: 3998 },
  },
  {
    id: "notif_seed_2",
    type: "account_created",
    recipientEmail: "aditya.sharma@example.com",
    recipientName: "Aditya Sharma",
    subject: "Welcome to ADIKT, Aditya | Your Member Access is Active",
    htmlBody: "<p>Welcome to the Syndicate.</p>",
    textBody: "Welcome to ADIKT.",
    status: "Sent",
    provider: "mock",
    messageId: "mock_msg_initial_2",
    attempts: 1,
    sentAt: "2026-08-16T18:00:00Z",
    createdAt: "2026-08-16T18:00:00Z",
    updatedAt: "2026-08-16T18:00:00Z",
    metadata: { discountCode: "WELCOME10" },
  },
]

function getFsAndPath() {
  if (typeof window === "undefined") {
    try {
      const req = eval("require")
      return { fs: req("fs"), path: req("path") }
    } catch {}
  }
  return { fs: null, path: null }
}

function getNotificationsFilePath(): string | null {
  const { fs, path } = getFsAndPath()
  if (!fs || !path) return null

  const possiblePaths = [
    path.join(process.cwd(), "apps", "storefront", "data", "notifications.json"),
    path.join(process.cwd(), "data", "notifications.json"),
    path.join(process.cwd(), "..", "data", "notifications.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  const defaultPath = path.join(process.cwd(), "apps", "storefront", "data", "notifications.json")
  try {
    const dir = path.dirname(defaultPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
  return defaultPath
}

export class NotificationService {
  private static memoryNotifications: NotificationRecord[] | null = null

  static getAll(): NotificationRecord[] {
    try {
      const { fs } = getFsAndPath()
      const filePath = getNotificationsFilePath()
      if (fs && filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryNotifications = parsed
        }
      }
      if (!this.memoryNotifications && fs && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(INITIAL_NOTIFICATIONS, null, 2), "utf-8")
        this.memoryNotifications = [...INITIAL_NOTIFICATIONS]
      }
    } catch (err) {
      console.warn("Error reading notifications database:", err)
    }

    if (!this.memoryNotifications) {
      this.memoryNotifications = [...INITIAL_NOTIFICATIONS]
    }

    return [...this.memoryNotifications]
  }

  static getById(id: string): NotificationRecord | undefined {
    const list = this.getAll()
    return list.find((n) => n.id === id)
  }

  /**
   * Non-blocking asynchronous notification dispatch
   * Never throws or interrupts upstream checkout/order processing
   */
  static sendAsync(
    type: NotificationEventType,
    recipientEmail: string,
    data: NotificationPayloadData = {},
    metadata?: Record<string, any>
  ): void {
    // Schedule on next tick to prevent blocking current execution thread
    setTimeout(() => {
      this.sendSync(type, recipientEmail, data, metadata).catch((err) => {
        console.error(`[NotificationService Async Notice] Failed to deliver ${type} to ${recipientEmail}:`, err)
      })
    }, 0)
  }

  /**
   * Synchronous / Awaited notification delivery
   */
  static async sendSync(
    type: NotificationEventType,
    recipientEmail: string,
    data: NotificationPayloadData = {},
    metadata?: Record<string, any>
  ): Promise<NotificationRecord> {
    const rendered = TemplateRegistry.render(type, {
      ...data,
      customerEmail: recipientEmail,
    })

    const provider = getNotificationProvider()
    const recordId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const record: NotificationRecord = {
      id: recordId,
      type,
      recipientEmail,
      recipientName: data.customerName || "Customer",
      subject: rendered.subject,
      htmlBody: rendered.html,
      textBody: rendered.text,
      status: "Pending",
      provider: provider.name,
      attempts: 1,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata,
    }

    try {
      const sendResult = await provider.sendEmail({
        to: recipientEmail,
        toName: data.customerName,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        metadata,
      })

      if (sendResult.success) {
        record.status = "Sent"
        record.messageId = sendResult.messageId
      } else {
        record.status = "Failed"
        record.error = sendResult.error || "Email provider rejected delivery"
      }
    } catch (err: any) {
      record.status = "Failed"
      record.error = err.message || "Network exception during dispatch"
    }

    this.saveRecord(record)
    return record
  }

  /**
   * Re-attempts delivery of a failed or pending notification
   */
  static async retry(id: string): Promise<NotificationRecord | null> {
    const record = this.getById(id)
    if (!record) return null

    record.attempts = (record.attempts || 1) + 1
    record.status = "Retrying"
    record.updatedAt = new Date().toISOString()
    this.saveRecord(record)

    const provider = getNotificationProvider()
    try {
      const sendResult = await provider.sendEmail({
        to: record.recipientEmail,
        toName: record.recipientName,
        subject: record.subject,
        html: record.htmlBody,
        text: record.textBody,
        metadata: record.metadata,
      })

      if (sendResult.success) {
        record.status = "Sent"
        record.messageId = sendResult.messageId
        record.error = undefined
      } else {
        record.status = "Failed"
        record.error = sendResult.error || "Retry attempt rejected by provider"
      }
    } catch (err: any) {
      record.status = "Failed"
      record.error = err.message || "Network error during retry"
    }

    record.updatedAt = new Date().toISOString()
    this.saveRecord(record)
    return record
  }

  private static saveRecord(record: NotificationRecord) {
    const list = this.getAll()
    const index = list.findIndex((n) => n.id === record.id)
    if (index > -1) {
      list[index] = record
    } else {
      list.unshift(record)
    }

    this.memoryNotifications = list

    try {
      const { fs } = getFsAndPath()
      const filePath = getNotificationsFilePath()
      if (fs && filePath) {
        fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8")
      }
    } catch (err) {
      console.error("Error saving notification record to disk:", err)
    }
  }
}
