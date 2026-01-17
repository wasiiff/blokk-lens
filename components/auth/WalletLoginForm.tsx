"use client"

import React from "react"
import { Logo } from "@/components/ui/logo"
import WalletConnectButton from "./WalletConnectButton"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function WalletLoginForm() {
  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="glass-card-light rounded-xl p-8 border border-white/10 dark:border-white/8 relative overflow-hidden">
        {/* Content */}
        <div className="relative">
          {/* Back Button */}
          <Link 
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm card-text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in options
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-semibold card-text mb-2">Connect Your Wallet</h1>
            <p className="card-text-muted text-sm">
              Sign in securely with MetaMask, Trust Wallet, or Coinbase
            </p>
          </div>

          {/* Wallet Connect */}
          <div className="space-y-4">
            <WalletConnectButton />

            {/* Info */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs card-text-muted text-center">
                Your wallet will be used to sign in. No transaction required.
              </p>
            </div>

            {/* Supported Wallets */}
            <div className="pt-4 border-t border-white/10 dark:border-border">
              <p className="text-xs card-text-muted text-center mb-3">Supported Wallets</p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-white/5 dark:bg-background border border-white/10 dark:border-border flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                      <path d="M8 16L20 8l12 8v16L20 40 8 32V16z" fill="#F6851B"/>
                    </svg>
                  </div>
                  <span className="text-xs card-text-muted">MetaMask</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-white/5 dark:bg-background border border-white/10 dark:border-border flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="12" fill="#3375BB"/>
                    </svg>
                  </div>
                  <span className="text-xs card-text-muted">Trust</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-white/5 dark:bg-background border border-white/10 dark:border-border flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="12" fill="#0052FF"/>
                    </svg>
                  </div>
                  <span className="text-xs card-text-muted">Coinbase</span>
                </div>
              </div>
            </div>

            {/* Supported Chains */}
            <div className="pt-4 border-t border-white/10 dark:border-border">
              <p className="text-xs card-text-muted text-center mb-3">Supported Networks</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'Base'].map((chain) => (
                  <span 
                    key={chain}
                    className="px-2 py-1 rounded-md bg-white/5 dark:bg-background border border-white/10 dark:border-border text-xs card-text-muted"
                  >
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
