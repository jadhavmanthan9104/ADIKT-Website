# Shopify to Medusa v2 Migration Strategy & Playbook

## 1. Executive Summary & Goals

This guide details the complete migration path to transition **ADIKT Clothing Co.** from Shopify to our self-hosted **Medusa v2 + Next.js** architecture with:
- **Zero data loss**: Full migration of products, collections, inventory counts, customer profiles, past orders, and discount rules.
- **Zero SEO traffic loss**: 1-to-1 canonical URL mapping and comprehensive 301 permanent redirects.
- **Zero downtime cutover**: Scheduled delta-sync migration during low-traffic window with instant DNS switchover.

---

## 2. Entity Mapping Matrix

| Shopify Entity | Medusa v2 Target Entity / Module | Transformation & Notes |
|---|---|---|
| Product (Title, Handle, Description) | `product` (Core Module) | Exact match on `handle` to preserve URL structure. |
| Product Images & Alt Text | `image` (Linked to `product`) | Downloaded and re-uploaded to S3/Cloudinary CDN. |
| Variants (Option 1: Size, Option 2: Color) | `product_variant` + `product_option` | Mapped to Medusa Options (`Size`, `Color`) with SKU. |
| Price & Compare-At Price | `price` (Pricing Module) | Converted into Medusa INR Price Set (`calculated_price` & `original_price`). |
| Inventory Quantity | `inventory_level` (Inventory Module) | Seeded into default Medusa warehouse location. |
| Product Tags & Metafields (`fabric`, `gsm`, `fit`, `size_chart`) | `clothing_spec` (Custom DML Module) | Extracted from Shopify metafields or tag prefixes (e.g. `gsm:280`) into structured DML fields. |
| Collections (Smart & Custom) | `product_collection` & `product_category` | Mapped to hierarchical categories and marketing collections. |
| Customers (Name, Email, Phone, Addresses) | `customer` & `customer_address` | Customer profile and address book preserved. |
| Orders History | `order` (Historical import) | Past Shopify orders imported with `display_id` and reference notes for customer viewing. |
| Discount Codes | `promotion` (Promotion Module) | Percentage and flat value coupons recreated with matching codes and rules. |

---

## 3. Customer Password Handling & Activation

> [!IMPORTANT]
> Shopify does not export password hashes (for security reasons).
>
> **Customer Migration Strategy**:
> 1. Import all customer emails, phone numbers, total spend, and saved addresses into Medusa v2.
> 2. On cutover day, trigger an automated welcome email sequence via Resend:
>    - *"We've upgraded the ADIKT experience! Set your new password to access your saved addresses and order history."*
> 3. Provide one-click password activation links using tokenized reset workflow.

---

## 4. 301 Redirect Strategy & SEO Preservation

To ensure zero loss of Google search rankings:

```typescript
// storefront/next.config.ts - Redirects table
module.exports = {
  async redirects() {
    return [
      // Direct 1-to-1 handle preservation
      {
        source: "/products/:handle",
        destination: "/products/:handle",
        permanent: true,
      },
      // Collections routing preservation
      {
        source: "/collections/:handle",
        destination: "/collections/:handle",
        permanent: true,
      },
      // Shopify default policy pages -> Next.js policy pages
      {
        source: "/policies/shipping-policy",
        destination: "/shipping-policy",
        permanent: true,
      },
      {
        source: "/policies/refund-policy",
        destination: "/return-refund-policy",
        permanent: true,
      },
      {
        source: "/policies/privacy-policy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/policies/terms-of-service",
        destination: "/terms-and-conditions",
        permanent: true,
      },
    ]
  },
}
```

---

## 5. Automated ETL Migration Script Blueprint

A standalone Node.js migration script (`scripts/migrate-shopify.ts`) handles API extraction and Medusa v2 ingestion:

```typescript
// scripts/migrate-shopify.ts (Blueprint)
import { Medusa } from "@medusajs/js-sdk"
import fetch from "node-fetch"

async function runShopifyMigration() {
  console.log("🚚 Starting Shopify Data Extraction...")

  // 1. Fetch products from Shopify Admin GraphQL API
  // 2. Transform Product -> Medusa v2 DML format
  // 3. Extract custom tags (gsm:280, fit:oversized, fabric:french_terry)
  // 4. Create Product in Medusa v2 via Admin API
  // 5. Create linked ClothingSpec record
  // 6. Ingest Inventory levels
  // 7. Ingest Customers and Addresses
  
  console.log("✅ Shopify Migration Complete!")
}
```

---

## 6. Cutover Day Master Checklist

### T - 7 Days (Preparation & Testing)
- [ ] Run full dry-run migration script in staging environment.
- [ ] Verify 100% of product variants, images, prices, and sizes match Shopify.
- [ ] Run Playwright automated checkout flow against test database.
- [ ] Verify Razorpay production webhooks and API credentials.
- [ ] Verify Shiprocket production logistics credentials.

### T - 2 Hours (Cutover Execution)
- [ ] Enable maintenance banner / password lock on Shopify store.
- [ ] Run final delta-sync script (extract orders and customer updates from last 48 hours).
- [ ] Update DNS records (Point `adiktclothing.com` A/CNAME records to the new VPS IP / Caddy proxy).
- [ ] Wait for SSL certificate provisioning via Let's Encrypt.
- [ ] Perform real live test order using Razorpay UPI / Card on production storefront.
- [ ] Generate test Shiprocket AWB and cancel before dispatch.

### T + 1 Hour (Post-Launch Monitoring)
- [ ] Monitor real-time logs via `docker-compose logs -f`.
- [ ] Check Google Analytics real-time visitor flow.
- [ ] Monitor Razorpay dashboard for successful webhook acknowledgements.
- [ ] Cancel Shopify recurring app subscriptions and downgrade Shopify plan.
