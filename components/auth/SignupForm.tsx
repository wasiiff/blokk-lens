"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { signupSchema } from "@/lib/validators/auth"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react"

type FormData = z.infer<typeof signupSchema>

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(signupSchema) })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function onSubmit(data: FormData) {
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json?.error || "Unable to register")
        return
      }

      setSuccess("Account created successfully!")
      setTimeout(() => router.push("/auth/login"), 1500)
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="glass-card-light rounded-xl p-8 relative overflow-hidden">
        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-semibold card-text mb-2">Create account</h1>
            <p className="card-text-muted text-sm">Start tracking your favorite cryptocurrencies</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium card-text">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 card-text-muted group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <Input 
                  className="pl-12 h-12 bg-white/5 dark:bg-background border-white/20 dark:border-border focus:border-primary/50 rounded-xl transition-all card-text" 
                  type="text" 
                  placeholder="John Doe" 
                  {...register("name")} 
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium card-text">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 card-text-muted group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <Input 
                  className="pl-12 h-12 bg-white/5 dark:bg-background border-white/20 dark:border-border focus:border-primary/50 rounded-xl transition-all card-text" 
                  type="email" 
                  placeholder="you@company.com" 
                  {...register("email")} 
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium card-text">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 card-text-muted group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  className="pl-12 pr-12 h-12 bg-white/5 dark:bg-background border-white/20 dark:border-border focus:border-primary/50 rounded-xl transition-all card-text"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 card-text-muted hover:text-white dark:hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-sm transition-all duration-300" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10 dark:border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs card-text-muted bg-black/60 dark:bg-muted/50">or continue with</span>
              </div>
            </div>

            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-white/5 dark:bg-background border-white/20 dark:border-border hover:bg-white/10 dark:hover:bg-muted hover:border-white/30 dark:hover:border-border/80 rounded-xl transition-all"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="card-text">Continue with Google</span>
            </Button>

            {/* Sign in link */}
            <p className="text-center text-sm card-text-muted mt-6">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
