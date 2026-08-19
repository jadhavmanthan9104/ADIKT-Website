import { NextRequest, NextResponse } from "next/server"
import { PaymentService } from "@/lib/payment-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature") || ""

    // 1. Verify Webhook Signature (HMAC-SHA256)
    const isValidSignature = PaymentService.verifyWebhookSignature(rawBody, signature)
    if (!isValidSignature) {
      PaymentService.logEvent({
        event: "webhook.invalid_signature",
        status: "failure",
        message: "Razorpay webhook rejected: signature verification failed.",
      })
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      )
    }

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    const event = payload?.event
    const eventId = payload?.payload?.payment?.entity?.id || payload?.id || `evt_${Date.now()}`

    // 2. Idempotency Check: Prevent duplicate webhook execution
    if (PaymentService.isWebhookEventProcessed(eventId)) {
      PaymentService.logEvent({
        event: `webhook.duplicate.${event}`,
        status: "info",
        message: `Webhook event ${eventId} already processed previously. Ignored duplicate.`,
      })
      return NextResponse.json({ received: true, idempotent: true })
    }

    PaymentService.markWebhookEventProcessed(eventId)

    // 3. Process Specific Razorpay Events
    switch (event) {
      case "order.paid":
      case "payment.captured": {
        const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity
        const paymentId = paymentEntity?.id || `pay_${Date.now()}`
        const orderId =
          paymentEntity?.notes?.order_id ||
          paymentEntity?.notes?.cart_id ||
          paymentEntity?.receipt ||
          `ADKT-${Math.floor(10000 + Math.random() * 90000)}`
        const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0

        // Prevent duplicate payment ledger recordings
        if (!PaymentService.isPaymentAlreadyProcessed(paymentId)) {
          PaymentService.recordOnlinePayment({
            orderId,
            amount,
            razorpayOrderId: paymentEntity?.order_id || payload.payload?.order?.entity?.id || `order_${Date.now()}`,
            razorpayPaymentId: paymentId,
            customerEmail: paymentEntity?.email || "",
            customerPhone: paymentEntity?.contact || "",
            paymentMode:
              paymentEntity?.method === "upi"
                ? "UPI"
                : paymentEntity?.method === "card"
                ? "Credit Card"
                : paymentEntity?.method === "netbanking"
                ? "NetBanking"
                : "Wallet",
          })
        }

        PaymentService.logEvent({
          event: `webhook.${event}`,
          status: "success",
          message: `Webhook confirmed ${event} for ${paymentId} (₹${amount}).`,
          details: { paymentId, amount, eventId, orderId },
        })
        break
      }

      case "payment.authorized": {
        const paymentEntity = payload.payload?.payment?.entity
        const paymentId = paymentEntity?.id
        const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0

        PaymentService.logEvent({
          event: "webhook.payment_authorized",
          status: "info",
          message: `Webhook received payment.authorized for ${paymentId} (₹${amount}). Awaiting auto-capture.`,
          details: { paymentId, amount, eventId },
        })
        break
      }

      case "payment.failed": {
        const paymentEntity = payload.payload?.payment?.entity
        const paymentId = paymentEntity?.id || "unknown_payment"
        const errorDesc =
          paymentEntity?.error_description ||
          payload.payload?.error?.description ||
          "Payment declined by customer bank / UPI gateway"

        PaymentService.logEvent({
          event: "webhook.payment_failed",
          status: "failure",
          message: `Payment failed for ${paymentId}: ${errorDesc}`,
          details: {
            paymentId,
            errorCode: paymentEntity?.error_code,
            errorDescription: errorDesc,
          },
        })
        break
      }

      case "refund.processed":
      case "refund.created": {
        const refundEntity = payload.payload?.refund?.entity
        const paymentId = refundEntity?.payment_id
        const refundAmount = refundEntity?.amount ? refundEntity.amount / 100 : 0

        PaymentService.logEvent({
          event: "webhook.refund_processed",
          status: "success",
          message: `Webhook confirmed refund ${refundEntity?.id} for payment ${paymentId} (₹${refundAmount}).`,
          details: { refundId: refundEntity?.id, paymentId, refundAmount },
        })
        break
      }

      default: {
        PaymentService.logEvent({
          event: `webhook.unhandled.${event}`,
          status: "info",
          message: `Received webhook event: ${event}`,
          details: { eventId },
        })
        break
      }
    }

    return NextResponse.json({ received: true, event })
  } catch (error: any) {
    console.error("[Razorpay Webhook Error]:", error)
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 500 }
    )
  }
}
