import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export interface JWTPayload {
  userId: number
  email: string
  exp: number
}

export async function createToken(userId: number, email: string): Promise<string> {
  return await new SignJWT({ userId, email }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<{ userId: number; email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return { userId: payload.userId, email: payload.email }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
