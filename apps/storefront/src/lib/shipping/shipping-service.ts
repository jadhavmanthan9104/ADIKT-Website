import fs from "fs"
import path from "path"
import {
  IShippingProvider,
  Shipment,
  ShipmentStatus,
  TrackingCheckpoint,
  CreateShipmentPayload,
  ReturnShipmentPayload,
  ServiceabilityResult,
  ShippingRate,
} from "./types"
import { ShiprocketProvider } from "./shiprocket-provider"
import { AdminDataService } from "../admin-api"

/**
 * Enterprise Shipping Service Facade
 * 
 * Orchestrates Indian Logistics Providers behind a clean interface.
 * Implements:
 * - Decoupled business logic (No business logic inside React components)
 * - Serviceability checks & dynamic Indian rates
 * - Automated AWB generation & printable label generator
 * - Multi-stage lifecycle state machine (Order Placed -> Packed -> Shipped -> In Transit -> Out for Delivery -> Delivered)
 * - Reverse Logistics & Return Shipments
 * - Real-time webhook processing
 * - JSON disk persistence
 */

const DEFAULT_PICKUP_ADDRESS = {
  name: "ADIKT Garment Fulfillment Warehouse Alpha",
  phone: "+91 98765 00000",
  addressLine1: "Plot 42, Cotton Mill Road, Anupparpalayam",
  addressLine2: "Textile City Hub",
  city: "Tirupur",
  state: "Tamil Nadu",
  pincode: "641652",
  country: "India",
}

let memoryShipments: Shipment[] = [
  {
    id: "shp_10492",
    orderId: "order_10492",
    displayId: "ADKT-10492",
    courier: "Bluedart Air Express",
    courierCode: "BLUEDART_AIR",
    awb: "889123041",
    trackingUrl: "/track?awb=889123041",
    status: "In Transit",
    shippingCost: 0,
    isCod: false,
    codAmount: 0,
    packageWeightKg: 0.7,
    dimensions: { lengthCm: 30, breadthCm: 25, heightCm: 5 },
    shippingAddress: {
      name: "Aditya Sharma",
      phone: "9876543210",
      email: "aditya.sharma@example.com",
      addressLine1: "B-402, Highline Residences, Linking Road",
      addressLine2: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
    },
    pickupAddress: DEFAULT_PICKUP_ADDRESS,
    items: [
      {
        id: "item_1",
        title: "280 GSM Boxy Heavyweight Tee - Vintage Black",
        variant: "L / Vintage Black",
        sku: "ADKT-TEE-BLK-L",
        quantity: 1,
        price: 1999,
        weightGrams: 320,
      },
      {
        id: "item_2",
        title: "400 GSM French Terry Drop-Shoulder Hoodie - Olive",
        variant: "L / Olive",
        sku: "ADKT-HD-OLV-L",
        quantity: 1,
        price: 2949,
        weightGrams: 420,
      },
    ],
    labelUrl: "/api/shipping/generate-label?awb=889123041&orderId=ADKT-10492",
    checkpoints: [
      {
        status: "In Transit",
        title: "Arrived at Regional Logistics Sort Center",
        location: "Mumbai Alpha Sorting Hub, Bhiwandi",
        timestamp: "2026-08-16 19:40",
        description: "Bag scan completed. Parcel assigned to delivery van for Bandra Hub.",
      },
      {
        status: "Shipped",
        title: "Dispatched from Tirupur Garment Fulfillment Hub",
        location: "Tirupur Warehouse (WH-1), Tamil Nadu",
        timestamp: "2026-08-16 08:15",
        description: "Package handed over to Bluedart Air carrier.",
      },
      {
        status: "Packed",
        title: "Garment Quality Checked & Sealed",
        location: "Tirupur Packaging Facility",
        timestamp: "2026-08-15 17:30",
        description: "Bio-washed garments packed in ADIKT matte obsidian anti-tamper mailer.",
      },
      {
        status: "Shipment Created",
        title: "Air Waybill (AWB) Generated",
        location: "Logistics Automation Hub",
        timestamp: "2026-08-15 14:45",
        description: "AWB 889123041 booked with carrier.",
      },
      {
        status: "Order Placed",
        title: "Order Confirmed & Received",
        location: "ADIKT Storefront",
        timestamp: "2026-08-15 14:31",
        description: "Prepaid Razorpay payment verified via HMAC-SHA256.",
      },
    ],
    createdAt: "2026-08-15T14:45:00Z",
    updatedAt: "2026-08-16T19:40:00Z",
  },
  {
    id: "shp_10491",
    orderId: "order_10491",
    displayId: "ADKT-10491",
    courier: "Delhivery Air Express",
    courierCode: "DELHIVERY_EXP",
    awb: "771239084120",
    trackingUrl: "/track?awb=771239084120",
    status: "Delivered",
    shippingCost: 0,
    isCod: false,
    codAmount: 0,
    packageWeightKg: 0.55,
    dimensions: { lengthCm: 30, breadthCm: 25, heightCm: 5 },
    shippingAddress: {
      name: "Rohan Varma",
      phone: "9811122334",
      email: "rohan.varma@gmail.com",
      addressLine1: "12, Koramangala 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
    },
    pickupAddress: DEFAULT_PICKUP_ADDRESS,
    items: [
      {
        id: "item_3",
        title: "Multi-Pocket Parachute Utility Cargo Pants - Charcoal",
        variant: "32 / Charcoal",
        sku: "ADKT-CARGO-CHR-32",
        quantity: 1,
        price: 2999,
        weightGrams: 550,
      },
    ],
    labelUrl: "/api/shipping/generate-label?awb=771239084120&orderId=ADKT-10491",
    checkpoints: [
      {
        status: "Delivered",
        title: "Package Delivered to Recipient",
        location: "Koramangala Hub, Bengaluru",
        timestamp: "2026-08-16 16:20",
        description: "Delivered. Signed by Rohan Varma (OTP Verified).",
      },
      {
        status: "Out for Delivery",
        title: "Out for Doorstep Delivery",
        location: "Koramangala Hub, Bengaluru",
        timestamp: "2026-08-16 10:15",
        description: "Assigned to courier rider for final mile delivery.",
      },
      {
        status: "In Transit",
        title: "Arrived at Bengaluru Sorting Facility",
        location: "Bengaluru South Hub",
        timestamp: "2026-08-15 22:10",
        description: "Sorted and dispatched to local hub.",
      },
      {
        status: "Shipped",
        title: "Dispatched from Tirupur Hub",
        location: "Tirupur Warehouse",
        timestamp: "2026-08-15 11:30",
        description: "Handed over to carrier.",
      },
      {
        status: "Order Placed",
        title: "Order Confirmed",
        location: "ADIKT Storefront",
        timestamp: "2026-08-15 09:12",
        description: "Payment captured.",
      },
    ],
    createdAt: "2026-08-15T09:30:00Z",
    updatedAt: "2026-08-16T16:20:00Z",
    deliveredAt: "2026-08-16T16:20:00Z",
  },
  {
    id: "shp_10493",
    orderId: "order_10493",
    displayId: "ADKT-10493",
    courier: "DTDC Express",
    courierCode: "DTDC",
    awb: "992384715",
    trackingUrl: "/track?awb=992384715",
    status: "In Transit",
    shippingCost: 0,
    isCod: false,
    codAmount: 0,
    packageWeightKg: 0.85,
    dimensions: { lengthCm: 32, breadthCm: 26, heightCm: 6 },
    shippingAddress: {
      name: "Vikram Malhotra",
      phone: "9820011223",
      email: "vikram.m@example.com",
      addressLine1: "Flat 702, Silver Crest, Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033",
    },
    pickupAddress: DEFAULT_PICKUP_ADDRESS,
    items: [
      {
        id: "item_4",
        title: "500 GSM Double-Layered Zip Hoodie - Phantom Black",
        variant: "XL / Phantom Black",
        sku: "ADKT-HD-ZIP-XL",
        quantity: 1,
        price: 3499,
        weightGrams: 850,
      },
    ],
    labelUrl: "/api/shipping/generate-label?awb=992384715&orderId=ADKT-10493",
    checkpoints: [
      {
        status: "In Transit",
        title: "Arrived at DTDC Zonal Transit Gateway",
        location: "DTDC Central Zonal Hub, Hyderabad",
        timestamp: "2026-08-17 14:10",
        description: "Bag scan completed at DTDC Zonal Express Hub. Scheduled for delivery dispatch.",
      },
      {
        status: "In Transit",
        title: "In Transit via National Air Corridor",
        location: "Bengaluru Air Cargo Hub",
        timestamp: "2026-08-16 23:45",
        description: "Line-haul air freighter departed for Hyderabad Gateway.",
      },
      {
        status: "Shipped",
        title: "Dispatched from DTDC Tirupur Express Center",
        location: "DTDC Tirupur Central Center, Tamil Nadu",
        timestamp: "2026-08-16 11:20",
        description: "Package manifested and dispatched via DTDC Priority Express network.",
      },
      {
        status: "Packed",
        title: "Garments Quality Checked & Sealed",
        location: "Tirupur Packaging Facility",
        timestamp: "2026-08-15 18:00",
        description: "Heavyweight zip hoodie packed in ADIKT matte anti-tamper courier pouch.",
      },
      {
        status: "Order Placed",
        title: "Order Received & Verified",
        location: "ADIKT Storefront",
        timestamp: "2026-08-15 15:10",
        description: "Prepaid online checkout confirmed.",
      },
    ],
    createdAt: "2026-08-15T15:30:00Z",
    updatedAt: "2026-08-17T14:10:00Z",
  },
  {
    id: "shp_10494",
    orderId: "order_10494",
    displayId: "ADKT-10494",
    courier: "DHL Express India",
    courierCode: "DHL",
    awb: "5542109832",
    trackingUrl: "/track?awb=5542109832",
    status: "Out for Delivery",
    shippingCost: 0,
    isCod: false,
    codAmount: 0,
    packageWeightKg: 0.65,
    dimensions: { lengthCm: 30, breadthCm: 25, heightCm: 5 },
    shippingAddress: {
      name: "Pooja Hegde",
      phone: "9871123456",
      email: "pooja.h@example.com",
      addressLine1: "Penthouse 14A, Vasant Vihar",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110057",
    },
    pickupAddress: DEFAULT_PICKUP_ADDRESS,
    items: [
      {
        id: "item_5",
        title: "Acid Wash Distressed Oversized Sweatshirt - Ash Grey",
        variant: "M / Ash Grey",
        sku: "ADKT-SW-ASH-M",
        quantity: 1,
        price: 2799,
        weightGrams: 650,
      },
    ],
    labelUrl: "/api/shipping/generate-label?awb=5542109832&orderId=ADKT-10494",
    checkpoints: [
      {
        status: "Out for Delivery",
        title: "With Delivery Courier for Final Delivery",
        location: "DHL Express Service Point, Okhla, New Delhi",
        timestamp: "2026-08-17 09:30",
        description: "Shipment is out with courier for doorstep delivery today.",
      },
      {
        status: "In Transit",
        title: "Arrived at DHL Express Sorting Facility",
        location: "Indira Gandhi International Airport Gateway (DEL), New Delhi",
        timestamp: "2026-08-16 21:15",
        description: "Processed through sorting facility Delhi.",
      },
      {
        status: "Shipped",
        title: "Departed DHL Aviation Facility",
        location: "Coimbatore Airport Hub (CJB)",
        timestamp: "2026-08-16 14:00",
        description: "Dispatched on DHL Air Express freighter flight.",
      },
      {
        status: "Shipment Created",
        title: "Shipment Information Received",
        location: "DHL Express Logistics Hub",
        timestamp: "2026-08-15 16:30",
        description: "Shipment data transmitted to DHL Express network.",
      },
      {
        status: "Order Placed",
        title: "Order Confirmed & Processed",
        location: "ADIKT Storefront",
        timestamp: "2026-08-15 15:45",
        description: "Prepaid order verified.",
      },
    ],
    createdAt: "2026-08-15T16:00:00Z",
    updatedAt: "2026-08-17T09:30:00Z",
  },
]

export function getCarrierTrackingPortalUrl(courier?: string, awb?: string): string {
  const c = (courier || "").toLowerCase().trim()
  const cleanAwb = (awb || "").trim()
  const upperAwb = cleanAwb.toUpperCase()
  const numericOnly = cleanAwb.replace(/[^0-9]/g, "")

  // 1. Check Courier Name First
  if (c.includes("delhivery") || c.includes("dlhv")) {
    return cleanAwb ? `https://www.delhivery.com/track/package/${encodeURIComponent(cleanAwb)}` : "https://www.delhivery.com/tracking"
  }
  if (c.includes("dtdc")) {
    return "https://www.dtdc.com/track-your-shipment"
  }
  if (c.includes("dhl")) {
    return cleanAwb
      ? `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${encodeURIComponent(cleanAwb)}`
      : "https://www.dhl.com/in-en/home/tracking.html"
  }
  if (c.includes("shadow") || c.includes("sfx")) {
    return cleanAwb ? `https://shadowfax.in/track?orderId=${encodeURIComponent(cleanAwb)}` : "https://shadowfax.in/track"
  }
  if (c.includes("blue") || c.includes("dart") || c.includes("bld")) {
    return "https://www.bluedart.com/tracking"
  }

  // 2. Check AWB Number Pattern if courier is missing or generic
  if (upperAwb.startsWith("7") || upperAwb.startsWith("98") || numericOnly.length >= 11) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(cleanAwb)}`
  }
  if (upperAwb.startsWith("99") || upperAwb.startsWith("D") || upperAwb.includes("DTDC")) {
    return "https://www.dtdc.com/track-your-shipment"
  }
  if (upperAwb.startsWith("55") || (numericOnly.length === 10 && numericOnly.startsWith("5")) || upperAwb.includes("DHL")) {
    return `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${encodeURIComponent(cleanAwb)}`
  }
  if (upperAwb.startsWith("31") || (numericOnly.length === 8 && numericOnly.startsWith("3"))) {
    return `https://shadowfax.in/track?orderId=${encodeURIComponent(cleanAwb)}`
  }
  if (upperAwb.startsWith("8") || numericOnly.length === 9) {
    return "https://www.bluedart.com/tracking"
  }

  return cleanAwb ? `https://www.delhivery.com/track/package/${encodeURIComponent(cleanAwb)}` : "https://www.bluedart.com/tracking"
}

export function detectCarrierFromAwb(awb: string): {
  name: string
  code: string
  officialPortalUrl: string
} {
  const clean = (awb || "").trim()
  const upper = clean.toUpperCase()
  const numeric = clean.replace(/[^0-9]/g, "")

  if (upper.startsWith("99") || upper.startsWith("DTDC") || /^D[0-9]{7,10}$/.test(upper) || upper.includes("DTDC")) {
    return {
      name: "DTDC",
      code: "DTDC",
      officialPortalUrl: getCarrierTrackingPortalUrl("DTDC", clean),
    }
  }

  if (upper.startsWith("55") || upper.startsWith("DHL") || numeric.length === 10 || upper.includes("DHL")) {
    return {
      name: "DHL Express",
      code: "DHL",
      officialPortalUrl: getCarrierTrackingPortalUrl("DHL", clean),
    }
  }

  if (
    upper.startsWith("77") ||
    upper.startsWith("98") ||
    upper.startsWith("DLHV") ||
    upper.includes("DELHIVERY") ||
    numeric.length >= 11
  ) {
    return {
      name: "Delhivery",
      code: "DLHV",
      officialPortalUrl: getCarrierTrackingPortalUrl("Delhivery", clean),
    }
  }

  if (
    numeric.length === 9 ||
    upper.startsWith("8") ||
    upper.startsWith("BLD") ||
    upper.includes("BLUEDART") ||
    upper.includes("BLUE") ||
    upper.includes("DART")
  ) {
    return {
      name: "Bluedart Express",
      code: "BLD",
      officialPortalUrl: getCarrierTrackingPortalUrl("Bluedart Express", clean),
    }
  }

  if (upper.startsWith("31") || upper.startsWith("SFX") || upper.includes("SHADOWFAX") || numeric.length === 8) {
    return {
      name: "Shadowfax Local",
      code: "SFX",
      officialPortalUrl: getCarrierTrackingPortalUrl("Shadowfax", clean),
    }
  }

  return {
    name: "Delhivery",
    code: "DLHV",
    officialPortalUrl: getCarrierTrackingPortalUrl("Delhivery", clean),
  }
}

export interface ShippingConfig {
  freeShippingThreshold: number
  standardDeliveryFee: number
  expressDeliveryFee: number
  defaultCarrier: string
  codFee: number
  updatedAt: string
}

let memoryShippingConfig: ShippingConfig = {
  freeShippingThreshold: 1999,
  standardDeliveryFee: 49,
  expressDeliveryFee: 99,
  defaultCarrier: "Bluedart Air Express",
  codFee: 0,
  updatedAt: new Date().toISOString(),
}

function getShippingConfigFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "shipping-config.json"),
    path.join(process.cwd(), "data", "shipping-config.json"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[0]
}

function loadShippingConfigFromDisk() {
  if (typeof window === "undefined") {
    try {
      const filePath = getShippingConfigFilePath()
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const data = JSON.parse(raw)
        if (data && typeof data.freeShippingThreshold === "number") {
          memoryShippingConfig = {
            ...memoryShippingConfig,
            ...data,
          }
        }
      }
    } catch (err) {
      console.error("[ShippingService] Error reading shipping config from disk:", err)
    }
  }
}

function saveShippingConfigToDisk() {
  if (typeof window === "undefined") {
    try {
      const jsonStr = JSON.stringify(memoryShippingConfig, null, 2)
      const targets = [
        path.join(process.cwd(), "apps", "storefront", "data", "shipping-config.json"),
        path.join(process.cwd(), "data", "shipping-config.json"),
      ]
      for (const target of targets) {
        try {
          const dir = path.dirname(target)
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(target, jsonStr, "utf-8")
        } catch {}
      }
    } catch (err) {
      console.error("[ShippingService] Error saving shipping config to disk:", err)
    }
  }
}

function getShipmentsFilePath(): string {
  const candidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "shipments.json"),
    path.join(process.cwd(), "data", "shipments.json"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[0]
}

function loadShipmentsFromDisk() {
  if (typeof window === "undefined") {
    try {
      const filePath = getShipmentsFilePath()
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const data = JSON.parse(raw)
        if (data?.shipments && Array.isArray(data.shipments)) {
          memoryShipments = data.shipments
        }
      }
    } catch (err) {
      console.error("[ShippingService] Error reading shipments from disk:", err)
    }
  }
}

function saveShipmentsToDisk() {
  if (typeof window === "undefined") {
    try {
      const data = {
        shipments: memoryShipments,
        lastUpdated: new Date().toISOString(),
      }
      const jsonStr = JSON.stringify(data, null, 2)
      const targets = [
        path.join(process.cwd(), "apps", "storefront", "data", "shipments.json"),
        path.join(process.cwd(), "data", "shipments.json"),
      ]
      for (const target of targets) {
        try {
          const dir = path.dirname(target)
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(target, jsonStr, "utf-8")
        } catch {}
      }
    } catch (err) {
      console.error("[ShippingService] Error saving shipments to disk:", err)
    }
  }
}

loadShipmentsFromDisk()
loadShippingConfigFromDisk()

export class ShippingService {
  private static provider: IShippingProvider = new ShiprocketProvider()

  /**
   * Set or swap active shipping provider
   */
  static setProvider(provider: IShippingProvider) {
    this.provider = provider
  }

  /**
   * Get Current Finalized Shipping Configuration
   */
  static getShippingConfig(): ShippingConfig {
    loadShippingConfigFromDisk()
    return { ...memoryShippingConfig }
  }

  /**
   * Update & Finalize Shipping Rules (Threshold & Rates)
   */
  static updateShippingConfig(config: Partial<ShippingConfig>): ShippingConfig {
    loadShippingConfigFromDisk()
    memoryShippingConfig = {
      ...memoryShippingConfig,
      ...config,
      updatedAt: new Date().toISOString(),
    }
    saveShippingConfigToDisk()
    return { ...memoryShippingConfig }
  }

  /**
   * 1. Check Serviceability for a PIN code
   */
  static async checkServiceability(
    pincode: string,
    weightKg: number = 0.5,
    isCod: boolean = false
  ): Promise<ServiceabilityResult> {
    return this.provider.checkServiceability(pincode, weightKg, isCod)
  }

  /**
   * 2. Calculate Shipping Rates
   */
  static async calculateRates(params: {
    pickupPincode?: string
    deliveryPincode: string
    weightKg?: number
    orderValue: number
    isCod?: boolean
  }): Promise<ShippingRate[]> {
    loadShippingConfigFromDisk()
    const isFree = params.orderValue >= memoryShippingConfig.freeShippingThreshold

    return [
      {
        id: "air_express",
        title: "Bluedart & Delhivery Air Express",
        description: "Fastest dispatch via air logistics with real-time SMS & WhatsApp alerts",
        courierName: memoryShippingConfig.defaultCarrier || "Bluedart / Delhivery Air",
        estimatedDays: "2-3 Business Days",
        rate: isFree ? 0 : memoryShippingConfig.expressDeliveryFee,
        freeThreshold: memoryShippingConfig.freeShippingThreshold,
        isFree,
      },
      {
        id: "standard_surface",
        title: "Standard Surface Delivery",
        description: "Reliable road logistics suitable for all standard residential addresses",
        courierName: "Delhivery Surface",
        estimatedDays: "4-5 Business Days",
        rate: isFree ? 0 : memoryShippingConfig.standardDeliveryFee,
        freeThreshold: memoryShippingConfig.freeShippingThreshold,
        isFree,
      },
    ]
  }

  /**
   * 3. Get All Shipments (Admin Ledger)
   */
  static getAllShipments(): Shipment[] {
    loadShipmentsFromDisk()
    return [...memoryShipments]
  }

  /**
   * 4. Get Single Shipment by AWB, Order ID, or Shipment ID
   */
  static getShipmentByReference(ref: string): Shipment | undefined {
    loadShipmentsFromDisk()
    const clean = (ref || "").trim().toLowerCase()
    const alphaNum = clean.replace(/[^a-z0-9]/g, "")
    const numOnly = clean.replace(/[^0-9]/g, "")

    return memoryShipments.find((s) => {
      const sAwb = (s.awb || "").toLowerCase()
      const sAwbAlpha = sAwb.replace(/[^a-z0-9]/g, "")
      const sAwbNum = sAwb.replace(/[^0-9]/g, "")
      const sDisplay = (s.displayId || "").toLowerCase()
      const sDisplayAlpha = sDisplay.replace(/[^a-z0-9]/g, "")
      const sOrder = (s.orderId || "").toLowerCase()
      const sId = (s.id || "").toLowerCase()

      return (
        sAwb === clean ||
        sAwbAlpha === alphaNum ||
        (numOnly.length > 5 && sAwbNum === numOnly) ||
        sDisplay === clean ||
        sDisplayAlpha === alphaNum ||
        sOrder === clean ||
        sId === clean
      )
    })
  }

  /**
   * 5. Create & Book a New Shipment (Dispatch Order)
   */
  static async createShipment(payload: CreateShipmentPayload): Promise<Shipment> {
    loadShipmentsFromDisk()

    // 1. Check if shipment already exists for this order
    const existing = memoryShipments.find(
      (s) => s.displayId === payload.displayId || s.orderId === payload.orderId
    )
    if (existing) {
      return existing
    }

    // 2. Call Shipping Provider to book parcel
    const providerResult = await this.provider.createShipment(payload)

    const now = new Date().toISOString()
    const nowReadable = now.replace("T", " ").slice(0, 16)

    const initialCheckpoints: TrackingCheckpoint[] = [
      {
        status: "Shipment Created",
        title: "Air Waybill (AWB) Assigned & Courier Booked",
        location: "Logistics Automation Engine",
        timestamp: nowReadable,
        description: `AWB ${providerResult.awb} allocated with ${providerResult.courier}. Packaging slip queued.`,
      },
      {
        status: "Order Placed",
        title: "Order Placed & Inventory Reserved",
        location: "ADIKT Storefront",
        timestamp: nowReadable,
        description: "Order confirmed.",
      },
    ]

    const newShipment: Shipment = {
      id: providerResult.shipmentId,
      orderId: payload.orderId,
      displayId: payload.displayId,
      courier: providerResult.courier,
      courierCode: providerResult.courier.toLowerCase().includes("bluedart") ? "BLUEDART_AIR" : "DELHIVERY_EXP",
      awb: providerResult.awb,
      trackingUrl: providerResult.trackingUrl,
      status: "Shipment Created",
      shippingCost: 0,
      isCod: Boolean(payload.isCod),
      codAmount: payload.codAmount || 0,
      packageWeightKg: payload.packageWeightKg || 0.5,
      dimensions: payload.dimensions || { lengthCm: 30, breadthCm: 25, heightCm: 5 },
      shippingAddress: payload.shippingAddress,
      pickupAddress: DEFAULT_PICKUP_ADDRESS,
      items: payload.items,
      labelUrl: providerResult.labelUrl,
      checkpoints: initialCheckpoints,
      createdAt: now,
      updatedAt: now,
    }

    memoryShipments.unshift(newShipment)

    // 3. Update Order in AdminDataService
    const orders = AdminDataService.getOrders()
    const order = orders.find((o) => o.displayId === payload.displayId || o.id === payload.orderId)
    if (order) {
      order.courier = providerResult.courier
      order.awb = providerResult.awb
      order.status = "Shipped"
      order.fulfillmentStatus = "Fulfilled"
      order.timeline.unshift({
        id: `tl_${Date.now()}`,
        time: nowReadable,
        title: `Shipment Created & Dispatched (${providerResult.courier})`,
        description: `AWB: ${providerResult.awb}. Parcel queued for courier pickup.`,
        user: "Logistics Manager",
      })
    }

    saveShipmentsToDisk()
    return newShipment
  }

  /**
   * 6. Live Tracking Endpoint (Customer & Public Tracking)
   */
  static async trackShipment(reference: string): Promise<{
    shipment: Shipment | null
    checkpoints: TrackingCheckpoint[]
    status: ShipmentStatus
    courier: string
    courierCode: string
    officialPortalUrl: string
    awb: string
    estimatedDelivery: string
  }> {
    loadShipmentsFromDisk()
    const shipment = this.getShipmentByReference(reference)
    const carrierInfo = detectCarrierFromAwb(reference)

    // 1. Attempt Live Carrier Web API query for real-time status & scan logs
    try {
      const { LiveCarrierClient } = await import("./live-carrier-client")
      const liveCarrierData = await LiveCarrierClient.fetchTracking(reference)
      if (liveCarrierData) {
        if (shipment) {
          shipment.status = liveCarrierData.status
          shipment.checkpoints = liveCarrierData.checkpoints
          shipment.updatedAt = new Date().toISOString()
          saveShipmentsToDisk()
        }

        return {
          shipment: shipment || null,
          checkpoints: liveCarrierData.checkpoints,
          status: liveCarrierData.status,
          courier: liveCarrierData.courier || shipment?.courier || carrierInfo.name,
          courierCode: liveCarrierData.courierCode || shipment?.courierCode || carrierInfo.code,
          officialPortalUrl: liveCarrierData.officialPortalUrl || carrierInfo.officialPortalUrl,
          awb: liveCarrierData.awb || reference,
          estimatedDelivery: liveCarrierData.estimatedDelivery,
        }
      }
    } catch (liveQueryErr) {
      console.warn("[ShippingService] Live carrier query fallback:", liveQueryErr)
    }

    if (shipment) {
      const shipCarrier = detectCarrierFromAwb(shipment.awb || shipment.courier)
      return {
        shipment,
        checkpoints: shipment.checkpoints,
        status: shipment.status,
        courier: shipment.courier || shipCarrier.name,
        courierCode: shipment.courierCode || shipCarrier.code,
        officialPortalUrl: shipCarrier.officialPortalUrl,
        awb: shipment.awb,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      }
    }

    // If query by external AWB not yet recorded in local memory, query provider directly
    const trackingData = await this.provider.trackShipment(reference)
    return {
      shipment: null,
      checkpoints: trackingData.checkpoints,
      status: trackingData.status,
      courier: carrierInfo.name,
      courierCode: carrierInfo.code,
      officialPortalUrl: carrierInfo.officialPortalUrl,
      awb: reference,
      estimatedDelivery: trackingData.estimatedDelivery,
    }
  }

  /**
   * 7. Transition Shipment Status (e.g. from Carrier Webhook or Admin Action)
   */
  static updateShipmentStatus(
    awb: string,
    status: ShipmentStatus,
    location?: string,
    description?: string
  ): Shipment | undefined {
    loadShipmentsFromDisk()
    const shipment = this.getShipmentByReference(awb)
    if (!shipment) return undefined

    const nowReadable = new Date().toISOString().replace("T", " ").slice(0, 16)
    shipment.status = status
    shipment.updatedAt = new Date().toISOString()
    if (status === "Delivered") {
      shipment.deliveredAt = new Date().toISOString()
    }

    shipment.checkpoints.unshift({
      status,
      title: getStatusTitle(status),
      location: location || "Regional Carrier Transit Hub",
      timestamp: nowReadable,
      description: description || `Shipment status transitioned to ${status}.`,
    })

    // Sync with Admin Orders
    const orders = AdminDataService.getOrders()
    const order = orders.find((o) => o.awb === shipment.awb || o.displayId === shipment.displayId)
    if (order) {
      if (status === "Delivered") {
        order.status = "Delivered"
        if (order.paymentMethod.includes("COD")) {
          order.paymentStatus = "Captured"
        }
      } else if (status === "Cancelled") {
        order.status = "Cancelled"
      }
    }

    saveShipmentsToDisk()
    return shipment
  }

  /**
   * Synchronize an Order status update from Admin or Checkout into a live Shipment record
   */
  static syncOrderUpdate(
    order: any,
    status?: string,
    awb?: string,
    location?: string,
    description?: string
  ): Shipment {
    loadShipmentsFromDisk()
    const ref = order.displayId || order.id
    let shipment = this.getShipmentByReference(ref) || (order.awb ? this.getShipmentByReference(order.awb) : undefined)

    const nowReadable = new Date().toISOString().replace("T", " ").slice(0, 16)
    const finalAwb = awb || order.awb || shipment?.awb || `88${Math.floor(1000000 + Math.random() * 9000000)}`
    const finalCourier = order.courier || shipment?.courier || ""
    const finalStatus = (status || order.status || shipment?.status || "Order Placed") as ShipmentStatus

    if (shipment) {
      shipment.status = finalStatus
      shipment.awb = finalAwb
      shipment.courier = finalCourier
      shipment.updatedAt = new Date().toISOString()
      if (finalStatus === "Delivered") {
        shipment.deliveredAt = new Date().toISOString()
      }

      const newTitle = getStatusTitle(finalStatus)
      const existingLatest = shipment.checkpoints[0]
      if (!existingLatest || existingLatest.status !== finalStatus) {
        shipment.checkpoints.unshift({
          status: finalStatus,
          title: newTitle,
          location: location || "Logistics Sort Hub, Mumbai",
          timestamp: nowReadable,
          description: description || `Parcel status updated to ${finalStatus}.`,
        })
      }
    } else {
      // Create new shipment
      const items = (order.items || []).map((it: any, idx: number) => ({
        id: it.id || `item_${idx}`,
        title: it.title || "ADIKT Heavyweight Garment",
        variant: it.variant || "Standard",
        sku: it.sku || `ADKT-GARMENT-${idx}`,
        quantity: it.quantity || 1,
        price: it.price || 1999,
        weightGrams: it.weightGrams || 350,
      }))

      shipment = {
        id: `shp_${Date.now()}`,
        orderId: order.id,
        displayId: order.displayId || order.id,
        courier: finalCourier,
        courierCode: finalCourier.toLowerCase().includes("delhivery") ? "DELHIVERY_EXP" : "BLUEDART_AIR",
        awb: finalAwb,
        trackingUrl: `/track?awb=${finalAwb}`,
        status: finalStatus,
        shippingCost: order.shippingTotal || 0,
        isCod: Boolean(order.paymentMethod?.toLowerCase().includes("cod")),
        codAmount: Boolean(order.paymentMethod?.toLowerCase().includes("cod")) ? (order.total || 0) : 0,
        packageWeightKg: 0.7,
        dimensions: { lengthCm: 30, breadthCm: 25, heightCm: 5 },
        shippingAddress: order.shippingAddress || {
          name: order.customer?.name || "Valued Customer",
          phone: order.customer?.phone || "9876543210",
          addressLine1: "Standard Delivery Address",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        pickupAddress: DEFAULT_PICKUP_ADDRESS,
        items,
        labelUrl: `/api/shipping/generate-label?awb=${finalAwb}&orderId=${order.displayId || order.id}`,
        checkpoints: [
          {
            status: finalStatus,
            title: getStatusTitle(finalStatus),
            location: location || "ADIKT Fulfillment Hub, Tirupur",
            timestamp: nowReadable,
            description: description || `Order processed and status set to ${finalStatus}.`,
          },
          {
            status: "Order Placed",
            title: "Order Placed & Confirmed",
            location: "ADIKT Storefront",
            timestamp: nowReadable,
            description: "Payment verified and order confirmed.",
          },
        ],
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      memoryShipments.unshift(shipment)
    }

    saveShipmentsToDisk()
    return shipment
  }

  /**
   * 8. Cancel Shipment
   */
  static async cancelShipment(awb: string): Promise<{ success: boolean; message: string }> {
    loadShipmentsFromDisk()
    const shipment = this.getShipmentByReference(awb)
    if (!shipment) throw new Error(`Shipment with reference ${awb} not found`)

    if (shipment.status === "Delivered") {
      throw new Error(`Cannot cancel a shipment that has already been delivered`)
    }

    await this.provider.cancelShipment(shipment.id, shipment.awb)
    this.updateShipmentStatus(awb, "Cancelled", "HQ Logistics Desk", "Shipment cancelled prior to line haul dispatch.")

    return {
      success: true,
      message: `Shipment ${shipment.awb} has been cancelled successfully.`,
    }
  }

  /**
   * 9. Create Reverse Logistics (Return Shipment Pickup)
   */
  static async createReturnShipment(payload: ReturnShipmentPayload): Promise<{
    returnShipment: Shipment
    returnAwb: string
  }> {
    loadShipmentsFromDisk()
    const original = this.getShipmentByReference(payload.originalShipmentId)
    if (!original) throw new Error(`Original shipment ${payload.originalShipmentId} not found`)

    const returnResult = await this.provider.createReturnShipment(payload)
    const now = new Date().toISOString()
    const nowReadable = now.replace("T", " ").slice(0, 16)

    const returnShipment: Shipment = {
      id: returnResult.returnShipmentId,
      orderId: original.orderId,
      displayId: `RET-${original.displayId}`,
      courier: returnResult.courier,
      courierCode: "DELHIVERY_REVERSE",
      awb: returnResult.returnAwb,
      trackingUrl: `/track?awb=${returnResult.returnAwb}`,
      status: "Return Initiated",
      shippingCost: 0,
      isCod: false,
      codAmount: 0,
      packageWeightKg: original.packageWeightKg,
      dimensions: original.dimensions,
      shippingAddress: DEFAULT_PICKUP_ADDRESS, // Delivering back to warehouse
      pickupAddress: payload.pickupAddress || original.shippingAddress, // Picking up from customer
      items: payload.items && payload.items.length > 0 ? payload.items : original.items,
      isReturn: true,
      originalShipmentId: original.id,
      returnReason: payload.reason,
      checkpoints: [
        {
          status: "Return Initiated",
          title: "Reverse Pickup Booked with Carrier",
          location: "Customer Residence Hub",
          timestamp: nowReadable,
          description: `Reverse AWB ${returnResult.returnAwb} scheduled for pickup on ${returnResult.pickupDate}. Reason: ${payload.reason}`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    }

    memoryShipments.unshift(returnShipment)

    // Sync order timeline
    const orders = AdminDataService.getOrders()
    const order = orders.find((o) => o.displayId === original.displayId || o.id === original.orderId)
    if (order) {
      order.fulfillmentStatus = "Returned"
      order.timeline.unshift({
        id: `tl_${Date.now()}`,
        time: nowReadable,
        title: "Reverse Logistics Return Initiated",
        description: `Return pickup booked with ${returnResult.courier}. Reverse AWB: ${returnResult.returnAwb}`,
        user: "Returns Coordinator",
      })
    }

    saveShipmentsToDisk()
    return { returnShipment, returnAwb: returnResult.returnAwb }
  }
}

function getStatusTitle(status: ShipmentStatus): string {
  switch (status) {
    case "Order Placed":
      return "Order Confirmed & Received"
    case "Shipment Created":
      return "AWB Assigned & Shipment Created"
    case "Packed":
      return "Quality Checked & Packed in Sealed Mailer"
    case "Shipped":
      return "Dispatched from Hub to Carrier"
    case "In Transit":
      return "In Transit to Destination Sort Center"
    case "Out for Delivery":
      return "Out for Doorstep Delivery with Courier Rider"
    case "Delivered":
      return "Package Delivered Successfully"
    case "Cancelled":
      return "Shipment Cancelled"
    case "Return Initiated":
      return "Reverse Return Pickup Scheduled"
    case "Return Picked Up":
      return "Return Package Collected from Customer"
    case "Return Delivered":
      return "Return Delivered to Quality Inspection Hub"
    default:
      return `Shipment Status: ${status}`
  }
}
