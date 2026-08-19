"use client"

import React, { useState, useEffect, useCallback } from "react"
import { NotificationRecord } from "@/lib/notifications/notification-service"
import { NotificationEventType } from "@/lib/notifications/templates/template-registry"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatDate } from "@/lib/formatters"
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCw,
  Eye,
  X,
  Play,
  RefreshCw,
  ShieldCheck,
  Server,
  Zap,
} from "lucide-react"

const ALL_EVENT_TYPES: { type: NotificationEventType; label: string; group: string }[] = [
  { type: "account_created", label: "Account Created", group: "Auth" },
  { type: "email_verification", label: "Email Verification", group: "Auth" },
  { type: "password_reset", label: "Password Reset", group: "Auth" },
  { type: "order_confirmation", label: "Order Confirmation", group: "Orders" },
  { type: "payment_confirmation", label: "Payment Confirmation", group: "Orders" },
  { type: "payment_failure", label: "Payment Failure", group: "Orders" },
  { type: "order_cancellation", label: "Order Cancellation", group: "Orders" },
  { type: "order_refund", label: "Order Refund", group: "Orders" },
  { type: "order_shipped", label: "Order Shipped", group: "Fulfillment" },
  { type: "order_delivered", label: "Order Delivered", group: "Fulfillment" },
  { type: "return_approved", label: "Return Approved", group: "Returns" },
  { type: "return_rejected", label: "Return Rejected", group: "Returns" },
  { type: "return_received", label: "Return Received", group: "Returns" },
  { type: "abandoned_cart", label: "Abandoned Cart", group: "Marketing" },
]

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    deliveryRate: 100,
  })
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [previewItem, setPreviewItem] = useState<NotificationRecord | null>(null)
  const [previewTab, setPreviewTab] = useState<"html" | "text">("html")
  const [isTesting, setIsTesting] = useState(false)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  // Test Dispatch Form
  const [testType, setTestType] = useState<NotificationEventType>("order_confirmation")
  const [testEmail, setTestEmail] = useState("aditya.sharma@example.com")
  const [testName, setTestName] = useState("Aditya Sharma")
  const [testSubmitting, setTestSubmitting] = useState(false)
  const [toastNotice, setToastNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications")
      if (res.ok) {
        const data = await res.json()
        if (data.notifications) setNotifications(data.notifications)
        if (data.summary) setSummary(data.summary)
        setLastSyncTime(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.warn("Failed to fetch notifications log:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // 3-second live sync polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications()
    }, 3000)

    const handleFocus = () => fetchNotifications()
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleFocus)
    }
  }, [fetchNotifications])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchNotifications()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleRetry = async (id: string) => {
    setRetryingId(id)
    try {
      const res = await fetch(`/api/admin/notifications/${id}/retry`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setToastNotice({ type: "success", text: `Retry completed. Status: ${data.notification?.status}` })
        await fetchNotifications()
      } else {
        setToastNotice({ type: "error", text: data.error || "Retry failed." })
      }
    } catch (err: any) {
      setToastNotice({ type: "error", text: err.message || "Failed to retry delivery." })
    } finally {
      setRetryingId(null)
      setTimeout(() => setToastNotice(null), 4000)
    }
  }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setTestSubmitting(true)
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: testType,
          recipientEmail: testEmail.trim(),
          customerName: testName.trim(),
          data: {
            orderId: "ADKT-89210",
            total: 4498,
            items: [
              { title: "280 GSM Boxy Heavyweight Tee", variant: "L / Vintage Black", quantity: 1, price: 1999 },
              { title: "Heavyweight Knit Balaclava", variant: "One Size / Black", quantity: 1, price: 2499 },
            ],
            discountCode: "WELCOME10",
            trackingNumber: "BLUEDART-992019",
            courier: "Bluedart Air Express",
            returnId: "RET-402",
            reason: "Size fit adjustment",
          },
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setToastNotice({ type: "success", text: `Test notification ${testType} dispatched to ${testEmail}` })
        setIsTesting(false)
        await fetchNotifications()
      } else {
        setToastNotice({ type: "error", text: data.error || "Failed to send test notification." })
      }
    } catch (err: any) {
      setToastNotice({ type: "error", text: err.message || "Failed to send test notification." })
    } finally {
      setTestSubmitting(false)
      setTimeout(() => setToastNotice(null), 4000)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true
    if (activeFilter === "orders") {
      return ["order_confirmation", "payment_confirmation", "payment_failure", "order_cancellation", "order_refund"].includes(n.type)
    }
    if (activeFilter === "auth") {
      return ["account_created", "email_verification", "password_reset"].includes(n.type)
    }
    if (activeFilter === "returns") {
      return ["return_approved", "return_rejected", "return_received"].includes(n.type)
    }
    if (activeFilter === "fulfillment") {
      return ["order_shipped", "order_delivered"].includes(n.type)
    }
    if (activeFilter === "marketing") {
      return n.type === "abandoned_cart"
    }
    if (activeFilter === "failed") {
      return n.status === "Failed"
    }
    return true
  })

  const columns: Column<NotificationRecord>[] = [
    {
      header: "Event & Recipient",
      accessor: (n) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
              {n.type.replace(/_/g, " ")}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              Provider: {n.provider}
            </span>
          </div>
          <div>
            <span className="font-bold text-white text-xs">{n.recipientName}</span>
            <span className="text-zinc-400 text-[11px] block font-mono">{n.recipientEmail}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Subject Line",
      accessor: (n) => (
        <div className="max-w-xs">
          <p className="text-xs font-semibold text-zinc-200 line-clamp-1">{n.subject}</p>
          {n.error && (
            <p className="text-[10px] text-red-400 font-mono line-clamp-1 mt-0.5">
              Err: {n.error}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Delivery Status",
      accessor: (n) => (
        <div className="space-y-0.5">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
              n.status === "Sent"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : n.status === "Failed"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {n.status === "Sent" ? (
              <CheckCircle className="h-3 w-3" />
            ) : n.status === "Failed" ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {n.status}
          </span>
          <p className="text-[10px] text-zinc-500 font-mono">{n.attempts} {n.attempts === 1 ? "attempt" : "attempts"}</p>
        </div>
      ),
    },
    {
      header: "Dispatched At",
      accessor: (n) => (
        <span className="text-zinc-400 text-xs font-mono">{formatDate(n.sentAt)}</span>
      ),
    },
    {
      header: "Actions",
      accessor: (n) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPreviewItem(n)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Preview rendered email"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {n.status === "Failed" && (
            <button
              onClick={() => handleRetry(n.id)}
              disabled={retryingId === n.id}
              className="px-2.5 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold transition-colors flex items-center gap-1"
              title="Retry sending notification"
            >
              <RotateCw className={`h-3 w-3 ${retryingId === n.id ? "animate-spin" : ""}`} />
              <span>Retry</span>
            </button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Communications Infrastructure
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Audit Log (3s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Transactional Notifications ({notifications.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTesting(!isTesting)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 transition-all"
          >
            <Zap className="h-4 w-4" /> {isTesting ? "Cancel" : "Send Test Notification"}
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            title={`Last synchronized at ${lastSyncTime || "now"}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
            toastNotice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {toastNotice.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{toastNotice.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Total Dispatched
          </span>
          <p className="text-3xl font-black text-white font-display">{summary.total}</p>
          <p className="text-[11px] text-zinc-500">Across 14 transactional lifecycle events</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Delivery Success Rate
          </span>
          <p className="text-3xl font-black text-emerald-400 font-display">
            {summary.deliveryRate}%
          </p>
          <p className="text-[11px] text-zinc-500">{summary.sent} successful deliveries</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Failed Dispatches
          </span>
          <p className="text-3xl font-black text-red-400 font-display">{summary.failed}</p>
          <p className="text-[11px] text-zinc-500">Retryable with automatic error log</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Active Provider
          </span>
          <p className="text-2xl font-black text-white font-display uppercase tracking-wider">
            {process.env.EMAIL_PROVIDER || "Mock Provider"}
          </p>
          <p className="text-[11px] text-zinc-500">Configured via environment variables</p>
        </div>
      </div>

      {/* Test Dispatch Form Modal */}
      {isTesting && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
              Live Dispatch Tester
            </span>
            <h3 className="text-xl font-black uppercase text-white font-display">
              Trigger Transactional Event
            </h3>
            <p className="text-xs text-zinc-400">
              Select any of the 14 transactional lifecycle events and preview real delivery.
            </p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-300">Event Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as any)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  {ALL_EVENT_TYPES.map((et) => (
                    <option key={et.type} value={et.type}>
                      [{et.group}] {et.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300">Customer Name</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTesting(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={testSubmitting}
                className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20 flex items-center gap-2"
              >
                {testSubmitting ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Dispatch Notification</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: "All Events" },
          { key: "orders", label: "Orders & Payments" },
          { key: "fulfillment", label: "Shipping & Delivery" },
          { key: "auth", label: "Customer Auth" },
          { key: "returns", label: "Returns & Exchanges" },
          { key: "marketing", label: "Abandoned Cart" },
          { key: "failed", label: "Failed Dispatches" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeFilter === tab.key
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Table */}
      <AdminDataTable
        data={filteredNotifications}
        columns={columns}
        searchPlaceholder="Search notification audits by recipient, subject, order ID..."
        filterKey={(n, q) =>
          n.recipientEmail.toLowerCase().includes(q.toLowerCase()) ||
          n.recipientName.toLowerCase().includes(q.toLowerCase()) ||
          n.subject.toLowerCase().includes(q.toLowerCase()) ||
          n.type.toLowerCase().includes(q.toLowerCase())
        }
      />

      {/* Email Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                  Email Preview Inspector
                </span>
                <h3 className="text-base font-black text-white font-display mt-0.5 truncate max-w-lg">
                  {previewItem.subject}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  To: {previewItem.recipientName} ({previewItem.recipientEmail})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-800">
                  <button
                    onClick={() => setPreviewTab("html")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      previewTab === "html" ? "bg-accent text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setPreviewTab("text")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      previewTab === "text" ? "bg-accent text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Plaintext
                  </button>
                </div>

                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/80">
              {previewTab === "html" ? (
                <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-inner">
                  <iframe
                    srcDoc={previewItem.htmlBody}
                    title="Rendered Email HTML"
                    className="w-full min-h-[480px] bg-zinc-950 border-0"
                  />
                </div>
              ) : (
                <pre className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {previewItem.textBody}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span>Dispatched: {formatDate(previewItem.sentAt)}</span>
              <span className="font-mono uppercase">Provider: {previewItem.provider}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
