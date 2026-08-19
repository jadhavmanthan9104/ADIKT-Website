"use client"

import React, { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Upload, X, GripVertical, ImagePlus, Loader2, Star } from "lucide-react"

export interface UploadedImage {
  id: string
  url: string
  name: string
  size: number
  isPrimary: boolean
}

interface ProductImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
}

export function ProductImageUploader({
  images,
  onChange,
  maxImages = 10,
}: ProductImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)

      // Check capacity
      const remaining = maxImages - images.length
      if (remaining <= 0) {
        alert(`Maximum ${maxImages} images allowed.`)
        return
      }

      const toUpload = fileArray.slice(0, remaining)
      if (toUpload.length < fileArray.length) {
        alert(`Only uploading ${toUpload.length} of ${fileArray.length} files (max ${maxImages}).`)
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        toUpload.forEach((file) => formData.append("files", file))

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Upload failed")
        }

        const data = await response.json()
        const newImages: UploadedImage[] = data.urls.map(
          (url: string, idx: number) => ({
            id: `img_${Date.now()}_${idx}`,
            url,
            name: toUpload[idx].name,
            size: toUpload[idx].size,
            isPrimary: images.length === 0 && idx === 0,
          })
        )

        onChange([...images, ...newImages])
        setUploadProgress(100)
      } catch (error) {
        console.error("Upload error:", error)
        alert(error instanceof Error ? error.message : "Upload failed")
      } finally {
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      }
    },
    [images, maxImages, onChange]
  )

  // Drag-and-drop zone handlers
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

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadFiles(files)
    }
  }

  // Remove image
  const removeImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id)
    // If we removed the primary, make the first one primary
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true
    }
    onChange(filtered)
  }

  // Set primary / thumbnail
  const setPrimary = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }))
    onChange(updated)
  }

  // Reorder via drag on thumbnails
  const handleThumbDragStart = (idx: number) => {
    setDraggedIdx(idx)
  }

  const handleThumbDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  const handleThumbDragEnd = () => {
    if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
      const reordered = [...images]
      const [moved] = reordered.splice(draggedIdx, 1)
      reordered.splice(dragOverIdx, 0, moved)
      onChange(reordered)
    }
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase text-white tracking-wider">
          Product Images
        </h3>
        <span className="text-[10px] font-bold text-zinc-500 uppercase">
          {images.length} / {maxImages} Images
        </span>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
          ${
            isDragging
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 hover:bg-zinc-900/50"
          }
          ${isUploading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-accent animate-spin mb-3" />
              <p className="text-xs font-bold text-white">Uploading...</p>
              <div className="w-48 h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-zinc-800/80 mb-3">
                <ImagePlus
                  className={`h-6 w-6 ${
                    isDragging ? "text-accent" : "text-zinc-400"
                  }`}
                />
              </div>
              <p className="text-xs font-bold text-white mb-1">
                Drop product images here
              </p>
              <p className="text-[11px] text-zinc-500">
                or{" "}
                <span className="text-accent font-bold underline underline-offset-2">
                  browse files
                </span>{" "}
                — JPEG, PNG, WebP, AVIF up to 10 MB
              </p>
              <p className="text-[10px] text-zinc-600 mt-2">
                First image will be used as the storefront thumbnail
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              uploadFiles(e.target.files)
              e.target.value = ""
            }
          }}
        />
      </div>

      {/* Image Grid with drag-to-reorder */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleThumbDragStart(idx)}
              onDragOver={(e) => handleThumbDragOver(e, idx)}
              onDragEnd={handleThumbDragEnd}
              className={`
                group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200
                ${img.isPrimary ? "border-accent ring-1 ring-accent/30" : "border-zinc-800"}
                ${dragOverIdx === idx ? "border-accent/60 scale-95" : ""}
                ${draggedIdx === idx ? "opacity-40" : ""}
              `}
            >
              <Image
                src={img.url}
                alt={img.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />

              {/* Primary Badge */}
              {img.isPrimary && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-accent text-[9px] font-extrabold uppercase text-white flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-current" /> Thumbnail
                </div>
              )}

              {/* Drag Handle */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1 rounded bg-black/70 backdrop-blur-sm cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-3 w-3 text-white" />
                </div>
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  {!img.isPrimary ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPrimary(img.id)
                      }}
                      className="text-[9px] font-bold uppercase text-zinc-300 hover:text-accent flex items-center gap-0.5"
                      title="Set as storefront thumbnail"
                    >
                      <Star className="h-2.5 w-2.5" /> Set Thumbnail
                    </button>
                  ) : (
                    <span className="text-[9px] font-bold uppercase text-accent">
                      Main Image
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(img.id)
                    }}
                    className="p-1 rounded bg-red-950/80 hover:bg-red-900 text-red-400 hover:text-red-300"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-[9px] text-zinc-400 truncate mt-1">
                  {img.name} • {formatFileSize(img.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {images.length > 1 && (
        <p className="text-[10px] text-zinc-600 flex items-center gap-1">
          <GripVertical className="h-3 w-3" />
          Drag images to reorder. The image marked as{" "}
          <span className="text-accent font-bold">★ Thumbnail</span> will be the
          storefront cover photo.
        </p>
      )}
    </div>
  )
}
