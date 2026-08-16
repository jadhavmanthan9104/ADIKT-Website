/**
 * Merchandising CMS & Banner Types
 */

export type BannerSlotType =
  | "hero_slider"
  | "promo_ticker"
  | "category_feature"
  | "announcement_bar"

export interface ContentBannerDTO {
  id: string
  slot: BannerSlotType
  title: string
  subtitle?: string | null
  image_desktop_url: string
  image_mobile_url?: string | null
  cta_text?: string | null
  cta_link?: string | null
  badge_text?: string | null
  is_active: boolean
  sort_order: number
  starts_at?: string | null
  ends_at?: string | null
}
