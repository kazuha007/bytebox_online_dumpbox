"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Archive, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard")
        } else {
          // User is not authenticated, redirect to landing
          router.push("/landing")
        }
      } catch (error) {
        // Error checking auth, redirect to landing
        router.push("/landing")
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow float-animation">
          <Archive className="w-10 h-10 text-primary-foreground" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary icon-bounce" />
          <p className="text-xl font-medium text-gray-900">Loading ByteBox...</p>
          <Sparkles className="w-5 h-5 text-primary icon-bounce" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
