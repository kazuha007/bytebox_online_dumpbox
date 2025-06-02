import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  console.log("🚀 Dump file upload request received")

  try {
    const user = await getCurrentUser()
    console.log("👤 Current user:", user)

    if (!user) {
      console.log("❌ No authenticated user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("❌ No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("📁 Dump file details:", {
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    })

    // Convert File to ArrayBuffer for proper upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Generate unique filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split(".").pop() || ""
    const filename = `dump-${timestamp}-${randomSuffix}.${fileExtension}`

    console.log("🏷️ Generated filename:", filename)

    // Upload to Vercel Blob with proper options
    console.log("☁️ Uploading dump file to Vercel Blob...")
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    })

    console.log("✅ Blob upload successful:", blob.url)

    // Save file metadata to database
    console.log("💾 Saving dump file metadata to database...")
    const fileRecord = await db.createFile(
      user.userId,
      filename,
      file.name,
      file.size,
      file.type || "application/octet-stream",
      blob.url,
    )

    console.log("✅ Dump file record created:", fileRecord.id)

    const responseData = {
      message: "Dump file uploaded successfully",
      file: {
        id: fileRecord.id,
        name: fileRecord.original_filename,
        size: fileRecord.size,
        type: fileRecord.mimetype,
        url: fileRecord.storage_url,
        uploadDate: fileRecord.created_at,
      },
    }

    console.log("🎉 Upload complete, sending response")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("💥 Upload error:", error)

    // Provide more specific error messages
    let errorMessage = "Upload failed"
    if (error instanceof Error) {
      if (error.message.includes("content-length")) {
        errorMessage = "File upload failed due to size restrictions"
      } else if (error.message.includes("unauthorized")) {
        errorMessage = "Authentication required"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
