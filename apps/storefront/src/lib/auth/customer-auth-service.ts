import crypto from "crypto"
import fs from "fs"
import path from "path"
import { OrdersDB } from "@/lib/orders-db"

export interface CustomerAddress {
  id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface CustomerRecord {
  id: string
  email: string
  passwordHash: string // Format: "salt:scryptHexHash"
  firstName: string
  lastName: string
  phone: string
  addresses: CustomerAddress[]
  wishlist: string[]
  resetToken?: {
    token: string
    expiresAt: number // timestamp in ms
  }
  createdAt: string
  updatedAt: string
}

export interface CustomerProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  addresses: CustomerAddress[]
  wishlist: string[]
  createdAt: string
}

export interface SessionTokenPayload {
  customerId: string
  email: string
  exp: number
}

const JWT_SECRET = process.env.CUSTOMER_SESSION_SECRET || "adikt_medusa_customer_jwt_secret_key_2026_super_secure"
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 Days

// In-Memory state for fast runtime access
let memoryCustomers: CustomerRecord[] = []
let isInitialized = false

/**
 * Medusa-aligned Password Hashing using scrypt (Node crypto)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString("hex")}`
}

/**
 * Medusa-aligned Password Verification using scrypt
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false
  const [salt, key] = storedHash.split(":")
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey)
}

/**
 * Generate HMAC-SHA256 Signed Session Token
 */
export function generateSessionToken(customer: CustomerRecord): string {
  const payload: SessionTokenPayload = {
    customerId: customer.id,
    email: customer.email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadB64)
    .digest("base64url")

  return `${payloadB64}.${signature}`
}

/**
 * Verify HMAC-SHA256 Signed Session Token
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) return null
    const [payloadB64, signature] = token.split(".")
    if (!payloadB64 || !signature) return null

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(payloadB64)
      .digest("base64url")

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null
    }

    const payload: SessionTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    )

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null // Expired
    }

    return payload
  } catch (err) {
    return null
  }
}

/**
 * Seed Initial Customers
 */
function getInitialSeedCustomers(): CustomerRecord[] {
  return [
    {
      id: "cus_01JADIKT0928374",
      email: "aditya.sharma@example.com",
      passwordHash: hashPassword("Adikt@2026"),
      firstName: "Aditya",
      lastName: "Sharma",
      phone: "+91 98765 43210",
      addresses: [
        {
          id: "addr_1",
          name: "Aditya Sharma",
          phone: "+91 98765 43210",
          addressLine1: "B-402, Highline Residences, Linking Road",
          addressLine2: "Near Turner Road Junction, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          isDefault: true,
        },
        {
          id: "addr_2",
          name: "Aditya Sharma (Office)",
          phone: "+91 98765 43210",
          addressLine1: "WeWork Oberoi Commerz II, International Business Park",
          addressLine2: "Goregaon East",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400063",
          isDefault: false,
        },
      ],
      wishlist: ["prod_01JADIKT01", "prod_01JADIKT02"],
      createdAt: "2026-08-01T10:00:00Z",
      updatedAt: "2026-08-16T15:00:00Z",
    },
    {
      id: "cus_01JADIKT0928375",
      email: "priya.patel@example.com",
      passwordHash: hashPassword("Adikt@2026"),
      firstName: "Priya",
      lastName: "Patel",
      phone: "+91 98220 12345",
      addresses: [
        {
          id: "addr_3",
          name: "Priya Patel",
          phone: "+91 98220 12345",
          addressLine1: "42, Shanti Sadan, CG Road",
          addressLine2: "Navrangpura",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380009",
          isDefault: true,
        },
      ],
      wishlist: ["prod_01JADIKT03"],
      createdAt: "2026-08-05T12:00:00Z",
      updatedAt: "2026-08-16T15:00:00Z",
    },
  ]
}

function getCustomersFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "customers.json"),
    path.join(process.cwd(), "data", "customers.json"),
  ]
  for (const f of candidates) {
    if (fs.existsSync(path.dirname(f))) return f
  }
  return candidates[0]
}

function loadCustomersFromDisk(): void {
  if (isInitialized && memoryCustomers.length > 0) return

  const file = getCustomersFilePath()
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf-8")
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCustomers = parsed
        isInitialized = true
        return
      }
    }
  } catch (err) {
    console.error("[CustomerAuthService] Error reading customers from disk:", err)
  }

  // If not on disk, seed initial customers
  memoryCustomers = getInitialSeedCustomers()
  isInitialized = true
  saveCustomersToDisk()
}

function saveCustomersToDisk(): void {
  const targets = [
    path.join(process.cwd(), "apps", "storefront", "data", "customers.json"),
    path.join(process.cwd(), "data", "customers.json"),
  ]

  const jsonStr = JSON.stringify(memoryCustomers, null, 2)
  for (const target of targets) {
    try {
      const dir = path.dirname(target)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(target, jsonStr, "utf-8")
    } catch {}
  }
}

export class CustomerAuthService {
  /**
   * Helper: Extract session token from Request (Cookie or Authorization header)
   */
  static extractToken(req: Request): string | null {
    // 1. From Cookie header
    const cookieHeader = req.headers.get("cookie") || ""
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=")
        return [k, v.join("=")]
      })
    )

    if (cookies["adikt_customer_token"]) {
      return decodeURIComponent(cookies["adikt_customer_token"])
    }

    // 2. From Authorization header: Bearer <token>
    const authHeader = req.headers.get("authorization") || ""
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim()
    }

    return null
  }

  /**
   * Helper: Get Authenticated Customer Record or throw 401
   */
  static getAuthenticatedCustomerFromRequest(req: Request): CustomerProfile {
    const token = this.extractToken(req)
    if (!token) {
      throw new Error("Authentication required. Please sign in.")
    }

    const customer = this.getCustomerByToken(token)
    if (!customer) {
      throw new Error("Invalid or expired session token. Please sign in again.")
    }

    return customer
  }

  /**
   * 1. Register Customer with Scrypt Password Hash
   */
  static register(params: {
    email: string
    password: string
    firstName: string
    lastName?: string
    phone?: string
  }): { customer: CustomerProfile; token: string } {
    loadCustomersFromDisk()

    const cleanEmail = params.email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("A valid email address is required")
    }

    if (!params.password || params.password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }

    if (!params.firstName || !params.firstName.trim()) {
      throw new Error("First name is required")
    }

    const existing = memoryCustomers.find((c) => c.email.toLowerCase() === cleanEmail)
    if (existing) {
      throw new Error("An account with this email address already exists. Please sign in instead.")
    }

    const newCustomer: CustomerRecord = {
      id: `cus_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      passwordHash: hashPassword(params.password),
      firstName: params.firstName.trim(),
      lastName: (params.lastName || "").trim(),
      phone: (params.phone || "").trim(),
      addresses: [],
      wishlist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    memoryCustomers.unshift(newCustomer)
    saveCustomersToDisk()

    const token = generateSessionToken(newCustomer)
    return {
      customer: this.sanitizeCustomer(newCustomer),
      token,
    }
  }

  /**
   * 2. Authenticate Customer by Email & Password
   */
  static login(params: {
    email: string
    password: string
  }): { customer: CustomerProfile; token: string } {
    loadCustomersFromDisk()

    const cleanEmail = (params.email || "").trim().toLowerCase()
    const customer = memoryCustomers.find((c) => c.email.toLowerCase() === cleanEmail)

    if (!customer) {
      throw new Error("Invalid email or password")
    }

    const isMatch = verifyPassword(params.password, customer.passwordHash)
    if (!isMatch) {
      throw new Error("Invalid email or password")
    }

    const token = generateSessionToken(customer)
    return {
      customer: this.sanitizeCustomer(customer),
      token,
    }
  }

  /**
   * 3. Request Password Reset Token (1-Hour TTL)
   */
  static requestPasswordReset(email: string): { success: boolean; token?: string; resetUrl?: string } {
    loadCustomersFromDisk()

    const cleanEmail = (email || "").trim().toLowerCase()
    const customer = memoryCustomers.find((c) => c.email.toLowerCase() === cleanEmail)

    if (!customer) {
      // Return success true to prevent email enumeration
      return { success: true }
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour

    customer.resetToken = {
      token: resetToken,
      expiresAt,
    }
    customer.updatedAt = new Date().toISOString()
    saveCustomersToDisk()

    return {
      success: true,
      token: resetToken,
      resetUrl: `/reset-password?token=${resetToken}`,
    }
  }

  /**
   * 4. Reset Password with Reset Token
   */
  static resetPassword(params: { token: string; newPassword: string }): { success: boolean } {
    loadCustomersFromDisk()

    if (!params.token) {
      throw new Error("Password reset token is required")
    }

    if (!params.newPassword || params.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long")
    }

    const customer = memoryCustomers.find(
      (c) => c.resetToken && c.resetToken.token === params.token
    )

    if (!customer || !customer.resetToken) {
      throw new Error("Invalid or expired password reset token")
    }

    if (customer.resetToken.expiresAt < Date.now()) {
      customer.resetToken = undefined
      saveCustomersToDisk()
      throw new Error("Password reset token has expired. Please request a new link.")
    }

    customer.passwordHash = hashPassword(params.newPassword)
    customer.resetToken = undefined
    customer.updatedAt = new Date().toISOString()
    saveCustomersToDisk()

    return { success: true }
  }

  /**
   * 5. Get Authenticated Customer from Token
   */
  static getCustomerByToken(token: string): CustomerProfile | null {
    loadCustomersFromDisk()

    const payload = verifySessionToken(token)
    if (!payload) return null

    const customer = memoryCustomers.find(
      (c) => c.id === payload.customerId && c.email.toLowerCase() === payload.email.toLowerCase()
    )

    if (!customer) return null
    return this.sanitizeCustomer(customer)
  }

  /**
   * 6. Update Profile
   */
  static updateProfile(
    customerId: string,
    updates: {
      firstName?: string
      lastName?: string
      phone?: string
      newPassword?: string
      currentPassword?: string
    }
  ): CustomerProfile {
    loadCustomersFromDisk()

    const customer = memoryCustomers.find((c) => c.id === customerId)
    if (!customer) throw new Error("Customer not found")

    if (updates.newPassword) {
      if (!updates.currentPassword || !verifyPassword(updates.currentPassword, customer.passwordHash)) {
        throw new Error("Current password verification failed")
      }
      if (updates.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long")
      }
      customer.passwordHash = hashPassword(updates.newPassword)
    }

    if (updates.firstName !== undefined) customer.firstName = updates.firstName.trim()
    if (updates.lastName !== undefined) customer.lastName = updates.lastName.trim()
    if (updates.phone !== undefined) customer.phone = updates.phone.trim()

    customer.updatedAt = new Date().toISOString()
    saveCustomersToDisk()

    return this.sanitizeCustomer(customer)
  }

  /**
   * 7. Address Management (IDOR Protected)
   */
  static getAddresses(customerId: string): CustomerAddress[] {
    loadCustomersFromDisk()
    const customer = memoryCustomers.find((c) => c.id === customerId)
    if (!customer) throw new Error("Customer not found")
    return [...customer.addresses]
  }

  static addAddress(customerId: string, address: Omit<CustomerAddress, "id">): CustomerAddress {
    loadCustomersFromDisk()
    const customer = memoryCustomers.find((c) => c.id === customerId)
    if (!customer) throw new Error("Customer not found")

    const isFirst = customer.addresses.length === 0
    const shouldBeDefault = address.isDefault || isFirst

    if (shouldBeDefault) {
      customer.addresses.forEach((a) => (a.isDefault = false))
    }

    const newAddr: CustomerAddress = {
      ...address,
      id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isDefault: shouldBeDefault,
    }

    customer.addresses.push(newAddr)
    customer.updatedAt = new Date().toISOString()
    saveCustomersToDisk()

    return newAddr
  }

  static updateAddress(
    customerId: string,
    addressId: string,
    updates: Partial<CustomerAddress>
  ): CustomerAddress {
    loadCustomersFromDisk()
    const customer = memoryCustomers.find((c) => c.id === customerId)
    if (!customer) throw new Error("Customer not found")

    const addrIndex = customer.addresses.findIndex((a) => a.id === addressId)
    if (addrIndex === -1) {
      // IDOR Protection: Address does not belong to this customer
      throw new Error("Address not found or unauthorized")
    }

    if (updates.isDefault) {
      customer.addresses.forEach((a) => (a.isDefault = false))
    }

    customer.addresses[addrIndex] = {
      ...customer.addresses[addrIndex],
      ...updates,
      id: addressId,
    }

    customer.updatedAt = new Date().toISOString()
    saveCustomersToDisk()

    return customer.addresses[addrIndex]
  }

  static deleteAddress(customerId: string, addressId: string): { success: boolean } {
    loadCustomersFromDisk()
    const customer = memoryCustomers.find((c) => c.id === customerId)
    if (!customer) throw new Error("Customer not found")

    const addrIndex = customer.addresses.findIndex((a) => a.id === addressId)
    if (addrIndex === -1) {
      // IDOR Protection: Cannot delete another customer's address
      throw new Error("Address not found or unauthorized")
    }

    const wasDefault = customer.addresses[addrIndex].isDefault
    customer.addresses.splice(addrIndex, 1)

    if (wasDefault && customer.addresses.length > 0) {
      customer.addresses[0].isDefault = true
    }

    customer.updatedAt = new Date().toISOString()
    saveCustomersToDisk()

    return { success: true }
  }

  static setDefaultAddress(customerId: string, addressId: string): CustomerAddress[] {
    loadCustomersFromDisk()
    const customer = memoryCustomers.find((c) => c.id === customerId)
    if (!customer) throw new Error("Customer not found")

    const target = customer.addresses.find((a) => a.id === addressId)
    if (!target) {
      throw new Error("Address not found or unauthorized")
    }

    customer.addresses.forEach((a) => {
      a.isDefault = a.id === addressId
    })

    customer.updatedAt = new Date().toISOString()
    saveCustomersToDisk()

    return [...customer.addresses]
  }

  /**
   * 8. Order Access (Strict IDOR Protection)
   */
  static getCustomerOrders(customerId: string, customerEmail: string) {
    const allOrders = OrdersDB.getAll()
    const cleanEmail = customerEmail.toLowerCase().trim()

    // Filter orders strictly by this customer's ID or verified email
    return allOrders.filter(
      (order) =>
        (order.customer?.id && order.customer.id === customerId) ||
        (order.customer?.email && order.customer.email.toLowerCase().trim() === cleanEmail)
    )
  }

  static getCustomerOrderById(customerId: string, customerEmail: string, orderId: string) {
    const orders = this.getCustomerOrders(customerId, customerEmail)
    const cleanId = orderId.toLowerCase().trim()

    const order = orders.find(
      (o) =>
        o.id.toLowerCase() === cleanId ||
        o.displayId.toLowerCase() === cleanId ||
        o.id.toLowerCase().endsWith(cleanId) ||
        o.displayId.toLowerCase().endsWith(cleanId)
    )

    if (!order) {
      // Check if order exists for another customer to detect IDOR attempt
      const allOrders = OrdersDB.getAll()
      const existsElsewhere = allOrders.find(
        (o) => o.id.toLowerCase() === cleanId || o.displayId.toLowerCase() === cleanId
      )
      if (existsElsewhere) {
        throw new Error("Access denied: You do not have permission to view this order (IDOR violation prevented)")
      }
      throw new Error("Order not found")
    }

    return order
  }

  /**
   * 9. Wishlist Management
   */
  static getWishlist(customerId: string): string[] {
    loadCustomersFromDisk()
    const customer = memoryCustomers.find((c) => c.id === customerId)
    if (!customer) throw new Error("Customer not found")
    return [...(customer.wishlist || [])]
  }

  static toggleWishlist(customerId: string, productId: string): { wishlist: string[]; isSaved: boolean } {
    loadCustomersFromDisk()
    const customer = memoryCustomers.find((c) => c.id === customerId)
    if (!customer) throw new Error("Customer not found")

    if (!customer.wishlist) customer.wishlist = []
    const idx = customer.wishlist.indexOf(productId)
    let isSaved = false

    if (idx > -1) {
      customer.wishlist.splice(idx, 1)
      isSaved = false
    } else {
      customer.wishlist.push(productId)
      isSaved = true
    }

    customer.updatedAt = new Date().toISOString()
    saveCustomersToDisk()

    return { wishlist: [...customer.wishlist], isSaved }
  }

  static getAllCustomersAdmin(): (CustomerProfile & { marketingConsent?: boolean })[] {
    loadCustomersFromDisk()
    return memoryCustomers.map((c) => ({
      ...this.sanitizeCustomer(c),
      marketingConsent: (c as any).marketingConsent ?? true,
    }))
  }

  /**
   * Strip sensitive fields (passwordHash, resetToken) from customer objects
   */
  private static sanitizeCustomer(customer: CustomerRecord): CustomerProfile {
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      addresses: customer.addresses || [],
      wishlist: customer.wishlist || [],
      createdAt: customer.createdAt,
    }
  }
}
