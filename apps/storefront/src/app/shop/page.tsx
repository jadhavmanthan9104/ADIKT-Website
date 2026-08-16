"use client"

import React, { useState, useMemo } from "react"
import { ProductCard } from "@/components/product/ProductCard"
import { SlidersHorizontal, Search } from "@/components/ui/Icons"

const ALL_PRODUCTS = [
  {
    id: "prod_1",
    title: "280 GSM Boxy Heavyweight Tee - Vintage Black",
    handle: "boxy-heavyweight-tee-vintage-black",
    thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    price: 1999,
    originalPrice: 2499,
    category: "tees",
    gsm: 280,
    fit: "Oversized Boxy",
    inStock: true,
  },
  {
    id: "prod_2",
    title: "400 GSM French Terry Drop-Shoulder Hoodie - Olive",
    handle: "french-terry-drop-shoulder-hoodie-olive",
    thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    price: 3499,
    originalPrice: 4299,
    category: "hoodies",
    gsm: 400,
    fit: "Relaxed Heavyweight",
    inStock: true,
  },
  {
    id: "prod_3",
    title: "Multi-Pocket Parachute Utility Cargo Pants - Charcoal",
    handle: "parachute-utility-cargo-pants-charcoal",
    thumbnail: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
    price: 2999,
    originalPrice: 3799,
    category: "cargos",
    gsm: 320,
    fit: "Straight Wide-Leg",
    inStock: true,
  },
  {
    id: "prod_4",
    title: "280 GSM High-Density Puff Print Tee - Bone White",
    handle: "high-density-puff-print-tee-bone-white",
    thumbnail: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    price: 2199,
    originalPrice: 2699,
    category: "tees",
    gsm: 280,
    fit: "Oversized Boxy",
    inStock: true,
  },
  {
    id: "prod_5",
    title: "400 GSM Acid Wash Zip-Up Hoodie - Washed Onyx",
    handle: "acid-wash-zip-up-hoodie-washed-onyx",
    thumbnail: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
    price: 3899,
    originalPrice: 4799,
    category: "hoodies",
    gsm: 400,
    fit: "Boxy Cropped",
    inStock: true,
  },
  {
    id: "prod_6",
    title: "Heavy Double-Knit Relaxed Sweatpants - Heather Grey",
    handle: "heavy-double-knit-relaxed-sweatpants-heather-grey",
    thumbnail: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80",
    price: 2699,
    originalPrice: 3299,
    category: "cargos",
    gsm: 380,
    fit: "Relaxed Tapered",
    inStock: true,
  },
]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedFit, setSelectedFit] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) return false
      if (selectedFit !== "all" && product.fit !== selectedFit) return false
      if (searchQuery.trim() && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price
      if (sortBy === "price_desc") return b.price - a.price
      return 0
    })
  }, [selectedCategory, selectedFit, sortBy, searchQuery])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
            The Catalog
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Showing {filteredProducts.length} engineered silhouettes
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by fabric, fit, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Items" },
            { id: "tees", label: "Heavyweight Tees" },
            { id: "hoodies", label: "Hoodies & Sweats" },
            { id: "cargos", label: "Pants & Cargos" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedCategory === cat.id
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
          >
            <option value="featured">Featured Drop</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <p className="text-lg font-bold text-white">No silhouettes matched your filters</p>
          <button
            onClick={() => {
              setSelectedCategory("all")
              setSelectedFit("all")
              setSearchQuery("")
            }}
            className="text-xs text-accent underline uppercase font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
