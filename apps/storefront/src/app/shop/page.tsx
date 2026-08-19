"use client"

import React, { useState, useMemo, useEffect } from "react"
import { ProductCard } from "@/components/product/ProductCard"
import { SlidersHorizontal, Search, X } from "@/components/ui/Icons"
import { EmptyState } from "@/components/ui/EmptyState"
import { StoreProduct } from "@/lib/store-api"
import { productStore } from "@/lib/product-store"

export default function ShopPage() {
  const [products, setProducts] = useState<StoreProduct[]>(() => productStore.getAllStoreProducts())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedGsm, setSelectedGsm] = useState<number | "all">("all")
  const [selectedSize, setSelectedSize] = useState<string>("all")
  const [maxPrice, setMaxPrice] = useState<number>(5000)
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false)
  const [displayCount, setDisplayCount] = useState<number>(12)

  useEffect(() => {
    // 1. Subscribe to in-memory store changes
    const unsubscribe = productStore.subscribe(() => {
      setProducts(productStore.getAllStoreProducts())
    })

    // 2. Fetch latest persisted catalog from server
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.storeProducts?.length > 0) {
          setProducts(data.storeProducts)
        }
      })
      .catch(() => {})

    return unsubscribe
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) return false
      if (selectedGsm !== "all" && product.gsm !== selectedGsm) return false
      if (selectedSize !== "all" && !product.sizes.some((s) => s.size === selectedSize && s.inStock)) {
        return false
      }
      if (product.price > maxPrice) return false
      if (inStockOnly && !product.inStock) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = product.title.toLowerCase().includes(q)
        const matchesFabric = product.fabric.toLowerCase().includes(q)
        const matchesFit = product.fit.toLowerCase().includes(q)
        if (!matchesTitle && !matchesFabric && !matchesFit) return false
      }
      return true
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price
      if (sortBy === "price_desc") return b.price - a.price
      if (sortBy === "newest") return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0)
      return 0
    })
  }, [products, selectedCategory, selectedGsm, selectedSize, maxPrice, inStockOnly, sortBy, searchQuery])

  const visibleProducts = filteredProducts.slice(0, displayCount)
  const hasMore = displayCount < filteredProducts.length

  const resetFilters = () => {
    setSelectedCategory("all")
    setSelectedGsm("all")
    setSelectedSize("all")
    setMaxPrice(5000)
    setInStockOnly(false)
    setSearchQuery("")
    setSortBy("featured")
  }

  const isFiltered =
    selectedCategory !== "all" ||
    selectedGsm !== "all" ||
    selectedSize !== "all" ||
    maxPrice < 5000 ||
    inStockOnly ||
    searchQuery.trim() !== ""

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#9A0000]">
            Master Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            The Catalog
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Showing {filteredProducts.length} engineered silhouettes
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by fabric, fit, GSM, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#9A0000]"
          />
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 self-start sticky top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#9A0000]" /> Filter Silhouettes
            </h3>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-[#9A0000] hover:underline uppercase"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Category</h4>
            <div className="space-y-1">
              {[
                { id: "all", label: "All Items" },
                { id: "tees", label: "Heavyweight Tees" },
                { id: "hoodies", label: "French Terry Hoodies" },
                { id: "cargos", label: "Parachute Cargos" },
                { id: "sweats", label: "Sweatpants & Bottoms" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex justify-between items-center ${
                    selectedCategory === cat.id
                      ? "bg-[#9A0000] text-white font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* GSM Filter */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Fabric Weight (GSM)</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { gsm: "all" as const, label: "All GSM" },
                { gsm: 280, label: "280 GSM" },
                { gsm: 320, label: "320 GSM" },
                { gsm: 380, label: "380 GSM" },
                { gsm: 400, label: "400 GSM" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setSelectedGsm(item.gsm)}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold uppercase border transition-colors ${
                    selectedGsm === item.gsm
                      ? "border-[#9A0000] bg-[#9A0000] text-white shadow-sm"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Size Availability</h4>
            <div className="grid grid-cols-5 gap-1">
              {["all", "S", "M", "L", "XL", "XXL"].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-1.5 rounded text-xs font-bold uppercase border transition-colors ${
                    selectedSize === sz
                      ? "border-[#9A0000] bg-[#9A0000] text-white shadow-sm"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                  }`}
                >
                  {sz === "all" ? "All" : sz}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Filter */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <div className="flex justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-zinc-300">Max Price</span>
              <span className="font-bold text-white">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={1500}
              max={5000}
              step={200}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* In Stock Toggle */}
          <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between">
            <label htmlFor="in-stock" className="text-xs font-bold uppercase tracking-wider text-zinc-300 cursor-pointer">
              In Stock Only
            </label>
            <input
              id="in-stock"
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4 rounded accent-accent bg-zinc-800 border-zinc-700 cursor-pointer"
            />
          </div>
        </aside>

        {/* Right Content Area (Catalog Grid) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Bar: Sort + Mobile Filter Toggle (Clean Minimal Layout Without Outer Box or White Fill) */}
          <div className="flex items-center justify-between gap-4 pb-2">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white rounded-lg text-xs font-bold uppercase transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#9A0000]" /> Filters {isFiltered ? "(Active)" : ""}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#9A0000] font-bold cursor-pointer transition-colors"
              >
                <option value="featured" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Featured Drop</option>
                <option value="newest" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Newest Releases</option>
                <option value="price_asc" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {visibleProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 6)}
                    className="px-8 py-3.5 rounded-xl border border-zinc-700 hover:border-white bg-zinc-900 text-white font-extrabold text-xs uppercase tracking-wider transition-colors"
                  >
                    Load More Silhouettes ({filteredProducts.length - visibleProducts.length} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No Silhouettes Matched Your Filters"
              description="Try broadening your price range, choosing all GSM options, or clearing the search keyword."
              actionLabel="Reset Filters"
              onAction={resetFilters}
            />
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-zinc-950 border-l border-zinc-800 text-white p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Filters</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-zinc-400">Category</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["all", "tees", "hoodies", "cargos", "sweats"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-2 px-3 rounded text-xs font-bold uppercase border text-center ${
                          selectedCategory === cat
                            ? "bg-[#9A0000] text-white border-[#9A0000] shadow-sm"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile GSM */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-zinc-400">GSM Weight</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["all", 280, 320, 380, 400].map((g) => (
                      <button
                        key={String(g)}
                        onClick={() => setSelectedGsm(g as any)}
                        className={`py-2 px-3 rounded text-xs font-bold uppercase border text-center ${
                          selectedGsm === g
                            ? "bg-[#9A0000] text-white border-[#9A0000] shadow-sm"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        {g === "all" ? "All GSM" : `${g} GSM`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-white text-black font-extrabold uppercase rounded-lg text-xs"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
                {isFiltered && (
                  <button
                    onClick={resetFilters}
                    className="w-full py-2.5 text-zinc-400 font-bold uppercase text-xs hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
