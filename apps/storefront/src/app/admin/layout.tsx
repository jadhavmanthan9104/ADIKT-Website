"use client"

import React from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminThemeProvider } from "@/components/providers/AdminThemeContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-100 antialiased selection:bg-accent selection:text-white">
        {/* 18-Module Categorized Sidebar */}
        <AdminSidebar />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  )
}
