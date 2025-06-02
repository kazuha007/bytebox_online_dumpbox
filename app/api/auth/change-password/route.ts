import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { hashPassword, verifyPassword, validatePassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 })
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "New password does not meet requirements",
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    // Get user from database
    const dbUser = await db.getUserByEmail(user.email)
    if (!dbUser || !dbUser.password_hash) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isValidCurrentPassword = await verifyPassword(currentPassword, dbUser.password_hash)
    if (!isValidCurrentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, dbUser.password_hash)
    if (isSamePassword) {
      return NextResponse.json({ error: "New password must be different from current password" }, { status: 400 })
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword)
    await db.updatePassword(user.userId, newPasswordHash)

    console.log(`✅ Password changed successfully for ${user.email}`)

    return NextResponse.json({
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
