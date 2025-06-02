import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { createToken, hashPassword, validatePassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    console.log(`🔐 Signup attempt for: ${email}`)

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email)
    if (existingUser && existingUser.password_set) {
      return NextResponse.json({ error: "Account already exists. Please sign in instead." }, { status: 400 })
    }

    // Hash the password
    const passwordHash = await hashPassword(password)

    let user
    if (existingUser) {
      // User exists but hasn't set password yet
      await db.setUserPassword(existingUser.id, passwordHash)
      user = await db.getUserByEmail(email)
    } else {
      // Create new user
      user = await db.createUser(email)
      await db.setUserPassword(user.id, passwordHash)
      user = await db.getUserByEmail(email)
    }

    if (!user) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

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

    console.log(`✅ Signup successful for ${email}`)

    return NextResponse.json({
      message: "Account created successfully",
      user: { id: user.id, email: user.email },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
