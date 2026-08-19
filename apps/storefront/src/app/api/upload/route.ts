import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF` },
          { status: 400 }
        )
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB limit` },
          { status: 400 }
        )
      }
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products")
    await mkdir(uploadDir, { recursive: true })

    const uploadedUrls: string[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate a unique filename: timestamp-randomhex-originalname
      const ext = path.extname(file.name) || ".jpg"
      const baseName = file.name
        .replace(ext, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase()
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${ext}`
      const filePath = path.join(uploadDir, uniqueName)

      await writeFile(filePath, buffer)

      // Return the public URL path
      uploadedUrls.push(`/uploads/products/${uniqueName}`)
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    )
  }
}
