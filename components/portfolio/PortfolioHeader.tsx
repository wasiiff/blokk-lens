'use client'

import { Copy, Check, RefreshCw, Wallet } from 'lucide-react'
import { useState } from 'react'

interface PortfolioHeaderProps {
  walletAddress: string
  onRefresh: () => void
  isRefreshing: boolean
}

export default function PortfolioHeader({
  walletAddress,
  onRefresh,
  isRefreshing,
}: PortfolioHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Title with gradient accent */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-primary via-primary/50 to-transparent rounded-full" />
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">My Portfolio</h1>
        <p className="text-muted-foreground text-base">
          Track your crypto assets across multiple blockchain networks
        </p>
      </div>

      {/* Wallet Info Card - Shadway inspired */}
      <div className="glass-card-light rounded-2xl p-5 border border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Connected Wallet</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold text-foreground">
                  {formatAddress(walletAddress)}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-5 py-2.5 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-semibold">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
