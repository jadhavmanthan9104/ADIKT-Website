"use client"

import React, { useState } from "react"
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"

export interface Column<T> {
  header: string
  accessor: (item: T) => React.ReactNode
  sortKey?: keyof T | string
  className?: string
}

interface AdminDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  filterKey?: (item: T, query: string) => boolean
  actions?: React.ReactNode
  emptyMessage?: string
  pageSize?: number
}

export function AdminDataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  filterKey,
  actions,
  emptyMessage = "No records found.",
  pageSize = 10,
}: AdminDataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = filterKey && query
    ? data.filter((item) => filterKey(item, query))
    : data

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800/90 overflow-hidden space-y-0">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent"
          />
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3.5 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-zinc-800/40 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3.5 px-4 ${col.className || ""}`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-xs text-zinc-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div>
          Showing{" "}
          <strong className="text-white">
            {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{" "}
          to{" "}
          <strong className="text-white">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </strong>{" "}
          of <strong className="text-white">{filteredData.length}</strong> results
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-bold text-white px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
