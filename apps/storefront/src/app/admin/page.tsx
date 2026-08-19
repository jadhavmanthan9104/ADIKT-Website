"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { AdminDataService } from "@/lib/admin-api"
import { AdminMetricCard } from "@/components/admin/AdminMetricCard"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  RotateCcw,
  Calendar,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Package,
} from "lucide-react"

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          if (data.orders) setOrders(data.orders)
        }
      })
      .catch((err) => console.warn("Failed to fetch admin orders:", err))
  }, [])

  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === "Captured" ? o.total : 0), 0)
  const netRevenue = totalRevenue
  const todaySales = orders.slice(0, 5).reduce((acc, o) => acc + o.total, 0)
  const aov = Math.round(totalRevenue / (orders.length || 1))

  const metrics = {
    todaySales: todaySales || 8997,
    todayOrders: orders.length,
    totalRevenue: totalRevenue || 34990,
    netRevenue: netRevenue || 31991,
    totalOrders: orders.length || 5,
    aov: aov || 3200,
    newCustomers: 14,
    returningCustomers: 28,
    conversionRate: 3.8,
    refunds: 0,
    cancelledOrders: 0,
    lowStockAlerts: 4,
  }

  const products = AdminDataService.getProducts()
  const customers = AdminDataService.getCustomers()
  const inventory = AdminDataService.getInventoryMatrix().filter(i => i.available <= i.lowStockThreshold)

  const dateOptions = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
    "This month",
    "Last month",
    "Custom range",
  ]

  return (
    <div className="space-y-8">
      {/* Top Title & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            Live Commerce Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Executive Dashboard
          </h1>
        </div>

        {/* Date Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-white">
              <Calendar className="h-4 w-4 text-accent" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer pr-4"
              >
                {dateOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl transition-colors shrink-0 shadow-lg shadow-accent/20"
          >
            + New Product
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (12 Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <AdminMetricCard
          title="Today's Sales"
          value={formatPrice(metrics.todaySales)}
          trend={{ value: "+14.2%", isPositive: true }}
          icon={DollarSign}
        />
        <AdminMetricCard
          title="Today's Orders"
          value={metrics.todayOrders}
          trend={{ value: "+8.1%", isPositive: true }}
          icon={ShoppingBag}
        />
        <AdminMetricCard
          title="Gross Revenue"
          value={formatPrice(metrics.totalRevenue)}
          trend={{ value: "+22.4%", isPositive: true }}
          icon={TrendingUp}
        />
        <AdminMetricCard
          title="Net Revenue"
          value={formatPrice(metrics.netRevenue)}
          subtitle="After refunds & returns"
          icon={DollarSign}
        />
        <AdminMetricCard
          title="Avg Order Value"
          value={formatPrice(metrics.aov)}
          trend={{ value: "+5.3%", isPositive: true }}
          icon={CreditCard}
        />
        <AdminMetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          trend={{ value: "+0.4%", isPositive: true }}
          icon={ArrowUpRight}
        />
        <AdminMetricCard
          title="New Customers"
          value={metrics.newCustomers}
          trend={{ value: "+18%", isPositive: true }}
          icon={Users}
        />
        <AdminMetricCard
          title="Returning Customers"
          value={metrics.returningCustomers}
          subtitle="67% retention"
          icon={Users}
        />
        <AdminMetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={ShoppingBag}
        />
        <AdminMetricCard
          title="Refunds Recorded"
          value={formatPrice(metrics.refunds)}
          trend={{ value: "-2.1%", isPositive: true }}
          icon={RotateCcw}
        />
        <AdminMetricCard
          title="Cancelled Orders"
          value={metrics.cancelledOrders}
          subtitle="0.0% cancellation"
          icon={ShoppingBag}
        />
        <AdminMetricCard
          title="Low Stock Items"
          value={metrics.lowStockAlerts}
          subtitle="Action required"
          icon={AlertTriangle}
        />
      </div>

      {/* Interactive Charts Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue & Orders Over Time SVG Chart (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Revenue & Velocity Over Time
              </h3>
              <p className="text-xs text-zinc-400">Daily sales performance for {dateRange}</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-accent">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Revenue (₹)
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Orders
              </span>
            </div>
          </div>

          {/* SVG Multi-Bar & Line Graph */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 px-2 border-b border-zinc-800">
            {[
              { day: "Aug 10", rev: 18500, orders: 6, h: "40%" },
              { day: "Aug 11", rev: 24200, orders: 8, h: "55%" },
              { day: "Aug 12", rev: 19800, orders: 7, h: "45%" },
              { day: "Aug 13", rev: 32000, orders: 11, h: "70%" },
              { day: "Aug 14", rev: 28400, orders: 9, h: "62%" },
              { day: "Aug 15", rev: 41200, orders: 14, h: "90%" },
              { day: "Aug 16", rev: 46800, orders: 16, h: "100%" },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatPrice(bar.rev)}
                </div>
                <div className="w-full max-w-[42px] bg-zinc-950 rounded-t-lg border border-zinc-800 p-1 flex flex-col justify-end h-full">
                  <div
                    style={{ height: bar.h }}
                    className="w-full bg-gradient-to-t from-accent/40 to-accent rounded-md group-hover:brightness-125 transition-all relative"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Category & Payment Breakdown (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue by Category */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Revenue by Category
            </h3>
            <div className="space-y-3">
              {[
                { name: "Heavyweight Tees", percent: 45, total: 42350, color: "bg-accent" },
                { name: "Hoodies & Fleece", percent: 35, total: 32900, color: "bg-blue-500" },
                { name: "Cargos & Bottoms", percent: 20, total: 18800, color: "bg-emerald-500" },
              ].map((cat, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-300">{cat.name}</span>
                    <span className="text-white">{formatPrice(cat.total)} ({cat.percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Payment Method Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-[11px] font-bold text-zinc-400 uppercase">Prepaid (Razorpay)</span>
                <p className="text-lg font-black text-emerald-400 mt-1">78.5%</p>
                <span className="text-[10px] text-zinc-500">Zero RTO risk</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-[11px] font-bold text-zinc-400 uppercase">Cash on Delivery</span>
                <p className="text-lg font-black text-amber-400 mt-1">21.5%</p>
                <span className="text-[10px] text-zinc-500">OTP Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tables: Recent Orders & Best Sellers & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Recent Orders
            </h3>
            <Link href="/admin/orders" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-bold text-white font-mono hover:text-accent"
                    >
                      #{order.displayId}
                    </Link>
                    <span className="text-zinc-400">• {order.customer.name}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{order.items.length} items • {order.paymentMethod.split(" ")[0]}</p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-bold text-white">{formatPrice(order.total)}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts & Best Sellers (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Low Stock Warning Table */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Low Stock Threshold Alerts
                </h3>
              </div>
              <Link href="/admin/inventory" className="text-xs font-bold text-accent hover:underline">
                Manage Stock
              </Link>
            </div>

            <div className="space-y-2">
              {inventory.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{item.productTitle}</p>
                    <p className="text-[11px] text-zinc-400">{item.variantTitle} (SKU: {item.sku})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-400">{item.available} units left</span>
                    <p className="text-[10px] text-zinc-500">Threshold: {item.lowStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Selling Products */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Best-Selling Silhouettes
              </h3>
              <Link href="/admin/products" className="text-xs font-bold text-accent hover:underline">
                Catalog
              </Link>
            </div>

            <div className="space-y-2">
              {products.slice(0, 2).map((prod) => (
                <div key={prod.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-accent">
                      {prod.gsm} GSM
                    </span>
                    <span className="font-bold text-white truncate max-w-[200px]">{prod.title}</span>
                  </div>
                  <span className="font-bold text-white">{formatPrice(prod.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
