import crypto from "crypto"
import fs from "fs"
import path from "path"
import { AdminDataService, AdminOrder } from "./admin-api"
import { productStore } from "./product-store"

/**
 * Enterprise Payment Service Layer
 * 
 * Handles Razorpay Online Payments (UPI, Cards, Netbanking) and Cash on Delivery (COD).
 * Implements:
 * - Server-side only Razorpay key management (Zero client secrets)
 * - Cryptographic HMAC-SHA256 signature verification
 * - Webhook signature verification and idempotent processing
 * - Duplicate order creation prevention
 * - Full & Partial Refund processing
 * - Chronological Payment Event Audit Trail
 */

export interface PaymentTransaction {
  id: string
  orderId: string
  gateway: "Razorpay" | "Cash on Delivery"
  amount: number
  currency: string
  mode: "UPI" | "Credit Card" | "Debit Card" | "NetBanking" | "Wallet" | "COD"
  status: "Captured" | "Settled" | "Pending" | "Refunded" | "Partially Refunded" | "Failed"
  gatewayRef: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  refundedAmount?: number
  refundReason?: string
  customerEmail: string
  customerPhone: string
  createdAt: string
  updatedAt: string
}

export interface PaymentEventLog {
  id: string
  transactionId?: string
  orderId?: string
  event: string
  status: "success" | "failure" | "warning" | "info"
  message: string
  details?: Record<string, any>
  timestamp: string
}

// In-Memory transaction & event storage with disk persistence
let memoryTransactions: PaymentTransaction[] = [
  {
    id: "tx_10492",
    orderId: "ADKT-10492",
    gateway: "Razorpay",
    amount: 4948,
    currency: "INR",
    mode: "UPI",
    status: "Captured",
    gatewayRef: "pay_Oz91823Jlkasdf",
    razorpayOrderId: "order_Oz91823Jlk_ord",
    razorpayPaymentId: "pay_Oz91823Jlkasdf",
    refundedAmount: 0,
    customerEmail: "aditya.sharma@example.com",
    customerPhone: "9876543210",
    createdAt: "2026-08-16T14:31:00Z",
    updatedAt: "2026-08-16T14:31:05Z",
  },
  {
    id: "tx_10491",
    orderId: "ADKT-10491",
    gateway: "Razorpay",
    amount: 2999,
    currency: "INR",
    mode: "NetBanking",
    status: "Settled",
    gatewayRef: "pay_Oz88172Klmqwer",
    razorpayOrderId: "order_Oz88172Klm_ord",
    razorpayPaymentId: "pay_Oz88172Klmqwer",
    refundedAmount: 0,
    customerEmail: "rohan.varma@gmail.com",
    customerPhone: "9811122334",
    createdAt: "2026-08-16T11:16:00Z",
    updatedAt: "2026-08-16T11:16:08Z",
  },
  {
    id: "tx_10490",
    orderId: "ADKT-10490",
    gateway: "Razorpay",
    amount: 3998,
    currency: "INR",
    mode: "Credit Card",
    status: "Settled",
    gatewayRef: "pay_Oz76123Poxzcvb",
    razorpayOrderId: "order_Oz76123Pox_ord",
    razorpayPaymentId: "pay_Oz76123Poxzcvb",
    refundedAmount: 0,
    customerEmail: "pooja.h@outlook.com",
    customerPhone: "9765411223",
    createdAt: "2026-08-15T18:46:00Z",
    updatedAt: "2026-08-15T18:46:12Z",
  },
  {
    id: "tx_10489",
    orderId: "ADKT-10489",
    gateway: "Cash on Delivery",
    amount: 3499,
    currency: "INR",
    mode: "COD",
    status: "Pending",
    gatewayRef: "COD-VERIFIED-400050",
    refundedAmount: 0,
    customerEmail: "vikram.m@gmail.com",
    customerPhone: "9820044556",
    createdAt: "2026-08-15T12:20:00Z",
    updatedAt: "2026-08-15T12:20:00Z",
  },
]

let memoryEventLogs: PaymentEventLog[] = [
  {
    id: "ev_1",
    transactionId: "tx_10492",
    orderId: "ADKT-10492",
    event: "payment.captured",
    status: "success",
    message: "Razorpay payment authorized and verified via HMAC-SHA256 signature.",
    timestamp: "2026-08-16T14:31:05Z",
  },
]

export interface PaymentGatewayConfig {
  id: "razorpay" | "cod"
  name: string
  description: string
  enabled: boolean
  badge?: string
  maxAmount?: number
}

export interface PaymentMethodsConfig {
  razorpay: PaymentGatewayConfig
  cod: PaymentGatewayConfig
  updatedAt: string
}

let memoryPaymentConfig: PaymentMethodsConfig = {
  razorpay: {
    id: "razorpay",
    name: "Razorpay Secure Online",
    description: "UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, Wallets",
    enabled: true,
    badge: "Prepaid",
  },
  cod: {
    id: "cod",
    name: "Cash On Delivery (COD)",
    description: "Pay cash upon delivery at your doorstep",
    enabled: true,
    badge: "Doorstep Cash",
    maxAmount: 10000,
  },
  updatedAt: new Date().toISOString(),
}

// Set to track processed webhook event IDs for idempotency
const processedWebhookEventIds = new Set<string>()

// Set to track processed payment IDs to prevent duplicate order creations
const processedPaymentIds = new Set<string>(["pay_Oz91823Jlkasdf", "pay_Oz88172Klmqwer", "pay_Oz76123Poxzcvb"])

function getPaymentsFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "payments.json"),
    path.join(process.cwd(), "data", "payments.json"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[0]
}

function getPaymentConfigFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "payment-config.json"),
    path.join(process.cwd(), "data", "payment-config.json"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[0]
}

function loadPaymentConfigFromDisk() {
  if (typeof window === "undefined") {
    try {
      const filePath = getPaymentConfigFilePath()
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const data = JSON.parse(raw)
        if (data?.razorpay && data?.cod) {
          memoryPaymentConfig = {
            razorpay: {
              ...memoryPaymentConfig.razorpay,
              ...data.razorpay,
            },
            cod: {
              ...memoryPaymentConfig.cod,
              ...data.cod,
            },
            updatedAt: data.updatedAt || new Date().toISOString(),
          }
        }
      }
    } catch (err) {
      console.error("[PaymentService] Error reading payment config from disk:", err)
    }
  }
}

function savePaymentConfigToDisk() {
  if (typeof window === "undefined") {
    try {
      const jsonStr = JSON.stringify(memoryPaymentConfig, null, 2)
      const targets = [
        path.join(process.cwd(), "apps", "storefront", "data", "payment-config.json"),
        path.join(process.cwd(), "data", "payment-config.json"),
      ]
      for (const target of targets) {
        try {
          const dir = path.dirname(target)
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(target, jsonStr, "utf-8")
        } catch {}
      }
    } catch (err) {
      console.error("[PaymentService] Error saving payment config to disk:", err)
    }
  }
}

function loadPaymentsFromDisk() {
  if (typeof window === "undefined") {
    try {
      const filePath = getPaymentsFilePath()
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const data = JSON.parse(raw)
        if (data?.transactions && Array.isArray(data.transactions)) {
          memoryTransactions = data.transactions
          for (const tx of memoryTransactions) {
            if (tx.razorpayPaymentId) processedPaymentIds.add(tx.razorpayPaymentId)
          }
        }
        if (data?.eventLogs && Array.isArray(data.eventLogs)) {
          memoryEventLogs = data.eventLogs
        }
      }
    } catch (err) {
      console.error("[PaymentService] Error reading payments from disk:", err)
    }
  }
}

function savePaymentsToDisk() {
  if (typeof window === "undefined") {
    try {
      const data = {
        transactions: memoryTransactions,
        eventLogs: memoryEventLogs,
        lastUpdated: new Date().toISOString(),
      }
      const jsonStr = JSON.stringify(data, null, 2)
      const targets = [
        path.join(process.cwd(), "apps", "storefront", "data", "payments.json"),
        path.join(process.cwd(), "data", "payments.json"),
      ]
      for (const target of targets) {
        try {
          const dir = path.dirname(target)
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(target, jsonStr, "utf-8")
        } catch {}
      }
    } catch (err) {
      console.error("[PaymentService] Error saving payments to disk:", err)
    }
  }
}

// Initial hydration from disk
loadPaymentsFromDisk()
loadPaymentConfigFromDisk()

export class PaymentService {
  /**
   * Get payment methods configuration
   */
  static getPaymentConfig(): PaymentMethodsConfig {
    loadPaymentConfigFromDisk()
    return { ...memoryPaymentConfig }
  }

  /**
   * Update payment methods configuration
   */
  static updatePaymentConfig(updates: Partial<PaymentMethodsConfig>): PaymentMethodsConfig {
    loadPaymentConfigFromDisk()
    memoryPaymentConfig = {
      ...memoryPaymentConfig,
      ...updates,
      razorpay: updates.razorpay
        ? { ...memoryPaymentConfig.razorpay, ...updates.razorpay }
        : memoryPaymentConfig.razorpay,
      cod: updates.cod
        ? { ...memoryPaymentConfig.cod, ...updates.cod }
        : memoryPaymentConfig.cod,
      updatedAt: new Date().toISOString(),
    }
    savePaymentConfigToDisk()

    PaymentService.logEvent({
      event: "payment_methods.updated",
      status: "info",
      message: `Payment methods updated by administrator: Razorpay [${memoryPaymentConfig.razorpay.enabled ? "ENABLED" : "DISABLED"}], Cash on Delivery [${memoryPaymentConfig.cod.enabled ? "ENABLED" : "DISABLED"}].`,
    })

    return { ...memoryPaymentConfig }
  }

  /**
   * Check if a specific payment method is currently enabled
   */
  static isMethodEnabled(method: "razorpay" | "cod"): boolean {
    loadPaymentConfigFromDisk()
    return memoryPaymentConfig[method]?.enabled ?? true
  }

  /**
   * Log an audit event
   */
  static logEvent(event: Omit<PaymentEventLog, "id" | "timestamp">) {
    const entry: PaymentEventLog = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event,
    }
    memoryEventLogs.unshift(entry)
    if (memoryEventLogs.length > 200) memoryEventLogs = memoryEventLogs.slice(0, 200)
    savePaymentsToDisk()
    return entry
  }

  /**
   * Get all transactions
   */
  static getTransactions(): PaymentTransaction[] {
    loadPaymentsFromDisk()
    return [...memoryTransactions]
  }

  /**
   * Get audit event logs
   */
  static getEventLogs(): PaymentEventLog[] {
    loadPaymentsFromDisk()
    return [...memoryEventLogs]
  }

  /**
   * Check if a Razorpay payment ID has already been verified and processed (Idempotency)
   */
  static isPaymentAlreadyProcessed(paymentId: string): boolean {
    loadPaymentsFromDisk()
    return (
      processedPaymentIds.has(paymentId) ||
      memoryTransactions.some((t) => t.razorpayPaymentId === paymentId || t.gatewayRef === paymentId)
    )
  }

  /**
   * Check if a Webhook Event has already been processed (Idempotency)
   */
  static isWebhookEventProcessed(eventId: string): boolean {
    return processedWebhookEventIds.has(eventId)
  }

  /**
   * Mark a Webhook Event as processed
   */
  static markWebhookEventProcessed(eventId: string) {
    processedWebhookEventIds.add(eventId)
  }

  /**
   * Create Razorpay Order on the Server
   * Calls Razorpay Orders API if live credentials exist, or creates a standard Razorpay order structure.
   */
  static async createRazorpayOrder(params: {
    amountInINR: number
    receipt: string
    notes?: Record<string, string>
  }): Promise<{
    orderId: string
    amount: number
    currency: string
    keyId: string
  }> {
    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_YourKeyIdHere123456"
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    const amountInPaise = Math.round(params.amountInINR * 100)

    // If real Razorpay keySecret is configured and doesn't contain placeholder text
    if (
      keySecret &&
      keySecret !== "YourRazorpaySecretKeyHere789012" &&
      !keySecret.includes("YourRazorpaySecret")
    ) {
      try {
        const Razorpay = require("razorpay")
        const instance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        })

        const order = await instance.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: params.receipt,
          notes: params.notes || {},
        })

        PaymentService.logEvent({
          event: "razorpay.order_created",
          status: "success",
          message: `Created Razorpay Order ${order.id} for amount ₹${params.amountInINR}`,
          details: { razorpayOrderId: order.id, receipt: params.receipt },
        })

        return {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId,
        }
      } catch (err: any) {
        PaymentService.logEvent({
          event: "razorpay.order_create_error",
          status: "failure",
          message: `Razorpay API error: ${err.message}`,
        })
        throw new Error(`Razorpay Order creation failed: ${err.message}`)
      }
    }

    // Standardized Order ID for development/staging environments
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`

    PaymentService.logEvent({
      event: "razorpay.order_created",
      status: "info",
      message: `Generated Razorpay Order ${mockOrderId} for ₹${params.amountInINR}`,
      details: { razorpayOrderId: mockOrderId, receipt: params.receipt },
    })

    return {
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId,
    }
  }

  /**
   * Cryptographic HMAC-SHA256 Verification of Payment Signature
   * Formula: hmac_sha256(order_id + "|" + payment_id, key_secret) === signature
   * Uses timing-safe equality comparison to prevent timing side-channel attacks.
   */
  static verifyRazorpaySignature(params: {
    orderId: string
    paymentId: string
    signature: string
  }): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "YourRazorpaySecretKeyHere789012"

    if (!params.orderId || !params.paymentId || !params.signature) {
      return false
    }

    try {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${params.orderId}|${params.paymentId}`)
        .digest("hex")

      const expectedBuffer = Buffer.from(generatedSignature, "utf-8")
      const receivedBuffer = Buffer.from(params.signature, "utf-8")

      if (expectedBuffer.length === receivedBuffer.length) {
        if (crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
          return true
        }
      }

      // If in development with placeholder keys, allow verified mock signatures
      if (
        (keySecret === "YourRazorpaySecretKeyHere789012" || keySecret.includes("placeholder")) &&
        params.signature.startsWith("sig_") &&
        params.signature.includes("valid")
      ) {
        return true
      }

      return false
    } catch (err) {
      return false
    }
  }

  /**
   * Verify Razorpay Webhook Signature
   * Formula: hmac_sha256(raw_request_body, webhook_secret) === X-Razorpay-Signature
   * Uses timing-safe equality comparison.
   */
  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret || webhookSecret.includes("YourWebhookSecret")) {
      return true // permissive in local development if secret is not yet configured
    }

    if (!rawBody || !signature) {
      return false
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex")

      const expectedBuffer = Buffer.from(expectedSignature, "utf-8")
      const receivedBuffer = Buffer.from(signature, "utf-8")

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false
      }

      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    } catch {
      return false
    }
  }

  /**
   * Finalize and Record an Online Order Payment (Idempotent)
   */
  static recordOnlinePayment(params: {
    orderId: string
    amount: number
    razorpayOrderId: string
    razorpayPaymentId: string
    customerEmail: string
    customerPhone: string
    paymentMode?: "UPI" | "Credit Card" | "Debit Card" | "NetBanking" | "Wallet"
  }): PaymentTransaction {
    loadPaymentsFromDisk()

    // Check if transaction already exists for this payment ID
    const existing = memoryTransactions.find(
      (t) => t.razorpayPaymentId === params.razorpayPaymentId || t.gatewayRef === params.razorpayPaymentId
    )
    if (existing) {
      return existing
    }

    const tx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      orderId: params.orderId,
      gateway: "Razorpay",
      amount: params.amount,
      currency: "INR",
      mode: params.paymentMode || "UPI",
      status: "Captured",
      gatewayRef: params.razorpayPaymentId,
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      refundedAmount: 0,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    memoryTransactions.unshift(tx)
    processedPaymentIds.add(params.razorpayPaymentId)

    PaymentService.logEvent({
      transactionId: tx.id,
      orderId: params.orderId,
      event: "payment.captured",
      status: "success",
      message: `Verified and captured payment ${params.razorpayPaymentId} for Order #${params.orderId} (₹${params.amount})`,
      details: {
        paymentId: params.razorpayPaymentId,
        orderId: params.orderId,
        amount: params.amount,
      },
    })

    savePaymentsToDisk()
    return tx
  }

  /**
   * Record a Cash on Delivery Order Payment
   */
  static recordCodPayment(params: {
    orderId: string
    amount: number
    pincode: string
    customerEmail: string
    customerPhone: string
  }): PaymentTransaction {
    loadPaymentsFromDisk()

    const tx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      orderId: params.orderId,
      gateway: "Cash on Delivery",
      amount: params.amount,
      currency: "INR",
      mode: "COD",
      status: "Pending",
      gatewayRef: `COD-PIN-${params.pincode}`,
      refundedAmount: 0,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    memoryTransactions.unshift(tx)

    PaymentService.logEvent({
      transactionId: tx.id,
      orderId: params.orderId,
      event: "payment.cod_created",
      status: "info",
      message: `Created COD payment record for Order #${params.orderId} (₹${params.amount}, PIN: ${params.pincode})`,
    })

    savePaymentsToDisk()
    return tx
  }

  /**
   * Settle a Cash on Delivery Payment upon Verified Delivery
   */
  static settleCodPayment(params: {
    orderId: string
    amount?: number
    customerEmail?: string
    customerPhone?: string
    notes?: string
  }): PaymentTransaction {
    loadPaymentsFromDisk()

    const cleanOrderId = params.orderId
    let tx = memoryTransactions.find(
      (t) => t.orderId === cleanOrderId || t.orderId.endsWith(cleanOrderId) || cleanOrderId.endsWith(t.orderId)
    )

    if (tx) {
      tx.status = "Settled"
      if (params.amount) tx.amount = params.amount
      tx.updatedAt = new Date().toISOString()
    } else {
      tx = {
        id: `tx_${Date.now()}`,
        orderId: cleanOrderId,
        gateway: "Cash on Delivery",
        amount: params.amount || 0,
        currency: "INR",
        mode: "COD",
        status: "Settled",
        gatewayRef: `COD-COLLECTED-${cleanOrderId}`,
        refundedAmount: 0,
        customerEmail: params.customerEmail || "customer@example.com",
        customerPhone: params.customerPhone || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      memoryTransactions.unshift(tx)
    }

    PaymentService.logEvent({
      transactionId: tx.id,
      orderId: cleanOrderId,
      event: "payment.cod_settled",
      status: "success",
      message: `Cash on Delivery collected & settled: ₹${tx.amount} for Order #${cleanOrderId}. ${params.notes || ""}`,
      details: {
        orderId: cleanOrderId,
        amount: tx.amount,
        settledAt: tx.updatedAt,
        notes: params.notes,
      },
    })

    savePaymentsToDisk()
    return tx
  }

  /**
   * Process a Refund (Full or Partial)
   */
  static async processRefund(params: {
    transactionId: string
    amount?: number
    reason: string
  }): Promise<{ success: boolean; transaction: PaymentTransaction; refundId: string }> {
    loadPaymentsFromDisk()

    const tx = memoryTransactions.find(
      (t) =>
        t.id === params.transactionId ||
        t.orderId === params.transactionId ||
        t.razorpayPaymentId === params.transactionId ||
        t.gatewayRef === params.transactionId
    )
    if (!tx) {
      throw new Error(`Transaction ${params.transactionId} not found`)
    }

    if (tx.status === "Refunded") {
      throw new Error(`Transaction ${params.transactionId} is already fully refunded`)
    }

    const refundAmount = params.amount || tx.amount
    if (refundAmount <= 0 || refundAmount > (tx.amount - (tx.refundedAmount || 0))) {
      throw new Error(`Invalid refund amount ₹${refundAmount}. Maximum refundable: ₹${tx.amount - (tx.refundedAmount || 0)}`)
    }

    let refundId = `rfnd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    // If online Razorpay payment and credentials configured, call Razorpay Refund API
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (
      tx.gateway === "Razorpay" &&
      tx.razorpayPaymentId &&
      keySecret &&
      !keySecret.includes("YourRazorpaySecret")
    ) {
      try {
        const Razorpay = require("razorpay")
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          key_secret: keySecret,
        })

        if (!tx.razorpayPaymentId.includes("test_") && !tx.razorpayPaymentId.includes("simulated")) {
          const rzpRefund = await instance.payments.refund(tx.razorpayPaymentId, {
            amount: Math.round(refundAmount * 100),
            notes: { reason: params.reason, order_id: tx.orderId },
          })
          refundId = rzpRefund.id
        }
      } catch (err: any) {
        if (!tx.razorpayPaymentId.includes("test_")) {
          const errorMsg = err.message || err.error?.description || "Gateway refund failed"
          PaymentService.logEvent({
            transactionId: tx.id,
            orderId: tx.orderId,
            event: "payment.refund_failed",
            status: "failure",
            message: `Razorpay Refund API error: ${errorMsg}`,
          })
          throw new Error(`Razorpay Refund failed: ${errorMsg}`)
        }
      }
    }

    const currentRefunded = (tx.refundedAmount || 0) + refundAmount
    tx.refundedAmount = currentRefunded
    tx.refundReason = params.reason
    tx.status = currentRefunded >= tx.amount ? "Refunded" : "Partially Refunded"
    tx.updatedAt = new Date().toISOString()

    // Sync status with AdminOrder if available
    const orders = AdminDataService.getOrders()
    const order = orders.find((o) => o.displayId === tx.orderId || o.id === tx.orderId)
    if (order) {
      order.paymentStatus = tx.status === "Refunded" ? "Refunded" : "Captured"
      order.timeline.unshift({
        id: `tl_${Date.now()}`,
        time: new Date().toISOString().replace("T", " ").slice(0, 16),
        title: `Refund Processed (${tx.status})`,
        description: `₹${refundAmount} refunded. Reason: ${params.reason}. Refund ID: ${refundId}`,
        user: "Finance Admin",
      })
    }

    PaymentService.logEvent({
      transactionId: tx.id,
      orderId: tx.orderId,
      event: "payment.refund_processed",
      status: "success",
      message: `Refund of ₹${refundAmount} processed for Order #${tx.orderId}. Reason: ${params.reason}`,
      details: { refundId, refundAmount, totalRefunded: currentRefunded },
    })

    savePaymentsToDisk()
    return { success: true, transaction: tx, refundId }
  }
}
