'use client'

import { DollarSign, Layers, TrendingUp, Coins } from 'lucide-react'
import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Balance {
  chain: string
  chainName: string
  symbol: string
  balance: number
  price: number
  value: number
  type?: 'native' | 'token'
}

interface PortfolioStatsProps {
  totalValue: number
  balances: Balance[]
}

export default function PortfolioStats({ totalValue, balances }: PortfolioStatsProps) {
  const stats = useMemo(() => {
    const uniqueChains = new Set(balances.map(b => b.chain))
    const chainCount = uniqueChains.size
    const tokenCount = balances.filter(b => b.type === 'token').length
    const nativeCount = balances.filter(b => b.type !== 'token').length
    const largestHolding = balances.reduce(
      (max, b) => (b.value > max.value ? b : max),
      balances[0]
    )

    // Calculate portfolio allocation percentage for largest holding
    const largestPercentage = ((largestHolding.value / totalValue) * 100).toFixed(1)

    return {
      chainCount,
      tokenCount,
      nativeCount,
      largestHolding,
      largestPercentage,
    }
  }, [balances, totalValue])

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const statsData = [
    {
      label: "Total Portfolio Value",
      value: formatCurrency(totalValue),
      change: "Live",
      trend: "up" as const,
      icon: DollarSign,
      color: "blue",
    },
    {
      label: "Networks",
      value: stats.chainCount.toString(),
      change: `${stats.nativeCount} native`,
      trend: "up" as const,
      icon: Layers,
      color: "purple",
    },
    {
      label: "Tokens",
      value: stats.tokenCount.toString(),
      change: "ERC-20",
      trend: "up" as const,
      icon: Coins,
      color: "cyan",
    },
    {
      label: "Largest Holding",
      value: `${stats.largestHolding.symbol}`,
      change: `${stats.largestPercentage}% of portfolio`,
      trend: "up" as const,
      icon: TrendingUp,
      color: "green",
      subValue: formatCurrency(stats.largestHolding.value),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Data freshness indicator */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
        <span>
          Live data from <span className="font-bold text-foreground">{balances.length}</span> {balances.length === 1 ? 'asset' : 'assets'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {statsData.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card-light rounded-2xl p-6 border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden h-full flex flex-col group"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                stat.trend === "up" 
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" 
                  : "bg-muted text-muted-foreground border border-border"
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-sm font-medium card-text-muted mb-2">{stat.label}</p>
            <p className="text-3xl font-bold card-text mb-1">{stat.value}</p>
            {stat.subValue && (
              <p className="text-sm font-medium text-muted-foreground mt-1">{stat.subValue}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
