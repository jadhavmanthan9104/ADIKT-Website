"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AdminMetricCard } from "@/components/admin/AdminMetricCard"
import { formatPrice } from "@/lib/formatters"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  RotateCcw,
  Percent,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Calendar,
  RefreshCw,
  CreditCard,
  Banknote,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Award,
  Flame,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react"
import { AnalyticsSummary, TimeframeFilter } from "@/lib/analytics/analytics-engine"

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeframeFilter["range"]>("30d")
  const [customStart, setCustomStart] = useState<string>("")
  const [customEnd, setCustomEnd] = useState<string>("")
  const [activeTab, setActiveTab] = useState<
    "overview" | "revenue" | "orders" | "products" | "customers" | "conversion" | "marketing"
  >("overview")
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    try {
      let url = `/api/admin/analytics?range=${timeframe}`
      if (timeframe === "custom" && customStart && customEnd) {
        url += `&startDate=${encodeURIComponent(customStart)}&endDate=${encodeURIComponent(customEnd)}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        if (json.analytics) {
          setData(json.analytics)
        }
      }
    } catch (err) {
      console.error("Failed to load analytics:", err)
    } finally {
      setIsLoading(false)
    }
  }, [timeframe, customStart, customEnd])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const kpis = data?.kpis

  return (
    <div className="space-y-8">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
              Enterprise Commerce Intelligence
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Database Truth
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Analytics & Growth Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time financial telemetry, conversion cohorts, and customer lifetime value.
          </p>
        </div>

        {/* Timeframe Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            {[
              { label: "Today", value: "today" },
              { label: "7 Days", value: "7d" },
              { label: "30 Days", value: "30d" },
              { label: "90 Days", value: "90d" },
              { label: "YTD", value: "ytd" },
              { label: "Custom", value: "custom" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeframe(t.value as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  timeframe === t.value
                    ? "bg-accent text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {timeframe === "custom" && (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-white text-xs"
              />
              <span className="text-zinc-500 text-xs font-mono">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-white text-xs"
              />
            </div>
          )}

          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-accent" : ""}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs (7 Domains) */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { key: "overview", label: "Overview", icon: BarChart3 },
          { key: "revenue", label: "Revenue", icon: DollarSign },
          { key: "orders", label: "Orders", icon: ShoppingBag },
          { key: "products", label: "Products", icon: Package },
          { key: "customers", label: "Customers", icon: Users },
          { key: "conversion", label: "Conversion Funnel", icon: TrendingUp },
          { key: "marketing", label: "Marketing & Carts", icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && data && (
        <div className="space-y-8 animate-in fade-in">
          {/* Executive KPI Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminMetricCard
              title="Gross Merchandise Value (GMV)"
              value={kpis?.grossRevenue.formatted || "₹0"}
              trend={{
                value: `${kpis?.grossRevenue.changePercent ?? 0 > 0 ? "+" : ""}${kpis?.grossRevenue.changePercent}% ${data.comparisonLabel}`,
                isPositive: kpis?.grossRevenue.isPositive ?? true,
              }}
              icon={DollarSign}
            />
            <AdminMetricCard
              title="Net Settled Revenue"
              value={kpis?.netRevenue.formatted || "₹0"}
              trend={{
                value: `${kpis?.netRevenue.changePercent ?? 0 > 0 ? "+" : ""}${kpis?.netRevenue.changePercent}%`,
                isPositive: kpis?.netRevenue.isPositive ?? true,
              }}
              icon={TrendingUp}
            />
            <AdminMetricCard
              title="Total Paid Orders"
              value={String(kpis?.totalOrders.value || 0)}
              trend={{
                value: `${kpis?.totalOrders.changePercent ?? 0 > 0 ? "+" : ""}${kpis?.totalOrders.changePercent}%`,
                isPositive: kpis?.totalOrders.isPositive ?? true,
              }}
              icon={ShoppingBag}
            />
            <AdminMetricCard
              title="Average Order Value (AOV)"
              value={kpis?.aov.formatted || "₹0"}
              trend={{
                value: `${kpis?.aov.changePercent ?? 0 > 0 ? "+" : ""}${kpis?.aov.changePercent}%`,
                isPositive: kpis?.aov.isPositive ?? true,
              }}
              icon={Percent}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminMetricCard
              title="Store Conversion Rate"
              value={kpis?.conversionRate.formatted || "0%"}
              trend={{
                value: `${kpis?.conversionRate.changePercent ?? 0 > 0 ? "+" : ""}${kpis?.conversionRate.changePercent}%`,
                isPositive: kpis?.conversionRate.isPositive ?? true,
              }}
              icon={Award}
            />
            <AdminMetricCard
              title="Repeat Purchase Rate"
              value={kpis?.repeatPurchaseRate.formatted || "0%"}
              trend={{
                value: `${kpis?.repeatPurchaseRate.changePercent ?? 0 > 0 ? "+" : ""}${kpis?.repeatPurchaseRate.changePercent}%`,
                isPositive: kpis?.repeatPurchaseRate.isPositive ?? true,
              }}
              icon={Users}
            />
            <AdminMetricCard
              title="Refund / Return Rate"
              value={kpis?.refundRate.formatted || "0%"}
              trend={{
                value: `${kpis?.refundRate.changePercent ?? 0 > 0 ? "+" : ""}${kpis?.refundRate.changePercent}%`,
                isPositive: kpis?.refundRate.isPositive ?? true,
              }}
              icon={RotateCcw}
            />
            <AdminMetricCard
              title="Order Cancellation Rate"
              value={kpis?.cancellationRate.formatted || "0%"}
              trend={{
                value: `${kpis?.cancellationRate.changePercent ?? 0 > 0 ? "+" : ""}${kpis?.cancellationRate.changePercent}%`,
                isPositive: kpis?.cancellationRate.isPositive ?? true,
              }}
              icon={ShieldAlert}
            />
          </div>

          {/* Revenue Daily Trend Chart Visualizer */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                  Daily Run-Rate
                </span>
                <h3 className="text-base font-black uppercase text-white font-display">
                  Daily Revenue Performance ({data.periodLabel})
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="h-3 w-3 rounded-full bg-accent inline-block" /> Gross GMV
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-3 w-3 rounded-full bg-zinc-700 inline-block" /> Orders Count
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-48 flex items-end gap-1.5 pt-6 border-b border-zinc-800">
              {data.revenueBreakdown.dailySeries.map((d, idx) => {
                const maxVal = Math.max(...data.revenueBreakdown.dailySeries.map((s) => s.gross), 1)
                const heightPercent = Math.max(Math.round((d.gross / maxVal) * 100), 8)
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative"
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded-lg text-[10px] whitespace-nowrap shadow-xl">
                        <span className="text-zinc-400 block font-mono">{d.date}</span>
                        <strong className="text-white block font-bold">{formatPrice(d.gross)}</strong>
                        <span className="text-accent block">{d.orders} orders</span>
                      </div>
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-accent/80 group-hover:bg-accent rounded-t transition-all"
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>{data.revenueBreakdown.dailySeries[0]?.date}</span>
              <span>{data.revenueBreakdown.dailySeries[Math.floor(data.revenueBreakdown.dailySeries.length / 2)]?.date}</span>
              <span>{data.revenueBreakdown.dailySeries[data.revenueBreakdown.dailySeries.length - 1]?.date}</span>
            </div>
          </div>

          {/* Top Selling Products League */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-black uppercase text-white font-display">
                Top Grossing Streetwear Silhouettes
              </h3>
              <button
                onClick={() => setActiveTab("products")}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
              >
                View Full Catalog <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <th className="pb-3 px-2">Garment Title</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2 text-right">Units Sold</th>
                    <th className="pb-3 px-2 text-right">Revenue</th>
                    <th className="pb-3 px-2 text-right">Conversion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {data.productPerformance.slice(0, 5).map((p, idx) => (
                    <tr key={p.id} className="hover:bg-zinc-950/40">
                      <td className="py-3 px-2 font-bold text-white flex items-center gap-2">
                        <span className="text-[10px] font-mono text-accent">0{idx + 1}</span>
                        <span>{p.title}</span>
                      </td>
                      <td className="py-3 px-2 uppercase font-mono text-[11px] text-zinc-400">
                        {p.category}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-zinc-300">
                        {p.unitsSold}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-white font-mono">
                        {formatPrice(p.revenue)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-400 font-mono">
                        {p.conversionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVENUE */}
      {activeTab === "revenue" && data && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Financial Breakdown
              </span>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-zinc-800">
                  <span className="text-zinc-400">Gross Merchandise Value</span>
                  <strong className="text-white font-mono">{kpis?.grossRevenue.formatted}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800">
                  <span className="text-zinc-400">Discounts & Promos Given</span>
                  <strong className="text-amber-400 font-mono">- {formatPrice(data.revenueBreakdown.totalDiscounts)}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800">
                  <span className="text-zinc-400">Customer Refunds</span>
                  <strong className="text-red-400 font-mono">- {formatPrice(data.revenueBreakdown.totalRefunds)}</strong>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-white font-bold">Net Realized Revenue</span>
                  <strong className="text-emerald-400 font-mono font-black">{kpis?.netRevenue.formatted}</strong>
                </div>
              </div>
            </div>

            {/* Payment Method Split */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 md:col-span-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Payment Channel Distribution
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-emerald-400" /> Prepaid Online (Razorpay)
                    </span>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      {100 - data.revenueBreakdown.codSharePercent}%
                    </span>
                  </div>
                  <p className="text-xl font-black text-white font-mono">
                    {formatPrice(data.revenueBreakdown.prepaidRevenue)}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Instant UPI, Cards & NetBanking settlement
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-accent" /> Cash on Delivery (COD)
                    </span>
                    <span className="text-xs font-black text-accent font-mono">
                      {data.revenueBreakdown.codSharePercent}%
                    </span>
                  </div>
                  <p className="text-xl font-black text-white font-mono">
                    {formatPrice(data.revenueBreakdown.codRevenue)}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Delivered with courier cash collection ledger sync
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === "orders" && data && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Delivered</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                {data.ordersBreakdown.delivered}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Shipped / Transit</span>
              <p className="text-2xl font-black text-blue-400 font-mono">
                {data.ordersBreakdown.shipped}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Processing</span>
              <p className="text-2xl font-black text-amber-400 font-mono">
                {data.ordersBreakdown.processing}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Cancelled</span>
              <p className="text-2xl font-black text-zinc-400 font-mono">
                {data.ordersBreakdown.cancelled}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Refunded</span>
              <p className="text-2xl font-black text-red-400 font-mono">
                {data.ordersBreakdown.refunded}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTS & CATEGORIES */}
      {activeTab === "products" && data && (
        <div className="space-y-8 animate-in fade-in">
          {/* Category Performance */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black uppercase text-white font-display">
              Category Volume & GMV Share
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {data.categoryPerformance.map((c) => (
                <div key={c.category} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono text-accent font-bold">{c.category}</span>
                  <p className="text-lg font-black text-white font-mono">{formatPrice(c.revenue)}</p>
                  <div className="flex justify-between text-[10px] text-zinc-400 border-t border-zinc-900 pt-1">
                    <span>{c.unitsSold} units</span>
                    <strong className="text-accent">{c.sharePercent}% share</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Products League */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black uppercase text-white font-display">
              Garment Performance & Turnover
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">Views</th>
                    <th className="py-3 px-3 text-right">Units Sold</th>
                    <th className="py-3 px-3 text-right">Gross GMV</th>
                    <th className="py-3 px-3 text-right">View-to-Buy %</th>
                    <th className="py-3 px-3 text-right">Return %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {data.productPerformance.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-950/40">
                      <td className="py-3.5 px-3 font-bold text-white">{p.title}</td>
                      <td className="py-3.5 px-3 uppercase font-mono text-[11px] text-zinc-400">{p.category}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-zinc-400">{p.views.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-zinc-200 font-bold">{p.unitsSold}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-white">{formatPrice(p.revenue)}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">{p.conversionRate}%</td>
                      <td className="py-3.5 px-3 text-right font-mono text-zinc-400">{p.returnRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMERS */}
      {activeTab === "customers" && data && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AdminMetricCard
              title="Registered Customers"
              value={String(data.customerPerformance.totalCustomers)}
              icon={Users}
            />
            <AdminMetricCard
              title="Repeat Purchase Rate"
              value={`${data.customerPerformance.repeatPurchaseRate}%`}
              icon={RotateCcw}
            />
            <AdminMetricCard
              title="Average Customer LTV"
              value={formatPrice(data.customerPerformance.averageLtv)}
              icon={DollarSign}
            />
            <AdminMetricCard
              title="Multi-Order VIPs"
              value={String(data.customerPerformance.customersWithMultiplePurchases)}
              icon={Award}
            />
          </div>

          {/* Top VIP Spenders */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black uppercase text-white font-display">
              Top Customer Cohort by Lifetime Spend
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3 text-right">Orders Placed</th>
                    <th className="py-3 px-3 text-right">Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {data.customerPerformance.topSpenders.map((c, i) => (
                    <tr key={i} className="hover:bg-zinc-950/40">
                      <td className="py-3.5 px-3 font-bold text-white">{c.name}</td>
                      <td className="py-3.5 px-3 text-zinc-400 font-mono">{c.email}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-zinc-300">{c.orderCount}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-accent font-mono">
                        {formatPrice(c.totalSpend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONVERSION FUNNEL */}
      {activeTab === "conversion" && data && (
        <div className="space-y-8 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                  Telemetry & Drop-off Diagnostics
                </span>
                <h3 className="text-lg font-black uppercase text-white font-display mt-0.5">
                  End-to-End eCommerce Conversion Funnel
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Overall Store CVR</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {data.conversionFunnel.overallConversionRate}%
                </span>
              </div>
            </div>

            {/* 5 Funnel Stages */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  stage: "01. Store Visits",
                  event: "page_view",
                  count: data.conversionFunnel.visits,
                  rate: "100%",
                  desc: "Unique traffic visitors",
                },
                {
                  stage: "02. Product Views",
                  event: "product_view",
                  count: data.conversionFunnel.productViews,
                  rate: `${Math.round((data.conversionFunnel.productViews / data.conversionFunnel.visits) * 100)}%`,
                  desc: "Garment page reads",
                },
                {
                  stage: "03. Added to Bag",
                  event: "add_to_cart",
                  count: data.conversionFunnel.cartAdds,
                  rate: `${Math.round((data.conversionFunnel.cartAdds / data.conversionFunnel.visits) * 100)}%`,
                  desc: "High purchase intent",
                },
                {
                  stage: "04. Began Checkout",
                  event: "begin_checkout",
                  count: data.conversionFunnel.checkouts,
                  rate: `${Math.round((data.conversionFunnel.checkouts / data.conversionFunnel.visits) * 100)}%`,
                  desc: "Address entered",
                },
                {
                  stage: "05. Purchased",
                  event: "purchase",
                  count: data.conversionFunnel.purchases,
                  rate: `${data.conversionFunnel.overallConversionRate}%`,
                  desc: "Paid & Settled Orders",
                },
              ].map((stg, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 relative overflow-hidden"
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                    {stg.stage}
                  </span>
                  <p className="text-2xl font-black text-white font-mono">{stg.count.toLocaleString()}</p>
                  <div className="pt-2 border-t border-zinc-900 flex justify-between text-xs">
                    <span className="text-zinc-500 text-[10px] font-mono">{stg.event}</span>
                    <strong className="text-accent font-bold font-mono">{stg.rate}</strong>
                  </div>
                  <p className="text-[10px] text-zinc-400">{stg.desc}</p>
                </div>
              ))}
            </div>

            {/* Dropoff Diagnoser */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300">Cart Abandonment Drop-off</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Shoppers who viewed products but exited before cart</p>
                </div>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {data.conversionFunnel.cartDropoffRate}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300">Checkout Abandonment Drop-off</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Shoppers who initiated checkout but failed payment</p>
                </div>
                <span className="text-xl font-black text-accent font-mono">
                  {data.conversionFunnel.checkoutDropoffRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MARKETING & ABANDONED CARTS */}
      {activeTab === "marketing" && data && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminMetricCard
              title="Active Promo Discounts"
              value={String(data.marketingPerformance.activeDiscounts)}
              icon={Percent}
            />
            <AdminMetricCard
              title="Coupon Redemptions"
              value={String(data.marketingPerformance.totalCouponRedemptions)}
              icon={Award}
            />
            <AdminMetricCard
              title="Abandoned Cart Recovery %"
              value={`${data.marketingPerformance.recoveryRatePercent}%`}
              icon={TrendingUp}
            />
            <AdminMetricCard
              title="Recovered Revenue"
              value={formatPrice(data.marketingPerformance.recoveredRevenue)}
              icon={DollarSign}
            />
          </div>
        </div>
      )}
    </div>
  )
}
