import React from "react"
import LoginForm from "@/components/auth/LoginForm"
import Link from "next/link"
import { TrendingUp, Shield, Star } from "lucide-react"

export const metadata = {
  title: "Sign in — CryptoPulse",
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <div className="max-w-lg">
            <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-all">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">CryptoPulse</span>
            </Link>

            <h1 className="text-4xl xl:text-5xl font-normal text-foreground mb-6 leading-tight font-serif">
              Track your crypto
              <br />
              <span className="text-primary">portfolio in real-time</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              Join thousands of traders who trust CryptoPulse for real-time market data, 
              advanced analytics, and personalized watchlists.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Real-time Data</h3>
                  <p className="text-sm text-muted-foreground">Live price updates from CoinGecko API</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Custom Watchlists</h3>
                  <p className="text-sm text-muted-foreground">Save and track your favorite coins</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
