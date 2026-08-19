import { NextRequest, NextResponse } from "next/server"
import { PaymentService } from "@/lib/payment-service"
import { OrdersDB } from "@/lib/orders-db"
import { InventoryService } from "@/lib/inventory/inventory-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart,
      customer,
      shippingAddress,
      paymentMode = "UPI",
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      PaymentService.logEvent({
        event: "razorpay.verify_missing_params",
        status: "failure",
        message: "Payment verification failed: missing payment signature parameters.",
      })
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      )
    }

    // 1. Idempotency Check: Prevent duplicate payment processing & double order creations
    if (PaymentService.isPaymentAlreadyProcessed(razorpay_payment_id)) {
      PaymentService.logEvent({
        event: "razorpay.duplicate_attempt",
        status: "warning",
        message: `Payment ID ${razorpay_payment_id} was already processed previously. Re-returning existing order state.`,
      })
      const tx = PaymentService.getTransactions().find(
        (t) => t.razorpayPaymentId === razorpay_payment_id
      )
      return NextResponse.json({
        success: true,
        orderId: tx?.orderId || `ADKT-${Date.now().toString().slice(-5)}`,
        paymentId: razorpay_payment_id,
        isDuplicate: true,
      })
    }

    // 2. Cryptographic HMAC-SHA256 Verification (Server-Side)
    const isValid = PaymentService.verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    if (!isValid) {
      PaymentService.logEvent({
        event: "razorpay.signature_mismatch",
        status: "failure",
        message: `Signature verification mismatch for Razorpay Payment ${razorpay_payment_id}. Possible payload tampering detected.`,
        details: { razorpay_order_id, razorpay_payment_id },
      })
      return NextResponse.json(
        { error: "Cryptographic payment verification failed. Untrusted signature." },
        { status: 400 }
      )
    }

    // 3. Generate Order Reference
    const orderDisplayId = `ADKT-${Math.floor(10000 + Math.random() * 90000)}`
    const totalAmount = cart?.total || 1999

    // 4. Record Payment in Payments Ledger
    const transaction = PaymentService.recordOnlinePayment({
      orderId: orderDisplayId,
      amount: totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customerEmail: customer?.email || shippingAddress?.email || "customer@example.com",
      customerPhone: customer?.phone || shippingAddress?.phone || "9876543210",
      paymentMode: paymentMode,
    })

    // 5. Complete Order in Admin Data Service
    const newOrder = {
      id: `order_${Date.now()}`,
      displayId: orderDisplayId,
      customer: {
        id: customer?.id || `cus_${Date.now()}`,
        name: `${shippingAddress?.firstName || "Aditya"} ${shippingAddress?.lastName || "Sharma"}`.trim(),
        email: customer?.email || shippingAddress?.email || "customer@example.com",
        phone: customer?.phone || shippingAddress?.phone || "9876543210",
      },
      createdAt: new Date().toISOString().slice(0, 10),
      status: "Processing" as const,
      paymentStatus: "Captured" as const,
      fulfillmentStatus: "Unfulfilled" as const,
      total: totalAmount,
      subtotal: cart?.subtotal || totalAmount,
      discountTotal: cart?.discount || 0,
      shippingTotal: cart?.shipping || 0,
      taxTotal: Math.round(totalAmount * 0.12),
      paymentMethod: "Razorpay Online (Prepaid)" as const,
      // A carrier is assigned by fulfilment after the parcel is booked and has an AWB.
      courier: "",
      shippingAddress: {
        name: `${shippingAddress?.firstName || "Aditya"} ${shippingAddress?.lastName || "Sharma"}`.trim(),
        phone: customer?.phone || shippingAddress?.phone || "9876543210",
        addressLine1: shippingAddress?.addressLine1 || "B-402, Highline Residences",
        addressLine2: shippingAddress?.addressLine2,
        city: shippingAddress?.city || "Mumbai",
        state: shippingAddress?.state || "Maharashtra",
        pincode: shippingAddress?.pincode || "400050",
      },
      items: (cart?.items || []).map((item: any) => ({
        id: item.id || `item_${Date.now()}`,
        title: item.title,
        variant: `${item.size} / ${item.color}`,
        sku: `ADKT-${item.size || "STD"}`,
        quantity: item.quantity,
        price: item.price,
        thumbnail: item.thumbnail,
      })),
      timeline: [
        {
          id: `tl_1`,
          time: new Date().toISOString().replace("T", " ").slice(0, 16),
          title: "Order Placed & Payment Captured",
          description: `Razorpay payment ${razorpay_payment_id} verified via HMAC-SHA256. Amount: ₹${totalAmount}.`,
          user: "Razorpay Gateway",
        },
      ],
      notes: [],
    }

    OrdersDB.save(newOrder)

    // 6. Deduct Inventory Stock Permanently in Medusa Inventory Engine
    try {
      InventoryService.deductStock({
        orderId: orderDisplayId,
        cartId: cart?.id,
        items: (cart?.items || []).map((item: any) => ({
          sku: item.sku || `ADKT-${item.size || "STD"}`,
          variantId: item.variantId || item.id,
          title: item.title,
          quantity: item.quantity || 1,
        })),
      })
    } catch (invErr) {
      console.error("[Inventory Deduction Notice]:", invErr)
    }

    // 7. Record discount usage & mark abandoned cart as recovered
    try {
      if (cart?.promoCode) {
        const { DiscountsDB } = await import("@/lib/discounts-db")
        DiscountsDB.recordDiscountUsage(
          cart.promoCode,
          customer?.email || shippingAddress?.email
        )
      }
      const { AbandonedCartsDB } = await import("@/lib/abandoned-carts-db")
      AbandonedCartsDB.markAsRecovered(
        cart?.id || customer?.email || shippingAddress?.email,
        orderDisplayId
      )
    } catch (mktgErr) {
      console.warn("[Marketing Order Hook Notice]:", mktgErr)
    }

    // 8. Non-blocking customer email notifications dispatch
    try {
      const { NotificationService } = await import("@/lib/notifications/notification-service")
      const customerEmail = customer?.email || shippingAddress?.email || "customer@example.com"
      const customerName = `${shippingAddress?.firstName || "Aditya"} ${shippingAddress?.lastName || "Sharma"}`.trim()

      NotificationService.sendAsync("order_confirmation", customerEmail, {
        customerName,
        orderId: orderDisplayId,
        total: totalAmount,
        items: cart?.items || [],
        paymentMethod: "Razorpay Online (Prepaid)",
      }, { orderId: orderDisplayId, mode: "Razorpay" })

      NotificationService.sendAsync("payment_confirmation", customerEmail, {
        customerName,
        orderId: orderDisplayId,
        total: totalAmount,
        transactionId: razorpay_payment_id,
      }, { orderId: orderDisplayId, paymentId: razorpay_payment_id })
    } catch (notifErr) {
      console.warn("[Razorpay Notification Notice]:", notifErr)
    }

    return NextResponse.json({
      success: true,
      orderId: orderDisplayId,
      paymentId: razorpay_payment_id,
      transactionId: transaction.id,
    })
  } catch (error: any) {
    console.error("[Razorpay Verify API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Payment verification exception" },
      { status: 500 }
    )
  }
}
