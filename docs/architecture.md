# System Architecture Documentation

## 1. Overview & Business Context

This document details the architectural design of the self-hosted direct-to-consumer (D2C) fashion ecommerce platform for **ADIKT Clothing Co.** Built to replace Shopify, this platform achieves lower operating costs, complete data sovereignty, zero platform vendor lock-in, custom garment metadata support, and seamless integration with Indian payment and logistics ecosystems.

---

## 2. High-Level Architecture & Principles

The system adopts a **decoupled, headless commerce architecture**:

```
                       ┌──────────────────────────────────────────────────────────┐
                       │                     CLIENT TIER                          │
                       │  ┌───────────────────────┐   ┌────────────────────────┐  │
                       │  │ Next.js 15 Storefront │   │ Medusa Admin Dashboard │  │
                       │  │ (Mobile & Desktop Web)│   │ (Merchandising / Ops)  │  │
                       └──┴───────────┬───────────┴───┴───────────┬────────────┴──┘
                                      │ (REST / SDK)              │ (Admin REST API)
                                      ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       MEDUSA v2 COMMERCE CORE (Node.js)                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ API Routing & Middleware (Auth, CORS, Rate Limit, Publishable Key Scope)  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Workflows & Step Engine (Distributed transactional pipelines)             │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Medusa v2 Core Modules (Product, Order, Customer, Cart, Inventory, Auth)  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Custom Domain Modules (Clothing Specs, Reviews, Merchandising CMS)        │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Module Links (`product <-> clothing_spec`, `product <-> reviews`, etc.)   │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE & CACHE TIER                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL 16 (Single Source of Truth: Core Schemas + Linked Extensions)  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Redis 7 (Pub/Sub Event Bus, Caching, Session Store, Distributed Locks)    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Tenets
1. **Single Source of Truth**: All commerce data (products, prices, inventory, customers, carts, orders, transactions, fulfillments) lives exclusively in **PostgreSQL**. No secondary databases (e.g. MongoDB) exist.
2. **Medusa v2 Idiomatic Framework**: Business logic is encapsulated in **Modules**, orchestrated via **Workflows**, and linked via **Remote Links / Module Links**.
3. **No Direct Secret Exposure**: Frontend client communicates exclusively using Publishable API Keys (`pk_...`) with scoped read/write permissions. Secret keys (`sk_...`) and third-party API credentials remain strictly server-side.
4. **Resilient Event-Driven Operations**: State changes emit events onto Redis Event Bus. Subscribers asynchronously trigger emails, logistics sync, and analytics.

---

## 3. Component Breakdown

### 3.1 Medusa v2 Backend Engine (`/backend`)
- **Framework Core**: `@medusajs/framework`, `@medusajs/medusa`.
- **DML (Data Modeling Language)**: Used for defining custom data models in TypeScript with automatic schema generation and type safety.
- **Workflows & Steps**: Replaces legacy services with atomic, reversible workflow steps. If any step fails during checkout or payment processing, compensation steps roll back state automatically.
- **Custom Modules**:
  - `clothing-spec`: Captures garment metrics (GSM, fabric weave, fit type, care instructions, size charts).
  - `reviews`: Customer ratings, verified purchase tags, fit feedback, and photo reviews.
  - `content-cms`: Dynamic homepage banners, promo bars, lookbook grids.
  - `wishlist`: Customer saved items with cross-device sync.
- **Integration Layer**: Modular providers for Razorpay, Shiprocket, S3 media storage, and Resend email.

### 3.2 Customer Storefront (`/storefront`)
- **Framework**: Next.js 15 App Router with React Server Components (RSC) and Server Actions.
- **Styling**: Tailwind CSS + custom fashion design system (dark/light themes, luxury typography, smooth micro-interactions).
- **Communication**: Official `@medusajs/js-sdk` configured with server-side caching and tag-based revalidation (`next: { tags: ['products'] }`).
- **Core User Journeys**:
  - Catalog browsing, deep faceted filtering (Size, Color, Fit, Price), instant search.
  - Interactive Product Details: Fabric/GSM specs, model info, size chart modal with inch/cm switch, live variant stock status.
  - Instant Cart Drawer, Coupon Application, and Address Pin Code Auto-detection.
  - Multi-method Checkout: Razorpay Modal (UPI, Cards, Netbanking) and Cash on Delivery (COD).
  - Customer Portal: Profile, saved addresses, live order tracking via Shiprocket status.

### 3.3 Medusa Admin Extensions
- Built into Medusa v2 Admin via Vite-powered UI extensions.
- **Widgets**:
  - `Product Clothing Details Widget`: Embedded in the core Product detail page to manage GSM, fabric, fit, and size chart tables.
  - `Order Fulfillment & Shiprocket Widget`: Embedded in the Order detail page to generate AWB labels, manifest pickups, and track packages in one click.
- **Custom Routes**:
  - `/admin/analytics`: Real-time sales, AOV, return rates, top-selling sizes/colors, COD vs Prepaid breakdown.
  - `/admin/reviews`: Review approval, moderation, and customer response.
  - `/admin/content`: Merchandising banner and promotional banner editor.

---

## 4. Order Lifecycle & State Machine

The order lifecycle adheres strictly to Medusa v2 core states while supporting fashion D2C operations:

```
[Storefront Checkout]
        │
        ▼
   [Cart Finalized]
        │
        ├── (Online Payment) ──> [Razorpay Session Created] ──> [Customer Pays] ──> [HMAC Verified] ──> [Order Created (Paid)]
        └── (Cash on Delivery) ─> [COD Selected] ─────────────> [Order Created (Payment Pending)]
                                                                                                        │
                                                                                                        ▼
                                                                                               [Processing & Packing]
                                                                                                        │
                                                                                                (Shiprocket AWB Generated)
                                                                                                        ▼
                                                                                                   [Shipped]
                                                                                                        │
                                                                                            (In-Transit / Out for Delivery)
                                                                                                        ▼
                                                                                                  [Delivered]
                                                                                                        │
                                                                        ┌───────────────────────────────┴───────────────────────────────┐
                                                                        ▼                                                               ▼
                                                            [Completed / Happy Customer]                                    [Return / Refund Requested]
                                                                                                                                        │
                                                                                                                                        ▼
                                                                                                                                [Return Inspected]
                                                                                                                                        │
                                                                                                                              (Restockable / Damaged)
                                                                                                                                        ▼
                                                                                                                                [Refund Processed]
```

### Status Mapping:
| Lifecycle Stage | Medusa `status` | Medusa `payment_status` | Medusa `fulfillment_status` |
|---|---|---|---|
| Cart Abandoned | `draft` | `not_paid` | `not_fulfilled` |
| Online Order Placed | `pending` | `captured` | `not_fulfilled` |
| COD Order Placed | `pending` | `awaiting` | `not_fulfilled` |
| Warehouse Packing | `pending` | `captured` | `processing` |
| Shipped with AWB | `pending` | `captured` | `shipped` |
| Customer Delivered | `completed`| `captured` | `delivered` |
| Order Cancelled | `canceled` | `refunded` / `canceled` | `canceled` |
| Returned & Refunded | `completed`| `refunded` | `returned` |

---

## 5. Data Flow & Communication Patterns

### 5.1 Storefront Catalog Fetch (Server-Side Cached)
1. User visits `/products/heavyweight-oversized-tee-black`.
2. Next.js Server Component executes `medusa.store.product.list({ handle: '...' })`.
3. Medusa queries PostgreSQL and resolves linked `clothing_spec` via Module Link.
4. Product + clothing specifications are returned in a single query resolution.
5. Next.js renders HTML with JSON-LD structured data and caches response with tag `products`.

### 5.2 Checkout & Razorpay Flow
1. Storefront calls `medusa.store.cart.createPaymentSession(cartId, { provider_id: "pp_razorpay" })`.
2. Backend communicates with Razorpay API, creates an `order_id` in INR, and returns session token.
3. Customer completes UPI/Card payment on the Razorpay modal.
4. Razorpay returns signature (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`).
5. Storefront invokes server action to complete cart.
6. Backend verifies HMAC-SHA256 signature against `RAZORPAY_KEY_SECRET`.
7. On verification, Medusa `completeCartWorkflow` transforms Cart into Order, decrements inventory reservations, emits `order.placed`, and dispatches confirmation email via Resend.
8. Asynchronous webhook from Razorpay (`payment.captured`) acts as an idempotent safeguard against client drop-offs.

---

## 6. Monorepo & Directory Structure

```
e:\ADIKT Website/
├── .env.example
├── README.md
├── docs/                        # Complete technical documentation suite
├── backend/                     # Medusa v2 Commerce Backend
│   ├── medusa-config.ts         # DB, Redis, Module & Plugin configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── admin/               # Custom widgets and UI routes
│   │   ├── api/                 # Storefront & Admin custom endpoints
│   │   ├── links/               # Module links (Product <-> ClothingSpec, etc.)
│   │   ├── modules/             # Custom DML modules (clothing-spec, reviews, content)
│   │   ├── subscribers/         # Redis event listeners
│   │   └── workflows/           # Custom transactional workflows & steps
└── storefront/                  # Next.js 15 Customer Storefront
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── package.json
    ├── src/
    │   ├── app/                 # App Router pages and API routes
    │   ├── components/          # UI design system and commerce components
    │   ├── lib/                 # Medusa SDK client & utilities
    │   ├── hooks/               # React custom hooks
    │   └── types/               # TypeScript schemas
```
