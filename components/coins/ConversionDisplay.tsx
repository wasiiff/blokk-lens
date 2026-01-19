"use client"

import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, Clock } from "lucide-react"

interface ConversionDisplayProps {
  fromCoin: { symbol: string; name: string }
  toCoin: { symbol: string; name: string }
  amount: string
  convertedAmount: number | null
  exchangeRate: number | null
  isLoading: boolean
  error?: string | null
}

export default function ConversionDisplay({
  fromCoin,
  toCoin,
  amount,
  convertedAmount,
  exchangeRate,
  isLoading,
  error,
}: ConversionDisplayProps) {
  return (
    <div className="mt-6 space-y-4">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Exchange Rate */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Exchange Rate</p>
              {isLoading ? (
                <div className="h-5 w-32 bg-muted animate-pulse rounded mt-1" />
              ) : (
                <p className="text-sm font-semibold text-foreground">
                  1 {fromCoin.symbol.toUpperCase()} = {exchangeRate ? exchangeRate.toFixed(8) : '0.00000000'} {toCoin.symbol.toUpperCase()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10 border border-primary/20"
      >
        <div className="flex items-center justify-center gap-3 text-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">You send</p>
            <p className="text-2xl font-bold text-foreground">
              {amount} {fromCoin.symbol.toUpperCase()}
            </p>
          </div>

          <ArrowRight className="w-6 h-6 text-primary" />

          <div>
            <p className="text-sm text-muted-foreground mb-1">You receive</p>
            {isLoading ? (
              <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-primary">
                {convertedAmount !== null ? convertedAmount.toFixed(8) : '0.00000000'} {toCoin.symbol.toUpperCase()}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Last Updated */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Rates updated in real-time • Cached for 30s</span>
      </div>
    </div>
  )
}
