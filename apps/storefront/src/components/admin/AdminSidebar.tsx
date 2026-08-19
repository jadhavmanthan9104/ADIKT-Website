"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLogo } from "@/components/ui/BrandLogo"
import {
  LayoutDashboard,
  Package,
  Layers,
  Grid,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  Sparkles,
  RefreshCw,
  Star,
  Truck,
  CreditCard,
  Mail,
  Send,
  FileText,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  ExternalLink,
  ChevronRight,
  Compass,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string | number
}

interface NavGroup {
  group: string
  items: NavItem[]
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Reports", href: "/admin/reports", icon: FileSpreadsheet },
    ],
  },
  {
    group: "Catalog & Inventory",
    items: [
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Layers },
      { name: "Collections", href: "/admin/collections", icon: Grid },
      { name: "Inventory", href: "/admin/inventory", icon: Boxes, badge: "Low: 4" },
    ],
  },
  {
    group: "Sales & Customers",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: "4" },
      { name: "Returns", href: "/admin/returns", icon: RefreshCw, badge: "1" },
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    group: "Growth & Marketing",
    items: [
      { name: "Marketing", href: "/admin/marketing", icon: Send },
      { name: "Discounts", href: "/admin/discounts", icon: Tag },
      { name: "Segments", href: "/admin/segments", icon: Users },
      { name: "Abandoned Carts", href: "/admin/abandoned-carts", icon: ShoppingBag, badge: "3" },
      { name: "Promotions", href: "/admin/promotions", icon: Sparkles },
      { name: "Navigation", href: "/admin/navigation", icon: Compass },
      { name: "Content", href: "/admin/content", icon: FileText },
    ],
  },
  {
    group: "Operations & System",
    items: [
      { name: "Shipping", href: "/admin/shipping", icon: Truck },
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
      { name: "Notifications", href: "/admin/notifications", icon: Mail },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-all duration-300 h-screen sticky top-0 shrink-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand & Admin Badge */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" href="/admin" />
          {!collapsed && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#9A0000] text-white border border-[#9A0000] shadow-sm">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAVIGATION_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                {group.group}
              </h4>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors group relative ${
                      isActive
                        ? "bg-zinc-800/90 text-white font-bold shadow-sm shadow-black/40 border border-zinc-700/60"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/80"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? "text-[#9A0000]" : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          typeof item.badge === "string" && item.badge.includes("Low")
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-[#9A0000] text-white border border-[#9A0000] font-extrabold"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Quick Links */}
      <div className="p-3 border-t border-zinc-800/80 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-zinc-500" />
          {!collapsed && <span>View Live Storefront</span>}
        </Link>
      </div>
    </aside>
  )
}
