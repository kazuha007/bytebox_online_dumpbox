import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { createToken, verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    console.log(`🔐 Login attempt for: ${email}`)

    // Get user
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        {
          error: "Account not found",
          needsSignup: true,
        },
        { status: 401 },
      )
    }

    // Check if user has set a password
    if (!user.password_set || !user.password_hash) {
      return NextResponse.json(
        {
          error: "Please complete your account setup",
          needsSignup: true,
        },
        { status: 401 },
      )
    }

    // Check if account is locked
    const isLocked = await db.isAccountLocked(user.id)
    if (isLocked) {
      const lockoutTime = new Date(user.lockout_until!)
      const now = new Date()
      const remainingMs = lockoutTime.getTime() - now.getTime()
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60))

      return NextResponse.json(
        {
          error: "Account temporarily locked",
          accountLocked: true,
          lockoutRemaining: `${remainingMinutes} minutes`,
        },
        { status: 423 },
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      // Increment failed attempts
      await db.incrementFailedAttempts(user.id)

      const updatedUser = await db.getUserByEmail(email)
      const failedAttempts = updatedUser!.failed_login_attempts

      if (failedAttempts >= 3) {
        // Lock the account
        await db.lockAccount(user.id)
        return NextResponse.json(
          {
            error: "Too many failed attempts. Account locked for 1 hour.",
            accountLocked: true,
            lockoutRemaining: "60 minutes",
          },
          { status: 423 },
        )
      }

      const remainingAttempts = 3 - failedAttempts
      return NextResponse.json(
        {
          error: `Invalid password. ${remainingAttempts} attempts remaining.`,
        },
        { status: 401 },
      )
    }

    // Reset failed attempts on successful login
    await db.resetFailedAttempts(user.id)
    await db.updateLastLogin(user.id)

    // Create JWT token
    const token = await createToken(user.id, user.email)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log(`✅ Login successful for ${email}`)

    return NextResponse.json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
