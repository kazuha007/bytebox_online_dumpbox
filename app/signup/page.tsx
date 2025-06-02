"use client"

import React, { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Archive, Mail, ArrowLeft, Shield, Sparkles, Lock, Eye, EyeOff, CheckCircle, X } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get email from URL params if redirected from login
  React.useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const validatePassword = (pwd: string) => {
    const errors: string[] = []

    if (pwd.length < 8) {
      errors.push("At least 8 characters long")
    }

    if (!/[a-zA-Z]/.test(pwd)) {
      errors.push("Contains at least one letter")
    }

    if (!/[0-9]/.test(pwd)) {
      errors.push("Contains at least one number")
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) {
      errors.push("Contains at least one special character")
    }

    setPasswordErrors(errors)
    return errors.length === 0
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    if (newPassword) {
      validatePassword(newPassword)
    } else {
      setPasswordErrors([])
    }
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!validatePassword(password)) {
      setError("Please fix the password requirements")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("🎉 Signup successful, redirecting...")
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(data.error || "Signup failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const checks = [
      password.length >= 8,
      /[a-zA-Z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    ]
    return checks.filter(Boolean).length
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="p-4">
        <Button variant="ghost" onClick={() => router.push("/login")} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Button>
      </nav>

      {/* Signup Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-2xl hover-lift float-animation">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center pulse-glow">
                <Archive className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">ByteBox</h1>
            </div>
            <CardTitle className="text-2xl mb-2">Create Your Secret Dumpyard</CardTitle>
            <CardDescription className="text-base">
              Set up your ByteMail and secure password to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
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
                    placeholder="Create a secure password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="pl-12 pr-12 h-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength === 1
                              ? "w-1/4 bg-red-500"
                              : passwordStrength === 2
                                ? "w-2/4 bg-orange-500"
                                : passwordStrength === 3
                                  ? "w-3/4 bg-yellow-500"
                                  : passwordStrength === 4
                                    ? "w-full bg-green-500"
                                    : "w-0"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {passwordStrength === 4 ? "Strong" : passwordStrength >= 2 ? "Medium" : "Weak"}
                      </span>
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-1">
                      {[
                        { text: "At least 8 characters long", valid: password.length >= 8 },
                        { text: "Contains at least one letter", valid: /[a-zA-Z]/.test(password) },
                        { text: "Contains at least one number", valid: /[0-9]/.test(password) },
                        {
                          text: "Contains at least one special character",
                          valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
                        },
                      ].map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {req.valid ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-red-500" />
                          )}
                          <span className={req.valid ? "text-green-600" : "text-red-600"}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 icon-bounce" />
                  Confirm Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 h-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 hover-lift pulse-glow"
                disabled={loading || passwordStrength < 4 || password !== confirmPassword}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create My Dumpyard
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                <Shield className="w-5 h-5 text-blue-600 icon-bounce" />
                <span className="text-blue-800">Your password is encrypted and stored securely</span>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Already have a ByteMail?{" "}
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push("/login")}>
                    Sign in here →
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
