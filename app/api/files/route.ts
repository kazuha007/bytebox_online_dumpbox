import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  console.log("📋 Files list request received")

  try {
    const user = await getCurrentUser()
    console.log("👤 Current user for files:", user)

    if (!user) {
      console.log("❌ No authenticated user for files request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const files = await db.getUserFiles(user.userId)
    console.log(`📁 Found ${files.length} files for user ${user.userId}`)

    const formattedFiles = files.map((file) => ({
      id: file.id,
      name: file.original_filename,
      size: file.size,
      type: file.mimetype,
      url: file.storage_url,
      uploadDate: file.created_at,
    }))

    console.log("✅ Returning formatted files")
    return NextResponse.json({ files: formattedFiles })
  } catch (error) {
    console.error("💥 Get files error:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}
