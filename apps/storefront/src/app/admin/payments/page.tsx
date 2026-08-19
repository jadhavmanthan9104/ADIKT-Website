"use client"

import React, { useState, useEffect } from "react"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Banknote,
  DollarSign,
  Activity,
  History,
  X,
  Check,
  Clock,
  ArrowUpRight,
  Power,
  Sparkles,
  Sliders,
  Lock,
} from "lucide-react"

interface PaymentTransaction {
  id: string
  orderId: string
  gateway: "Razorpay" | "Cash on Delivery"
  amount: number
  currency: string
  mode: "UPI" | "Credit Card" | "Debit Card" | "NetBanking" | "Wallet" | "COD"
  status: "Captured" | "Settled" | "Pending" | "Refunded" | "Partially Refunded" | "Failed"
  gatewayRef: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  refundedAmount?: number
  refundReason?: string
  customerEmail: string
  customerPhone: string
  createdAt: string
  updatedAt: string
}

interface PaymentEventLog {
  id: string
  transactionId?: string
  orderId?: string
  event: string
  status: "success" | "failure" | "warning" | "info"
  message: string
  timestamp: string
}

interface PaymentGatewayConfig {
  id: "razorpay" | "cod"
  name: string
  description: string
  enabled: boolean
  badge?: string
  maxAmount?: number
}

interface PaymentMethodsConfig {
  razorpay: PaymentGatewayConfig
  cod: PaymentGatewayConfig
  updatedAt: string
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [eventLogs, setEventLogs] = useState<PaymentEventLog[]>([])
  const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig>({
    razorpay: {
      id: "razorpay",
      name: "Razorpay Secure Online",
      description: "UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, Wallets",
      enabled: true,
      badge: "Instant Dispatch",
    },
    cod: {
      id: "cod",
      name: "Cash On Delivery (COD)",
      description: "Pay cash upon delivery at your doorstep (Available for orders up to ₹10,000)",
      enabled: true,
      badge: "Doorstep Cash",
      maxAmount: 10000,
    },
    updatedAt: new Date().toISOString(),
  })
  const [isUpdatingGateway, setIsUpdatingGateway] = useState<string | null>(null)
  const [configToast, setConfigToast] = useState<{ message: string; type: "success" | "warning" } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<PaymentTransaction | null>(null)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundReason, setRefundReason] = useState<string>("Customer return / size exchange")
  const [isRefunding, setIsRefunding] = useState(false)
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null)
  const [refundError, setRefundError] = useState<string | null>(null)
  const [showEventDrawer, setShowEventDrawer] = useState(false)

  const fetchPaymentConfig = async () => {
    try {
      const res = await fetch("/api/payments/config")
      if (res.ok) {
        const data = await res.json()
        if (data.config) setPaymentConfig(data.config)
      }
    } catch (err) {
      console.error("Failed to fetch payment config:", err)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/payments/transactions")
      if (res.ok) {
        const data = await res.json()
        if (data.transactions) setTransactions(data.transactions)
        if (data.eventLogs) setEventLogs(data.eventLogs)
      }
    } catch (err) {
      console.error("Failed to fetch payment transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchPaymentConfig()
  }, [])

  const handleTogglePaymentGateway = async (gateway: "razorpay" | "cod") => {
    const currentStatus = paymentConfig[gateway]?.enabled ?? true
    const newStatus = !currentStatus
    const otherGateway = gateway === "razorpay" ? "cod" : "razorpay"

    if (!newStatus && !paymentConfig[otherGateway]?.enabled) {
      if (
        !confirm(
          "⚠️ Warning: Disabling both payment methods means customers will not see any payment options at checkout. Do you want to continue?"
        )
      ) {
        return
      }
    }

    setIsUpdatingGateway(gateway)
    // Optimistic UI state update
    setPaymentConfig((prev) => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        enabled: newStatus,
      },
    }))

    try {
      const res = await fetch("/api/payments/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [gateway]: newStatus,
        }),
      })

      if (!res.ok) throw new Error("Failed to save payment gateway status")
      const data = await res.json()
      if (data.config) setPaymentConfig(data.config)

      const label = gateway === "razorpay" ? "Razorpay Online Payments" : "Cash on Delivery (COD)"
      setConfigToast({
        message: `${label} is now ${newStatus ? "ENABLED" : "DISABLED"} at checkout!`,
        type: newStatus ? "success" : "warning",
      })
      setTimeout(() => setConfigToast(null), 4000)

      // Refresh event audit logs
      fetchTransactions()
    } catch (err: any) {
      // Rollback on failure
      setPaymentConfig((prev) => ({
        ...prev,
        [gateway]: {
          ...prev[gateway],
          enabled: currentStatus,
        },
      }))
      alert(err.message || "Failed to update payment method.")
    } finally {
      setIsUpdatingGateway(null)
    }
  }

  const handleOpenRefundModal = (tx: PaymentTransaction) => {
    setSelectedTxForRefund(tx)
    const maxRefundable = tx.amount - (tx.refundedAmount || 0)
    setRefundAmount(maxRefundable)
    setRefundReason("Customer return / size exchange")
    setRefundError(null)
    setRefundSuccess(null)
  }

  const handleExecuteRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTxForRefund) return

    setIsRefunding(true)
    setRefundError(null)

    try {
      const res = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: selectedTxForRefund.id,
          amount: refundAmount,
          reason: refundReason,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Refund execution failed")
      }

      setRefundSuccess(`Successfully refunded ₹${refundAmount}. Refund ID: ${data.refundId}`)
      await fetchTransactions()
      setTimeout(() => {
        setSelectedTxForRefund(null)
        setRefundSuccess(null)
      }, 1800)
    } catch (err: any) {
      setRefundError(err.message || "Failed to execute refund")
    } finally {
      setIsRefunding(false)
    }
  }

  // Summary Metrics
  const totalVolume = transactions.reduce((acc, t) => acc + (t.status !== "Failed" ? t.amount : 0), 0)
  const capturedVolume = transactions
    .filter((t) => t.status === "Captured" || t.status === "Settled")
    .reduce((acc, t) => acc + t.amount, 0)
  const codPendingVolume = transactions
    .filter((t) => t.gateway === "Cash on Delivery" && t.status === "Pending")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalRefundedVolume = transactions.reduce((acc, t) => acc + (t.refundedAmount || 0), 0)

  const columns: Column<PaymentTransaction>[] = [
    {
      header: "Payment ID",
      accessor: (t) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-white text-xs block">{t.id}</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 block truncate max-w-[160px]" title={t.gatewayRef}>
            {t.gatewayRef}
          </span>
        </div>
      ),
    },
    {
      header: "Order Reference",
      accessor: (t) => (
        <div>
          <span className="font-mono font-bold text-accent">#{t.orderId}</span>
          <p className="text-[10px] text-zinc-400 truncate max-w-[130px]">{t.customerEmail}</p>
        </div>
      ),
    },
    {
      header: "Payment Method",
      accessor: (t) => (
        <div>
          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
            {t.gateway === "Razorpay" ? (
              <CreditCard className="h-3.5 w-3.5 text-accent" />
            ) : (
              <Banknote className="h-3.5 w-3.5 text-amber-400" />
            )}
            {t.gateway}
          </span>
          <p className="text-[11px] text-zinc-400 font-medium">{t.mode}</p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: (t) => (
        <div>
          <span className="font-extrabold text-white text-xs">{formatPrice(t.amount)}</span>
          <span className="text-[10px] text-zinc-500 block">{t.currency}</span>
        </div>
      ),
    },
    {
      header: "Payment Status",
      accessor: (t) => (
        <span
          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
            t.status === "Settled" || t.status === "Captured"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : t.status === "Pending"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : t.status === "Refunded" || t.status === "Partially Refunded"
              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {t.status}
        </span>
      ),
    },
    {
      header: "Created Date",
      accessor: (t) => (
        <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
          {formatDate(t.createdAt)}
        </span>
      ),
    },
    {
      header: "Refund Status & Action",
      accessor: (t) => {
        const isFullyRefunded = t.status === "Refunded" || (t.refundedAmount && t.refundedAmount >= t.amount)
        const hasPartialRefund = (t.refundedAmount || 0) > 0 && !isFullyRefunded
        const canRefund = (t.status === "Captured" || t.status === "Settled" || hasPartialRefund) && !isFullyRefunded

        return (
          <div className="flex items-center gap-2">
            {isFullyRefunded ? (
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-md">
                  Fully Refunded ({formatPrice(t.refundedAmount || t.amount)})
                </span>
                {t.refundReason && <p className="text-[9px] text-zinc-500 truncate max-w-[120px]">{t.refundReason}</p>}
              </div>
            ) : hasPartialRefund ? (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
                  Partial: {formatPrice(t.refundedAmount || 0)}
                </span>
                {canRefund && (
                  <button
                    onClick={() => handleOpenRefundModal(t)}
                    className="text-[10px] font-bold text-accent hover:underline block"
                  >
                    Refund Balance
                  </button>
                )}
              </div>
            ) : canRefund ? (
              <button
                onClick={() => handleOpenRefundModal(t)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold transition-colors"
                title="Issue Full or Partial Refund"
              >
                <RotateCcw className="h-3 w-3 text-accent" /> Issue Refund
              </button>
            ) : (
              <span className="text-[11px] text-zinc-500">—</span>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Gateway Settlements & Reconciliation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Payments Ledger ({transactions.length})
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            All online Razorpay transactions are cryptographically verified via server-side HMAC-SHA256.
          </p>
        </div>

        <button
          onClick={() => setShowEventDrawer(!showEventDrawer)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-white transition-colors"
        >
          <Activity className="h-4 w-4 text-accent" />
          {showEventDrawer ? "Hide Audit Logs" : "View Payment Audit Logs"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-accent" /> Gross Volume
          </span>
          <p className="text-xl sm:text-2xl font-black text-white font-display">
            {formatPrice(totalVolume)}
          </p>
          <p className="text-[10px] text-zinc-500">{transactions.length} Total recorded payments</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Razorpay Captured
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
            {formatPrice(capturedVolume)}
          </p>
          <p className="text-[10px] text-zinc-500">100% Verified via HMAC-SHA256</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5" /> Pending COD Volume
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-display">
            {formatPrice(codPendingVolume)}
          </p>
          <p className="text-[10px] text-zinc-500">To be collected upon doorstep delivery</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5 text-purple-400" /> Total Refunded
          </span>
          <p className="text-xl sm:text-2xl font-black text-purple-400 font-display">
            {formatPrice(totalRefundedVolume)}
          </p>
          <p className="text-[10px] text-zinc-500">Reconciled return disbursements</p>
        </div>
      </div>

      {/* Toast Notification */}
      {configToast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            configToast.type === "success"
              ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
              : "bg-amber-950/80 border-amber-800 text-amber-200"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {configToast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-400" />
            )}
            <span>{configToast.message}</span>
          </div>
          <button
            onClick={() => setConfigToast(null)}
            className="text-xs opacity-70 hover:opacity-100 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Payment Gateways & Checkout Methods Controls */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Checkout Payment Methods Configuration
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Enable or disable payment options that will be displayed to customers on the checkout page.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400">Active Gateways:</span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                paymentConfig.razorpay.enabled && paymentConfig.cod.enabled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : paymentConfig.razorpay.enabled || paymentConfig.cod.enabled
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {paymentConfig.razorpay.enabled && paymentConfig.cod.enabled
                ? "2 Methods Active"
                : paymentConfig.razorpay.enabled
                ? "Razorpay Only"
                : paymentConfig.cod.enabled
                ? "COD Only"
                : "All Disabled"}
            </span>
          </div>
        </div>

        {/* 2 Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Razorpay Online Payments */}
          <div
            className={`p-5 rounded-2xl border transition-all space-y-4 ${
              paymentConfig.razorpay.enabled
                ? "bg-zinc-950/70 border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-sm"
                : "bg-zinc-950/30 border-zinc-800/80 opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    paymentConfig.razorpay.enabled
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  }`}
                >
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Razorpay Secure Online</h3>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        paymentConfig.razorpay.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {paymentConfig.razorpay.enabled ? "Active at Checkout" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, Wallets
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleTogglePaymentGateway("razorpay")}
                disabled={isUpdatingGateway === "razorpay"}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                  paymentConfig.razorpay.enabled ? "bg-emerald-500" : "bg-zinc-700"
                } ${isUpdatingGateway === "razorpay" ? "opacity-50 cursor-not-allowed" : ""}`}
                role="switch"
                aria-checked={paymentConfig.razorpay.enabled}
              >
                <span className="sr-only">Toggle Razorpay</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    paymentConfig.razorpay.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-400" /> 256-Bit SSL & HMAC-SHA256
              </span>
              <span className="text-zinc-500">Instant Dispatch Badge</span>
              <button
                type="button"
                onClick={() => handleTogglePaymentGateway("razorpay")}
                disabled={isUpdatingGateway === "razorpay"}
                className={`text-xs font-bold transition-colors ${
                  paymentConfig.razorpay.enabled
                    ? "text-red-400 hover:text-red-300"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                {paymentConfig.razorpay.enabled ? "Disable at Checkout" : "Enable at Checkout"}
              </button>
            </div>
          </div>

          {/* Cash On Delivery (COD) */}
          <div
            className={`p-5 rounded-2xl border transition-all space-y-4 ${
              paymentConfig.cod.enabled
                ? "bg-zinc-950/70 border-amber-500/30 ring-1 ring-amber-500/20 shadow-sm"
                : "bg-zinc-950/30 border-zinc-800/80 opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    paymentConfig.cod.enabled
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  }`}
                >
                  <Banknote className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Cash On Delivery (COD)</h3>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        paymentConfig.cod.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {paymentConfig.cod.enabled ? "Active at Checkout" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Pay cash upon delivery at doorstep (Supported up to ₹10,000 order value)
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleTogglePaymentGateway("cod")}
                disabled={isUpdatingGateway === "cod"}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                  paymentConfig.cod.enabled ? "bg-emerald-500" : "bg-zinc-700"
                } ${isUpdatingGateway === "cod" ? "opacity-50 cursor-not-allowed" : ""}`}
                role="switch"
                aria-checked={paymentConfig.cod.enabled}
              >
                <span className="sr-only">Toggle Cash on Delivery</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    paymentConfig.cod.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-amber-400" /> Max Order Limit: ₹10,000
              </span>
              <span className="text-zinc-500">Doorstep Collection</span>
              <button
                type="button"
                onClick={() => handleTogglePaymentGateway("cod")}
                disabled={isUpdatingGateway === "cod"}
                className={`text-xs font-bold transition-colors ${
                  paymentConfig.cod.enabled
                    ? "text-red-400 hover:text-red-300"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                {paymentConfig.cod.enabled ? "Disable at Checkout" : "Enable at Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Drawer / Section */}
      {showEventDrawer && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <History className="h-4 w-4 text-accent" /> Chronological Payment Event Audit Trail
            </h3>
            <span className="text-[10px] text-zinc-500">{eventLogs.length} events logged</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-zinc-900">
            {eventLogs.map((log) => (
              <div key={log.id} className="pt-2 flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-accent">{log.event}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        log.status === "success"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.status === "failure"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px]">{log.message}</p>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                  {formatDate(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Transactions Data Table */}
      <AdminDataTable
        data={transactions}
        columns={columns}
        searchPlaceholder="Search by order #, payment ID, gateway reference, customer email..."
        filterKey={(t, q) =>
          t.orderId.toLowerCase().includes(q.toLowerCase()) ||
          t.gatewayRef.toLowerCase().includes(q.toLowerCase()) ||
          t.id.toLowerCase().includes(q.toLowerCase()) ||
          t.customerEmail.toLowerCase().includes(q.toLowerCase()) ||
          t.mode.toLowerCase().includes(q.toLowerCase())
        }
      />

      {/* Issue Refund Modal */}
      {selectedTxForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                  Issue Refund — Order #{selectedTxForRefund.orderId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxForRefund(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {refundSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{refundSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleExecuteRefund} className="space-y-4">
                {refundError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs">
                    {refundError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Total Order Amount</span>
                    <span className="font-bold text-white">{formatPrice(selectedTxForRefund.amount)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Already Refunded</span>
                    <span className="font-bold text-amber-400">
                      {formatPrice(selectedTxForRefund.refundedAmount || 0)}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-zinc-900">
                    <span className="text-zinc-500 block">Gateway Reference</span>
                    <span className="font-mono text-[11px] text-zinc-300">
                      {selectedTxForRefund.gatewayRef} ({selectedTxForRefund.gateway})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Refund Amount in INR (Max: ₹{selectedTxForRefund.amount - (selectedTxForRefund.refundedAmount || 0)})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedTxForRefund.amount - (selectedTxForRefund.refundedAmount || 0)}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    required
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400">Reason for Refund</label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                  >
                    <option value="Customer return / size exchange">Customer return / size exchange</option>
                    <option value="Defective garment / quality issue">Defective garment / quality issue</option>
                    <option value="Customer requested cancellation before dispatch">Customer requested cancellation before dispatch</option>
                    <option value="Package damaged in logistics transit">Package damaged in logistics transit</option>
                    <option value="Other / Goodwill adjustment">Other / Goodwill adjustment</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedTxForRefund(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRefunding || refundAmount <= 0}
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isRefunding ? "Executing Refund..." : `Confirm Refund — ${formatPrice(refundAmount)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
