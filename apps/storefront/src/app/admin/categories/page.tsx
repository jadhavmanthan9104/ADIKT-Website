"use client"

import React, { useState } from "react"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { Plus, Edit2, Trash2, Layers } from "lucide-react"

interface CategoryItem {
  id: string
  name: string
  handle: string
  description: string
  productCount: number
  status: "Active" | "Draft"
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "cat_1", name: "Heavyweight Tees", handle: "tees", description: "280–320 GSM combed cotton compact tees", productCount: 4, status: "Active" },
  { id: "cat_2", name: "Hoodies & Fleece", handle: "hoodies", description: "400 GSM French Terry drop-shoulder hoodies", productCount: 3, status: "Active" },
  { id: "cat_3", name: "Cargos & Bottoms", handle: "cargos", description: "Tactical ripstop parachute pants & modular bottoms", productCount: 3, status: "Active" },
  { id: "cat_4", name: "Sweatshirts", handle: "sweats", description: "380 GSM diagonal loopback crewneck sweatshirts", productCount: 2, status: "Active" },
]

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [isAdding, setIsAdding] = useState(false)
  const [newCat, setNewCat] = useState({ name: "", handle: "", description: "" })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCat.name) {
      setCategories([
        ...categories,
        {
          id: `cat_${Date.now()}`,
          name: newCat.name,
          handle: newCat.handle || newCat.name.toLowerCase().replace(/\s+/g, "-"),
          description: newCat.description,
          productCount: 0,
          status: "Active",
        },
      ])
      setIsAdding(false)
      setNewCat({ name: "", handle: "", description: "" })
    }
  }

  const columns: Column<CategoryItem>[] = [
    {
      header: "Category Name",
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-accent">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-white block">{c.name}</span>
            <span className="text-[11px] font-mono text-zinc-500">/{c.handle}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Description",
      accessor: (c) => <span className="text-zinc-400">{c.description}</span>,
    },
    {
      header: "Assigned Products",
      accessor: (c) => <span className="font-bold text-white">{c.productCount} pieces</span>,
    },
    {
      header: "Status",
      accessor: (c) => (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {c.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (c) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg text-zinc-400 hover:text-accent hover:bg-zinc-800">
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCategories(categories.filter((cat) => cat.id !== c.id))}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
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
            Catalog Hierarchy
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Categories ({categories.length})
          </h1>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase rounded-xl shadow-lg shadow-accent/20"
        >
          <Plus className="h-4 w-4" /> {isAdding ? "Cancel" : "Add Category"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 max-w-xl">
          <h3 className="text-sm font-bold uppercase text-white tracking-wider">
            Create New Category
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Category Name *</label>
              <input
                type="text"
                required
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Handle / URL Slug</label>
              <input
                type="text"
                value={newCat.handle}
                onChange={(e) => setNewCat({ ...newCat, handle: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Description</label>
              <input
                type="text"
                value={newCat.description}
                onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-white text-black font-extrabold uppercase rounded-lg text-xs"
          >
            Save Category
          </button>
        </form>
      )}

      <AdminDataTable
        data={categories}
        columns={columns}
        searchPlaceholder="Search categories..."
        filterKey={(c, q) => c.name.toLowerCase().includes(q.toLowerCase())}
      />
    </div>
  )
}
