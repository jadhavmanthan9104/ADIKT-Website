/**
 * Indian Logistics & Shipping Architecture Types
 * Defines interfaces for Courier Providers, Shipments, Rates, Tracking, and Reverse Logistics.
 */

export type ShipmentStatus =
  | "Order Placed"
  | "Shipment Created"
  | "Packed"
  | "Shipped"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "RTO Initiated"
  | "RTO Delivered"
  | "Return Initiated"
  | "Return Picked Up"
  | "Return Delivered"

export interface TrackingCheckpoint {
  status: ShipmentStatus
  title: string
  location: string
  timestamp: string
  description: string
  activityCode?: string
}

export interface CourierPartner {
  id: string
  name: "Delhivery Surface" | "Delhivery Air Express" | "Bluedart Air" | "DTDC Express" | "DHL Express" | "Shadowfax Local" | "Ecom Express" | string
  code: string
  awbPrefix: string
  estimatedDays: string
  rate: number
  codAvailable: boolean
  rating: number
}

export interface ServiceabilityResult {
  pincode: string
  city: string
  state: string
  serviceable: boolean
  availableCouriers: CourierPartner[]
  estimatedDeliveryDate: string
  codAvailable: boolean
  prepaidAvailable: boolean
}

export interface ShippingRate {
  id: string
  title: string
  description: string
  courierName: string
  estimatedDays: string
  rate: number
  freeThreshold?: number
  isFree: boolean
}

export interface ShippingAddress {
  name: string
  phone: string
  email?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country?: string
}

export interface ShipmentItem {
  id: string
  title: string
  variant: string
  sku: string
  quantity: number
  price: number
  weightGrams: number
  thumbnail?: string
}

export interface Shipment {
  id: string
  orderId: string
  displayId: string
  courier: string
  courierCode: string
  awb: string
  trackingUrl: string
  status: ShipmentStatus
  shippingCost: number
  isCod: boolean
  codAmount: number
  packageWeightKg: number
  dimensions: {
    lengthCm: number
    breadthCm: number
    heightCm: number
  }
  shippingAddress: ShippingAddress
  pickupAddress: ShippingAddress
  items: ShipmentItem[]
  labelUrl?: string
  checkpoints: TrackingCheckpoint[]
  isReturn?: boolean
  originalShipmentId?: string
  returnReason?: string
  createdAt: string
  updatedAt: string
  deliveredAt?: string
}

export interface CreateShipmentPayload {
  orderId: string
  displayId: string
  courier?: string
  shippingAddress: ShippingAddress
  items: ShipmentItem[]
  isCod?: boolean
  codAmount?: number
  packageWeightKg?: number
  dimensions?: {
    lengthCm: number
    breadthCm: number
    heightCm: number
  }
}

export interface ReturnShipmentPayload {
  originalShipmentId: string
  orderId: string
  reason: string
  pickupAddress: ShippingAddress
  items: ShipmentItem[]
}

/**
 * IShippingProvider Interface
 * Modular contract for Indian Logistics Providers (Shiprocket, Delhivery Direct, Bluedart, etc.)
 */
export interface IShippingProvider {
  name: string
  checkServiceability(pincode: string, weightKg?: number, isCod?: boolean): Promise<ServiceabilityResult>
  calculateRates(params: {
    pickupPincode: string
    deliveryPincode: string
    weightKg: number
    orderValue: number
    isCod?: boolean
  }): Promise<ShippingRate[]>
  createShipment(payload: CreateShipmentPayload): Promise<{
    shipmentId: string
    awb: string
    courier: string
    trackingUrl: string
    labelUrl: string
  }>
  generateLabel(shipmentId: string, awb: string): Promise<{ labelUrl: string; barcode: string }>
  trackShipment(awb: string): Promise<{
    status: ShipmentStatus
    currentLocation: string
    estimatedDelivery: string
    checkpoints: TrackingCheckpoint[]
  }>
  cancelShipment(shipmentId: string, awb: string): Promise<{ success: boolean; message: string }>
  createReturnShipment(payload: ReturnShipmentPayload): Promise<{
    returnShipmentId: string
    returnAwb: string
    courier: string
    pickupDate: string
  }>
}
