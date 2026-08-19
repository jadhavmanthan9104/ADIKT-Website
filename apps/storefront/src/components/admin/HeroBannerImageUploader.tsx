"use client"

import React, { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Upload, ImagePlus, Loader2, X, RefreshCw, Eye, Sparkles, Check } from "lucide-react"

interface HeroBannerImageUploaderProps {
  currentImageUrl: string
  onChange: (url: string) => void
}

export function HeroBannerImageUploader({
  currentImageUrl,
  onChange,
}: HeroBannerImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append("files", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Failed to upload image")
        }

        const data = await response.json()
        if (data.urls && data.urls.length > 0) {
          onChange(data.urls[0])
          setUploadProgress(100)
        }
      } catch (error) {
        console.error("Hero banner upload error:", error)
        alert(error instanceof Error ? error.message : "Image upload failed")
      } finally {
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 400)
      }
    },
    [onChange]
  )

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            Homepage Hero Backdrop Image
          </label>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Upload high-resolution editorial photography (16:9 or 21:9 ratio recommended, up to 10 MB)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-accent hover:underline"
        >
          {showUrlInput ? "Hide URL input" : "Or enter URL manually"}
        </button>
      </div>

      {/* Manual URL Input (Collapsible) */}
      {showUrlInput && (
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 animate-in fade-in duration-150">
          <label className="text-[10px] uppercase font-bold text-zinc-400">Direct Image URL</label>
          <input
            type="text"
            value={currentImageUrl}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
          />
        </div>
      )}

      {/* Main Image Upload / Preview Area */}
      {currentImageUrl ? (
        <div className="relative aspect-[16/7] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
          <Image
            src={currentImageUrl}
            alt="Hero Banner Preview"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 80vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold uppercase text-white tracking-widest border border-white/10 flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-400" /> Active Hero Banner
              </span>

              <button
                type="button"
                onClick={() => onChange("")}
                className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/50 transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-extrabold uppercase shadow-lg transition-transform active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Upload New Image
              </button>
              <a
                href={currentImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-sm border border-white/20 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" /> Full Resolution
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
            ${
              isDragging
                ? "border-accent bg-accent/10 scale-[1.01]"
                : "border-zinc-700 hover:border-zinc-500 bg-zinc-950/60 hover:bg-zinc-900/60"
            }
            ${isUploading ? "pointer-events-none opacity-70" : ""}
          `}
        >
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-9 w-9 text-accent animate-spin mb-3" />
                <p className="text-xs font-bold text-white">Uploading Hero Banner...</p>
                <div className="w-48 h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-zinc-800/80 mb-3 border border-zinc-700">
                  <ImagePlus className={`h-7 w-7 ${isDragging ? "text-accent" : "text-zinc-400"}`} />
                </div>
                <p className="text-xs font-bold text-white mb-1">
                  Click to browse or drag & drop hero banner photo
                </p>
                <p className="text-[11px] text-zinc-400">
                  Supports JPEG, PNG, WebP, AVIF — High Resolution recommended
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0])
            e.target.value = ""
          }
        }}
      />
    </div>
  )
}
