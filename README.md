# ADIKT Clothing Co. — Self-Hosted D2C Ecommerce Platform

> A production-ready, self-hosted headless ecommerce platform designed for modern fashion and luxury streetwear brands, built to replace Shopify with **Medusa v2**, **PostgreSQL**, and **Next.js 15+**.

---

## 📑 Technical Documentation Index

All core architectural decisions, data models, integration specifications, and operations guides are comprehensively documented in [`/docs`](file:///e:/ADIKT%20Website/docs):

1. 🏛️ **[System Architecture](file:///e:/ADIKT%20Website/docs/architecture.md)**: High-level topology, Medusa v2 workflows, order lifecycle state machine, and data flow patterns.
2. 🗄️ **[Database & Data Models](file:///e:/ADIKT%20Website/docs/database.md)**: PostgreSQL single source of truth, custom DML models for clothing specifications, module links, and indexing.
3. 🔌 **[API Reference & Contracts](file:///e:/ADIKT%20Website/docs/api.md)**: Storefront and Admin REST APIs, Medusa v2 JS SDK integration, cart workflows, customer accounts, and webhook contracts.
4. 🛡️ **[Security Architecture](file:///e:/ADIKT%20Website/docs/security.md)**: Threat modeling, RBAC, PCI-DSS compliance, HMAC webhook signature verification, rate limiting, and HTTP security headers.
5. 🚀 **[Production Deployment](file:///e:/ADIKT%20Website/docs/deployment.md)**: Docker Compose orchestration, Caddy SSL reverse proxy, multi-stage Dockerfiles, zero-downtime migrations, and health checks.
6. 🧪 **[Testing Strategy](file:///e:/ADIKT%20Website/docs/testing.md)**: Testing pyramid, Medusa v2 integration tests, Playwright E2E customer journey tests, and k6 load testing.
7. 🧩 **[Modular Integrations](file:///e:/ADIKT%20Website/docs/integrations.md)**: Razorpay payment provider, Shiprocket logistics and automated AWB generation, S3 media storage, Resend transactional emails, and GA4 ecommerce tracking.
8. 🚚 **[Shopify Migration Playbook](file:///e:/ADIKT%20Website/docs/shopify-migration.md)**: Data mapping matrix, customer password activation, SEO preservation, 301 redirect map, and cutover checklist.
9. ⚙️ **[Environment Variables (.env.example)](file:///e:/ADIKT%20Website/.env.example)**: Comprehensive master environment documentation covering all configuration keys.

---

## 🛠️ Technology Stack

- **Backend**: [Medusa v2](https://medusajs.com/) (`@medusajs/framework`, `@medusajs/medusa`)
- **Frontend / Storefront**: Next.js 15+ (App Router, React Server Components, Server Actions), Tailwind CSS
- **Database**: PostgreSQL 16+ (Sole source of truth — No MongoDB or secondary databases)
- **Cache & Event Bus**: Redis 7
- **Admin**: Native Medusa v2 Admin with custom React widgets, analytics dashboards, and merchandising CMS
- **Payments**: Razorpay (UPI, Cards, Netbanking) + Verified Cash on Delivery (COD)
- **Shipping**: Shiprocket (Pincode serviceability, automated AWB generation, live webhook tracking)
- **Storage**: AWS S3 / Cloudflare R2 / Cloudinary
- **Emails**: Resend / React Email
- **Analytics**: Google Analytics 4 (GA4) Enhanced Ecommerce + Server-Side Measurement Protocol

---

## 📦 Monorepo Architecture

```
/
├── apps/
│   ├── backend/                     # Medusa v2 Commerce Core & Custom DML Modules
│   │   ├── src/
│   │   │   ├── modules/             # Clothing Spec, Reviews, Wishlist, CMS Banners
│   │   │   ├── links/               # Module links (product <-> clothing-spec, review)
│   │   │   └── admin/               # Custom Admin Widgets & Analytics Dashboard
│   │   └── medusa-config.ts         # Medusa v2 Master Config (PostgreSQL, Redis, Auth)
│   └── storefront/                  # Next.js 15 App Router Customer Storefront
│       ├── src/
│       │   ├── app/                 # Home, Catalog, Product Details, Cart, Checkout, Account
│       │   ├── components/          # ProductCard, SizeChartModal, DetailView, Header, Footer
│       │   └── lib/                 # @medusajs/js-sdk Client & Formatters
│       └── tailwind.config.ts       # Luxury dark aesthetic & typography tokens
├── packages/
│   ├── config/                      # Shared base tsconfig & tooling configs
│   ├── types/                       # Shared domain TypeScript interfaces & DTOs
│   └── ui/                          # Shared UI utility tokens & helpers (cn)
├── docs/                            # Comprehensive architectural & operational specs
├── scripts/                         # Environment validator & operational scripts
├── .env.example                     # Master environment variables template
└── package.json                     # Root monorepo workspace manifest
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- PostgreSQL `16+`
- Redis `7+`

### 2. Environment Configuration
```bash
cp .env.example .env
```
Validate your environment setup:
```bash
node scripts/check-env.js
```

### 3. Install Dependencies & Build Packages
```bash
# Install workspace dependencies
npm install

# Build shared types and ui packages
npm run build:packages
```

### 4. Running the Development Servers

```bash
# Start Next.js Storefront (http://localhost:3000)
npm run dev:storefront

# Start Medusa v2 Backend & Admin (http://localhost:9000 & http://localhost:9000/app)
npm run dev:backend
```

### 5. Verification Commands

```bash
# Typecheck all packages, storefront, and backend
npm run typecheck

# Lint storefront codebase
npm run lint

# Build full production bundle (Packages + Storefront)
npm run build
```
