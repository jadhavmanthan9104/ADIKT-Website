/**
 * ADIKT Commerce — Razorpay Medusa v2 Payment Provider Integration Test Suite
 * 
 * Tests end-to-end payment flows:
 * 1. Payment session initiation (Order creation)
 * 2. Timing-safe cryptographic HMAC-SHA256 signature verification
 * 3. Tampered & invalid signature rejection
 * 4. Missing parameters rejection
 * 5. Payment completion idempotency (no duplicate orders)
 * 6. Webhook signature validation (X-Razorpay-Signature)
 * 7. Invalid webhook signature rejection
 * 8. Webhook payment.captured & order.paid idempotency
 * 9. Webhook payment.failed logging
 * 10. Refund execution & status verification
 * 11. Payment method disablement guard
 */

const crypto = require("crypto")
const http = require("http")
const fs = require("fs")
const path = require("path")

// Load .env and .env.local
const envFiles = [
  path.join(__dirname, "..", "apps", "storefront", ".env.local"),
  path.join(__dirname, "..", ".env"),
]
for (const file of envFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf-8")
    for (const line of content.split("\n")) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=")
        const key = k.trim()
        const val = v.join("=").trim().replace(/^["']|["']$/g, "")
        if (!process.env[key]) process.env[key] = val
      }
    }
  }
}

const BASE_URL = "http://localhost:3000"

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const bodyStr = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null

    const reqHeaders = { ...headers }
    if (body && !reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json"
    }
    if (bodyStr) {
      reqHeaders["Content-Length"] = Buffer.byteLength(bodyStr)
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname + url.search,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              json: JSON.parse(data),
              raw: data,
            })
          } catch {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              raw: data,
            })
          }
        })
      }
    )

    req.on("error", (err) => reject(err))
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

async function runTests() {
  console.log("\n==================================================================")
  console.log("  ⚡ ADIKT COMMERCE — RAZORPAY MEDUSA v2 INTEGRATION TEST SUITE   ")
  console.log("==================================================================\n")

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `)
      await fn()
      console.log(`\x1b[32m✔ PASSED\x1b[0m`)
      passed++
    } catch (err) {
      console.log(`\x1b[31m✖ FAILED\x1b[0m`)
      console.error(`   Error: ${err.message}`)
      failed++
    }
  }

  // 1. Payment Config Endpoint
  await test("GET /api/payments/config returns active gateway configuration", async () => {
    const res = await request("GET", "/api/payments/config")
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`)
    if (!res.json.success || !res.json.config.razorpay) {
      throw new Error("Invalid payment config payload structure")
    }
    if (typeof res.json.config.razorpay.enabled !== "boolean") {
      throw new Error("Razorpay enabled status is not a boolean")
    }
  })

  // 2. Razorpay Order Initiation
  let testOrderId = ""
  let testKeyId = ""
  await test("POST /api/payments/razorpay/create-order initializes Razorpay Order", async () => {
    const res = await request("POST", "/api/payments/razorpay/create-order", {
      amount: 4999,
      currency: "INR",
      cartId: `cart_test_${Date.now()}`,
      items: [
        {
          id: "item_oversized_tee",
          title: "ADIKT Oversized Heavyweight Tee",
          price: 4999,
          quantity: 1,
        },
      ],
      customer: {
        email: "test.customer@adikt.co",
        phone: "9876543210",
        name: "Test Customer",
      },
    })

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}: ${res.raw}`)
    if (!res.json.success || !res.json.order) throw new Error("Missing order payload")
    if (!res.json.order.orderId || !res.json.order.amount) {
      throw new Error("Invalid order data in response")
    }
    testOrderId = res.json.order.orderId
    testKeyId = res.json.order.keyId
  })

  // 3. Cryptographic Signature Verification (Successful Payment)
  const testPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const testSecret = process.env.RAZORPAY_KEY_SECRET || "YourRazorpaySecretKeyHere789012"
  const validSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest("hex")

  let placedOrderId = ""
  await test("POST /api/payments/razorpay/verify verifies valid signature & creates order", async () => {
    const res = await request("POST", "/api/payments/razorpay/verify", {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature,
      cart: {
        id: `cart_${Date.now()}`,
        total: 4999,
        subtotal: 4999,
        items: [
          {
            id: "prod_tee_01",
            title: "Vintage Heavyweight Hoodie",
            price: 4999,
            quantity: 1,
            size: "L",
            color: "Acid Washed Black",
          },
        ],
      },
      customer: {
        email: "verified.buyer@adikt.co",
        phone: "9876543210",
        name: "Verified Buyer",
      },
      shippingAddress: {
        firstName: "Verified",
        lastName: "Buyer",
        phone: "9876543210",
        addressLine1: "123 Fashion District",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
      },
      paymentMode: "UPI",
    })

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}: ${res.raw}`)
    if (!res.json.success || !res.json.orderId) throw new Error("Order creation failed on verify")
    placedOrderId = res.json.orderId
  })

  // 4. Verification Idempotency Check
  await test("POST /api/payments/razorpay/verify returns existing order idempotently on duplicate submission", async () => {
    const res = await request("POST", "/api/payments/razorpay/verify", {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature,
      cart: { total: 4999, items: [] },
    })

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`)
    if (!res.json.success || !res.json.isDuplicate) {
      throw new Error("Expected idempotent duplicate response")
    }
  })

  // 5. Tampered Signature Rejection
  await test("POST /api/payments/razorpay/verify rejects tampered signature with 400 Bad Request", async () => {
    const tamperedSignature = "tampered_invalid_hex_signature_deadbeef12345678"
    const res = await request("POST", "/api/payments/razorpay/verify", {
      razorpay_order_id: `order_fake_${Date.now()}`,
      razorpay_payment_id: `pay_fake_${Date.now()}`,
      razorpay_signature: tamperedSignature,
      cart: { total: 2999 },
    })

    if (res.status !== 400) {
      throw new Error(`Expected status 400 for tampered signature, got ${res.status}`)
    }
  })

  // 6. Missing Signature Attributes Rejection
  await test("POST /api/payments/razorpay/verify rejects missing parameters with 400 Bad Request", async () => {
    const res = await request("POST", "/api/payments/razorpay/verify", {
      razorpay_order_id: testOrderId,
      // missing payment_id and signature
    })

    if (res.status !== 400) {
      throw new Error(`Expected status 400 for missing fields, got ${res.status}`)
    }
  })

  // 7. Webhook Ingress (Valid payment.captured)
  const webhookPaymentId = `pay_wh_${Date.now()}`
  const webhookBody = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: webhookPaymentId,
          order_id: `order_wh_${Date.now()}`,
          amount: 599900,
          currency: "INR",
          status: "captured",
          method: "upi",
          email: "webhook.customer@adikt.co",
          contact: "+919876543210",
          notes: {
            order_id: `ADKT-${Math.floor(10000 + Math.random() * 90000)}`,
            cart_id: "cart_wh_123",
          },
        },
      },
    },
  })

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "YourWebhookSecretHere"
  const validWebhookSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(webhookBody)
    .digest("hex")

  await test("POST /api/webhooks/razorpay handles payment.captured webhook with valid HMAC", async () => {
    const res = await request("POST", "/api/webhooks/razorpay", webhookBody, {
      "x-razorpay-signature": validWebhookSig,
      "Content-Type": "application/json",
    })

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}: ${res.raw}`)
    if (!res.json.received) throw new Error("Webhook was not acknowledged")
  })

  // 8. Webhook Duplicate Idempotency
  await test("POST /api/webhooks/razorpay ignores duplicate webhook delivery idempotently", async () => {
    const res = await request("POST", "/api/webhooks/razorpay", webhookBody, {
      "x-razorpay-signature": validWebhookSig,
      "Content-Type": "application/json",
    })

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`)
    if (!res.json.idempotent) throw new Error("Expected duplicate webhook to be flagged idempotent")
  })

  // 9. Webhook Invalid Signature Rejection
  await test("POST /api/webhooks/razorpay rejects forged webhook signature when secret is configured", async () => {
    // Only tests rejection if webhook secret is active
    if (process.env.RAZORPAY_WEBHOOK_SECRET && !process.env.RAZORPAY_WEBHOOK_SECRET.includes("YourWebhookSecret")) {
      const res = await request("POST", "/api/webhooks/razorpay", webhookBody, {
        "x-razorpay-signature": "forged_invalid_signature_hex",
        "Content-Type": "application/json",
      })

      if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`)
    }
  })

  // 10. Webhook payment.failed handling
  await test("POST /api/webhooks/razorpay records payment.failed event", async () => {
    const failedPayload = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_fail_${Date.now()}`,
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Card balance insufficient",
          },
        },
      },
    })
    const failedSig = crypto.createHmac("sha256", webhookSecret).update(failedPayload).digest("hex")

    const res = await request("POST", "/api/webhooks/razorpay", failedPayload, {
      "x-razorpay-signature": failedSig,
      "Content-Type": "application/json",
    })

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`)
  })

  // 11. Full & Partial Refund Execution
  await test("POST /api/payments/refund issues full/partial refund on recorded payment", async () => {
    const res = await request("POST", "/api/payments/refund", {
      transactionId: testPaymentId,
      amount: 2000,
      reason: "Customer requested size exchange adjustment",
    })

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}: ${res.raw}`)
    if (!res.json.success || !res.json.transaction) throw new Error("Refund processing failed")
    if (res.json.transaction.status !== "Partially Refunded" && res.json.transaction.status !== "Refunded") {
      throw new Error(`Unexpected transaction status after refund: ${res.json.transaction.status}`)
    }
  })

  // 12. Payment Gateway Disablement Guard
  await test("Disabling Razorpay in admin prevents order initialization at checkout", async () => {
    // Disable Razorpay
    await request("POST", "/api/payments/config", { razorpay: false })

    // Try to create order
    const orderRes = await request("POST", "/api/payments/razorpay/create-order", {
      amount: 1999,
      cartId: "cart_disabled_test",
    })

    if (orderRes.status !== 400) {
      // Re-enable before throwing
      await request("POST", "/api/payments/config", { razorpay: true })
      throw new Error(`Expected 400 Bad Request when Razorpay is disabled, got ${orderRes.status}`)
    }

    // Re-enable Razorpay
    const restoreRes = await request("POST", "/api/payments/config", { razorpay: true })
    if (restoreRes.status !== 200 || !restoreRes.json.config.razorpay.enabled) {
      throw new Error("Failed to restore Razorpay enabled status")
    }
  })

  console.log("\n==================================================================")
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED  `)
  console.log("==================================================================\n")

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error("Test Suite Fatal Error:", err)
  process.exit(1)
})
