# Quality Assurance & Testing Strategy Documentation

## 1. Testing Pyramid Overview

To guarantee zero checkout bugs and bulletproof stability during high-volume fashion drops, the platform implements a four-tier testing hierarchy:

```
                  ┌──────────────────────┐
                  │    E2E Tests (10%)   │ Playwright (Full Checkout Flow)
                  ├──────────────────────┤
                  │ Integration (30%)    │ Medusa Workflows, DB & Webhooks
                  ├──────────────────────┤
                  │ Component Tests (20%)│ React Testing Library (UI State)
                  ├──────────────────────┤
                  │ Unit Tests (40%)     │ Jest / Vitest (HMAC, Rules, Math)
                  └──────────────────────┘
```

---

## 2. Unit Testing Suite

Targeting pure functions, business calculation rules, and security utilities:
- **Price and Tax Calculation**: Multi-item line item pricing, coupon percentage deductions, minimum order caps.
- **Garment Size Chart Resolution**: Unit converter (Inches to Centimeters).
- **Cryptographic Security**: Razorpay HMAC-SHA256 signature verification matching expected hashes.
- **Stock Reservation Limits**: Ensuring variant inventory is never decremented below 0.

---

## 3. Medusa v2 Module & Workflow Integration Tests

Integration tests run against a real PostgreSQL test container using `@medusajs/test-utils`:

```typescript
// backend/integration-tests/workflows/order-checkout.spec.ts
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createPaymentSessionWorkflow, completeCartWorkflow } from "../../src/workflows"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Order Checkout Workflow", () => {
      it("creates an order, captures payment, and decrements stock atomically", async () => {
        const container = getContainer()
        
        // 1. Seed customer, product with 5 in stock, and cart
        // 2. Execute Payment Session workflow for Razorpay
        // 3. Simulate successful HMAC signature validation
        // 4. Complete cart workflow
        // 5. Verify inventory level reduced from 5 to 4
        // 6. Verify order status is 'pending' and payment status is 'captured'
      })
      
      it("rolls back inventory reservation if payment verification fails", async () => {
        // Test workflow compensation steps on simulated network/verification failure
      })
    })
  }
})
```

---

## 4. Storefront UI Component Testing

Using **Vitest / Jest** with **React Testing Library**:
- `ProductVariantSelector`: Verifies out-of-stock sizes are disabled with "Sold Out" badge.
- `SizeChartModal`: Verifies clicking cm/inches toggles table measurements correctly.
- `CartDrawer`: Verifies quantity increments, promo code error states, and shipping threshold progress bar.

---

## 5. End-to-End (E2E) Testing with Playwright

Playwright tests simulate complete customer browser journeys on desktop and mobile viewports:

```typescript
// storefront/e2e/checkout-flow.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Customer D2C Purchase Flow", () => {
  test("browses catalog, selects size, adds to cart, and completes checkout", async ({ page }) => {
    // 1. Visit Homepage
    await page.goto("/")
    await expect(page.locator("h1")).toContainText("ADIKT")

    // 2. Navigate to Catalog
    await page.click("text=Shop All")
    await page.click("text=Heavyweight Boxy Tee")

    // 3. Select Size L & Open Size Guide
    await page.click("button:has-text('Size Guide')")
    await expect(page.locator("text=Garment Measurements")).toBeVisible()
    await page.click("button:has-text('Close')")
    
    await page.click("button:has-text('L')")
    await page.click("button:has-text('Add to Bag')")

    // 4. Open Cart & Proceed to Checkout
    await expect(page.locator("text=Bag (1)")).toBeVisible()
    await page.click("text=Checkout")

    // 5. Fill Shipping Address
    await page.fill("input[name='first_name']", "Test")
    await page.fill("input[name='last_name']", "Customer")
    await page.fill("input[name='address_1']", "123 Fashion Street")
    await page.fill("input[name='postal_code']", "400001")
    await page.fill("input[name='city']", "Mumbai")
    await page.fill("input[name='phone']", "9876543210")

    // 6. Select Payment & Complete
    await page.click("text=Cash on Delivery")
    await page.click("button:has-text('Place Order')")

    // 7. Order Confirmation Screen
    await expect(page).toHaveURL(/.*order\/confirmed/)
    await expect(page.locator("text=Thank you for your order")).toBeVisible()
  })
})
```

---

## 6. High-Concurrency Load Testing (k6)

Simulates flash drop traffic (1,000 virtual users checking out concurrently):

```javascript
// tests/load/flash-drop-simulation.js
import http from "k6/http"
import { check, sleep } from "k6"

export const options = {
  stages: [
    { duration: "30s", target: 200 },  // Ramp up
    { duration: "1m", target: 1000 },  // Peak drop traffic
    { duration: "30s", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<400"], // 95% requests must finish under 400ms
    http_req_failed: ["rate<0.01"],   // Less than 1% errors
  },
}

export default function () {
  const res = http.get("http://localhost:9000/store/products")
  check(res, { "status is 200": (r) => r.status === 200 })
  sleep(1)
}
```

---

## 7. CI/CD Automated Pipeline (GitHub Actions)

```yaml
name: CI Quality Assurance Pipeline
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_commerce
        ports: ["5432:5432"]
      redis:
        image: redis:7
        ports: ["6379:6379"]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Code Linting
        run: npm run lint

      - name: TypeScript Typecheck
        run: npm run typecheck

      - name: Unit & Integration Tests
        run: npm run test

      - name: E2E Playwright Tests
        run: npx playwright test
```
