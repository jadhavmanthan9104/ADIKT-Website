# Database Architecture & Data Modeling Documentation

## 1. Core Principles & Technology

- **Database Engine**: **PostgreSQL 16+**
- **Single Source of Truth**: PostgreSQL houses all commerce entities, customer records, inventory items, orders, transactions, fulfillment states, and custom fashion specifications.
- **Strict Anti-Pattern Rule**: No secondary databases (e.g. MongoDB, separate MySQL, NoSQL document stores) are permitted. All relational and domain data lives in PostgreSQL.
- **ORM & Data Framework**: **Medusa v2 DML (`@medusajs/framework/utils`)** and MikroORM internal runtime engine.

---

## 2. Core Medusa v2 Data Entities Reused

Medusa v2 provides an enterprise commerce domain model out of the box:

| Module | Primary Entities | Key Fields / Responsibilities |
|---|---|---|
| **Product Module** | `product`, `product_variant`, `product_option`, `product_option_value`, `product_category`, `product_collection`, `product_tag` | Handles product hierarchy, handle/slug, titles, descriptions, dimensions, weight, options (Size, Color), status (`draft`, `published`). |
| **Pricing Module** | `price_set`, `price`, `price_rule` | Multi-currency pricing (INR base), compare-at / original prices, region-specific price rules. |
| **Inventory Module** | `inventory_item`, `inventory_level`, `reservation_item` | Variant SKU tracking, multi-location stock, reserved stock during checkout, low-stock threshold alerting. |
| **Cart Module** | `cart`, `line_item`, `shipping_method`, `address` | Transient shopping cart, item tax calculations, applied promotion codes, selected shipping option. |
| **Order Module** | `order`, `order_item`, `order_change`, `order_transaction`, `fulfillment` | Immutable historical order records, payments captured, refund transactions, fulfillment statuses. |
| **Customer Module** | `customer`, `customer_address`, `customer_group` | Customer profiles, phone numbers, verified emails, shipping/billing address book, customer segmentation. |
| **Promotion Module**| `promotion`, `campaign`, `promotion_rule`, `application_method` | Percentage discounts, flat INR discounts, buy-X-get-Y, minimum cart values, usage caps. |
| **Auth Module** | `auth_identity`, `user` | Admin users, RBAC permissions, encrypted password hashes, session tokens. |

---

## 3. Custom Fashion Domain Models (DML)

Custom domain models extend Medusa v2 cleanly without monkey-patching core tables.

### 3.1 `ClothingSpec` Model (`backend/src/modules/clothing-spec/models/clothing-spec.ts`)
Stores deep technical garment specifications required for luxury and street fashion:

```typescript
import { model } from "@medusajs/framework/utils"

export const ClothingSpec = model.define("clothing_spec", {
  id: model.id().primaryKey(),
  
  // Fabric & Composition
  fabric: model.text(),                       // e.g. "100% Combed Compact Cotton"
  gsm: model.number(),                        // e.g. 280 (Heavyweight)
  weave_type: model.text().nullable(),        // e.g. "French Terry", "Single Jersey", "Waffle Knit"
  material_details: model.text(),             // Detailed composition paragraph
  
  // Fit & Silhouette
  fit: model.text(),                          // e.g. "Oversized Boxy Fit", "Relaxed Fit", "Tailored"
  print_technique: model.text().nullable(),   // e.g. "Screen Print + High-density Puff Print"
  wash_care_instructions: model.array(),      // ["Cold wash inside out", "Do not tumble dry", "Iron on reverse"]
  wash_care_symbols: model.array().nullable(),// ["wash-30", "no-bleach", "iron-low"]
  
  // Model & Sizing Metadata
  model_info: model.json().nullable(),        // { height: "6'1\"", chest: "39\"", wearing_size: "L" }
  
  // Size Chart Matrix (JSON Table)
  // Structure:
  // {
  //   unit: "inches" | "cm",
  //   columns: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
  //   rows: [
  //     { size: "S", chest: "42", length: "28", shoulder: "20", sleeve: "8.5" },
  //     { size: "M", chest: "44", length: "29", shoulder: "21", sleeve: "9.0" },
  //     { size: "L", chest: "46", length: "30", shoulder: "22", sleeve: "9.5" },
  //     { size: "XL", chest: "48", length: "31", shoulder: "23", sleeve: "10.0" }
  //   ]
  // }
  size_chart: model.json(),
  
  // SEO & Catalog Enhancements
  measurements_guide_image_url: model.text().nullable(),
})
```

### 3.2 `ProductReview` Model (`backend/src/modules/reviews/models/review.ts`)
```typescript
import { model } from "@medusajs/framework/utils"

export const ProductReview = model.define("product_review", {
  id: model.id().primaryKey(),
  customer_name: model.text(),
  customer_email: model.text(),
  rating: model.number(),                     // 1 to 5 stars
  title: model.text(),
  content: model.text(),
  fit_feedback: model.enum(["runs_small", "true_to_size", "runs_large"]).default("true_to_size"),
  quality_rating: model.number().default(5),
  images: model.array().nullable(),           // Customer uploaded fit pics
  verified_purchase: model.boolean().default(false),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  admin_reply: model.text().nullable(),
})
```

### 3.3 `WishlistItem` Model (`backend/src/modules/wishlist/models/wishlist.ts`)
```typescript
import { model } from "@medusajs/framework/utils"

export const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  customer_id: model.text().index(),
  product_id: model.text().index(),
  variant_id: model.text().nullable(),
  created_at: model.dateTime(),
})
```

### 3.4 `ContentBanner` Model (`backend/src/modules/content-cms/models/content-banner.ts`)
```typescript
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
```

---

## 4. Medusa v2 Module Links (Remote Links)

Medusa v2 uses module links to create type-safe relational connections across isolated modules:

### 4.1 Product <-> ClothingSpec Link (`backend/src/links/product-clothing-spec.ts`)
```typescript
import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ClothingSpecModule from "../modules/clothing-spec"

export default defineLink(
  ProductModule.linkable.product,
  ClothingSpecModule.linkable.clothingSpec
)
```

### 4.2 Product <-> Review Link (`backend/src/links/product-review.ts`)
```typescript
import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ReviewModule from "../modules/reviews"

export default defineLink(
  ProductModule.linkable.product,
  {
    linkable: ReviewModule.linkable.productReview,
    isList: true, // One product has many reviews
  }
)
```

---

## 5. Indexing & Query Optimization Strategy

To guarantee sub-50ms catalog responses during high-traffic drops:

1. **Slugs & Handles**: Unique B-tree index on `product.handle` and `product_category.handle`.
2. **Catalog Filtering Composite Indexes**:
   - Composite index on `(status, deleted_at, created_at)` for public listing queries.
   - Index on `product_category_id` and `collection_id` on relationship tables.
3. **Inventory & SKU**: Unique index on `inventory_item.sku`.
4. **Order & Customer Queries**:
   - Index on `order.customer_id` and `order.display_id`.
   - Index on `order.created_at` for operational dashboard time-series aggregations.
5. **Full-Text Search**: PostgreSQL `tsvector` column and GIN index for search on title, description, tags, fabric, and fit attributes.

---

## 6. Migrations & Schema Lifecycle

1. **Auto-Generated Migrations**: Medusa v2 CLI manages schema lifecycle via:
   ```bash
   npx medusa db:generate [module_name]
   npx medusa db:migrate
   ```
2. **Strict Pre-Deployment Checks**: Migrations run during container startup or deployment hooks before application traffic is routed.
3. **Zero Downtime Migrations**: Additive column migrations with safe default values prevent breaking running backend instances.

---

## 7. Production High-Availability & Backups

- **Connection Pooling**: PgBouncer or native connection pooling (`DATABASE_POOL_MAX=20`, `DATABASE_POOL_MIN=2`) to prevent connection exhaustion during drops.
- **Automated Daily Backups**: Automated `pg_dump` with WAL archiving (Point-In-Time Recovery - PITR) stored encrypted on S3.
- **Read Replicas**: For enterprise scale, Next.js catalog queries can target a read replica, leaving the primary PostgreSQL instance dedicated to transactional checkout and order workflows.
