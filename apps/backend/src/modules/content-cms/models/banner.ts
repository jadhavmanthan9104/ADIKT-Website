import { model } from "@medusajs/framework/utils"

export const ContentBanner = model.define("content_banner", {
  id: model.id().primaryKey(),
  slot: model.enum(["hero_slider", "promo_ticker", "category_feature", "announcement_bar"]),
  title: model.text(),
  subtitle: model.text().nullable(),
  image_desktop_url: model.text(),
  image_mobile_url: model.text().nullable(),
  cta_text: model.text().nullable(),
  cta_link: model.text().nullable(),
  badge_text: model.text().nullable(),
  is_active: model.boolean().default(true),
  sort_order: model.number().default(0),
  starts_at: model.dateTime().nullable(),
  ends_at: model.dateTime().nullable(),
})
