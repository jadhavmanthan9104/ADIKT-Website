"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { AdminDataService, AdminProduct } from "@/lib/admin-api"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice } from "@/lib/formatters"
import { Plus, Edit2, Trash2, Eye, Filter } from "lucide-react"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>(AdminDataService.getProducts())
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.adminProducts?.length > 0) {
          setProducts(data.adminProducts)
        }
      })
      .catch(() => {})
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`/api/products/${id}`, { method: "DELETE" })
      } catch {}
      AdminDataService.deleteProduct(id)
      setProducts([...AdminDataService.getProducts()])
    }
  }

  const columns: Column<AdminProduct>[] = [
    {
      header: "Product",
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
            <Image src={p.thumbnail} alt={p.title} fill className="object-cover" />
          </div>
          <div>
            <Link
              href={`/admin/products/${p.id}`}
              className="font-bold text-white hover:text-accent transition-colors block"
            >
              {p.title}
            </Link>
            <span className="text-[11px] text-zinc-400">
              {p.category} • <strong className="text-zinc-300">{p.gsm} GSM</strong>
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (p) => {
        const isScheduledFuture =
          p.status === "scheduled" &&
          p.scheduledAt &&
          new Date(p.scheduledAt).getTime() > Date.now()

        const isScheduledLive =
          p.status === "scheduled" &&
          p.scheduledAt &&
          new Date(p.scheduledAt).getTime() <= Date.now()

        if (isScheduledFuture) {
          const dateStr = new Date(p.scheduledAt!).toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/30">
                <span>🟡</span> Scheduled
              </span>
              <p className="text-[10px] text-amber-300/80 font-mono">
                {dateStr}
              </p>
            </div>
          )
        }

        if (isScheduledLive || p.status === "published") {
          return (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Published
            </span>
          )
        }

        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-zinc-800 text-zinc-400 border-zinc-700">
            Draft
          </span>
        )
      },
    },
    {
      header: "Inventory",
      accessor: (p) => {
        const totalStock = p.variants.reduce((acc, v) => acc + v.inventory, 0)
        return (
          <div>
            <span className={`font-bold ${totalStock < 20 ? "text-amber-400" : "text-white"}`}>
              {totalStock} in stock
            </span>
            <p className="text-[11px] text-zinc-500">{p.variants.length} variants</p>
          </div>
        )
      },
    },
    {
      header: "Retail Price",
      accessor: (p) => (
        <div>
          <span className="font-bold text-white">{formatPrice(p.price)}</span>
          {p.compareAtPrice && (
            <p className="text-[11px] text-zinc-500 line-through">
              {formatPrice(p.compareAtPrice)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Collection",
      accessor: (p) => <span className="text-zinc-300 font-medium">{p.collection}</span>,
    },
    {
      header: "Actions",
      accessor: (p) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${p.handle}`}
            target="_blank"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="View Live Storefront"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/products/${p.id}`}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-accent hover:bg-zinc-800"
            title="Edit Product"
          >
            <Edit2 className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(p.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Products ({products.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl transition-colors shadow-lg shadow-accent/20"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      <AdminDataTable
        data={products}
        columns={columns}
        searchPlaceholder="Search product by title, SKU, tags..."
        filterKey={(p, q) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.category.toLowerCase().includes(q.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
        }
      />
    </div>
  )
}
