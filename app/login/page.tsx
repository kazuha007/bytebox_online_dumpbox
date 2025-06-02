"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Archive, Mail, ArrowLeft, Shield, Sparkles, Lock, Eye, EyeOff, AlertTriangle, Clock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lockoutInfo, setLockoutInfo] = useState<{ isLocked: boolean; remainingTime?: string }>({ isLocked: false })
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setLockoutInfo({ isLocked: false })

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("🎉 Login successful, redirecting...")
        router.push("/dashboard")
        router.refresh()
      } else {
        if (data.accountLocked) {
          setLockoutInfo({
            isLocked: true,
            remainingTime: data.lockoutRemaining,
          })
        } else if (data.needsSignup) {
          // Redirect to signup page with email pre-filled
          router.push(`/signup?email=${encodeURIComponent(email)}`)
        } else {
          setError(data.error || "Login failed")
        }
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="p-4">
        <Button variant="ghost" onClick={() => router.push("/landing")} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </nav>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-2xl hover-lift float-animation">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center pulse-glow">
                <Archive className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">ByteBox</h1>
            </div>
            <CardTitle className="text-2xl mb-2">Access Your Secret Dumpyard</CardTitle>
            <CardDescription className="text-base">
              Enter your ByteMail and password to access your secure storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {lockoutInfo.isLocked && (
              <Alert className="mb-4" variant="destructive">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Account locked due to too many failed attempts. Try again in {lockoutInfo.remainingTime}.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 icon-bounce" />
                  ByteMail Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.secret@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12"
                    required
                    disabled={lockoutInfo.isLocked}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 icon-bounce" />
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12"
                    required
                    disabled={lockoutInfo.isLocked}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={lockoutInfo.isLocked}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 hover-lift pulse-glow"
                disabled={loading || lockoutInfo.isLocked}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Accessing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Access Dumpyard
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                <Shield className="w-5 h-5 text-green-600 icon-bounce" />
                <span className="text-green-800">Secure password-based authentication</span>
              </div>
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>
                  New to ByteBox?{" "}
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push("/signup")}>
                    Create your secret dumpyard →
                  </Button>
                </p>
                <p>
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push("/landing")}>
                    Learn more about ByteBox →
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
