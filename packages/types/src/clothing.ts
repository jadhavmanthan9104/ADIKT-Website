/**
 * Garment & Clothing Technical Specification Types
 */

export type GarmentFitType =
  | "oversized"
  | "boxy"
  | "relaxed"
  | "regular"
  | "slim"
  | "tailored"

export type GarmentWeaveType =
  | "Single Jersey"
  | "French Terry"
  | "Heavy Fleece"
  | "Waffle Knit"
  | "Poplin"
  | "Twill"
  | "Denim"
  | "Ripstop"

export interface SizeChartMeasurementRow {
  size: string
  chest: string | number
  length: string | number
  shoulder: string | number
  sleeve?: string | number
  waist?: string | number
  inseam?: string | number
  [customMeasurement: string]: string | number | undefined
}

export interface SizeChartMatrix {
  unit: "inches" | "cm"
  columns: string[]
  rows: SizeChartMeasurementRow[]
}

export interface ModelSpecification {
  height: string // e.g. "6'1\"" or "185 cm"
  chest?: string // e.g. "39\""
  waist?: string
  wearing_size: string // e.g. "L"
}

export interface ClothingSpecDTO {
  id?: string
  fabric: string // e.g. "100% Combed Compact Cotton"
  gsm: number // e.g. 280
  weave_type?: GarmentWeaveType | string | null
  material_details: string
  fit: GarmentFitType | string
  print_technique?: string | null
  wash_care_instructions: string[]
  wash_care_symbols?: string[] | null
  model_info?: ModelSpecification | null
  size_chart: SizeChartMatrix
  measurements_guide_image_url?: string | null
}

export interface ProductReviewDTO {
  id: string
  product_id: string
  customer_name: string
  customer_email?: string
  rating: number // 1 to 5
  title: string
  content: string
  fit_feedback: "runs_small" | "true_to_size" | "runs_large"
  quality_rating: number
  images?: string[] | null
  verified_purchase: boolean
  status: "pending" | "approved" | "rejected"
  admin_reply?: string | null
  created_at: string
}
