"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMarketStats } from "@/services/queries"
import { TrendingUp, DollarSign, BarChart3, Activity } from "lucide-react"
import { StatCardSkeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { useMemo } from "react"

export default function MarketStats() {
  const router = useRouter()
  
  // Single optimized query that fetches all stats at once
  const { data: marketStats, isLoading } = useQuery({
    queryKey: ["market-stats"],
    queryFn: fetchMarketStats,
    staleTime: 180000, // 3 minutes
    refetchInterval: 180000, // Auto-refetch every 3 minutes
  })

  // Generate simple sparkline data for market sentiment
  const sparklineData = useMemo(() => {
    if (!marketStats) return []
    const { calculated } = marketStats
    const sentiment = calculated.marketSentiment || 50
    
    // Generate 20 data points with some variation around the sentiment
    return Array.from({ length: 20 }, (_, i) => {
      const variation = Math.sin(i * 0.5) * 5
      return Math.max(0, Math.min(100, sentiment + variation))
    })
  }, [marketStats])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!marketStats) {
    return null
  }

  // Extract data from optimized stats
  const { global, calculated } = marketStats
  const totalMarketCap = global.totalMarketCap
  const totalVolume = global.totalVolume
  const marketCapChange = global.marketCapChange
  const avgChange = calculated.avgChange
  const topGainer = calculated.topGainer
  const marketSentiment = calculated.marketSentiment || 50

  const stats = [
    {
      label: "Total Market Cap",
      value: `$${(totalMarketCap / 1e12).toFixed(2)}T`,
      change: `${marketCapChange >= 0 ? "+" : ""}${marketCapChange.toFixed(1)}%`,
      trend: marketCapChange >= 0 ? "up" as const : "down" as const,
      icon: DollarSign,
      color: "blue",
    },
    {
      label: "24h Volume",
      value: `$${(totalVolume / 1e9).toFixed(1)}B`,
      change: avgChange >= 0 ? "Bullish" : "Bearish",
      trend: avgChange >= 0 ? "up" as const : "down" as const,
      icon: BarChart3,
      color: "purple",
    },
    {
      label: "Avg. 24h Change",
      value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`,
      change: avgChange >= 0 ? "Bullish" : "Bearish",
      trend: avgChange >= 0 ? "up" as const : "down" as const,
      icon: Activity,
      color: avgChange >= 0 ? "green" : "red",
      showGraph: true,
    },
    {
      label: "Top Gainer",
      value: topGainer?.symbol?.toUpperCase() || "N/A",
      change: topGainer ? `+${topGainer.priceChange.toFixed(1)}%` : "N/A",
      trend: "up" as const,
      icon: TrendingUp,
      color: "cyan",
      isTopGainer: true,
    },
  ]

  const colorClasses = {
    blue: { icon: "text-foreground" },
    purple: { icon: "text-foreground" },
    green: { icon: "text-foreground" },
    red: { icon: "text-foreground" },
    cyan: { icon: "text-foreground" },
  }

  return (
    <div className="space-y-4">
      {/* Data freshness indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>
            Live data from <span className="font-bold text-foreground">{calculated.coinsAnalyzed.toLocaleString()}</span> coins
            {'totalCoins' in calculated && calculated.totalCoins && calculated.totalCoins > calculated.coinsAnalyzed && (
              <span className="ml-1">
                (of {calculated.totalCoins.toLocaleString()} total)
              </span>
            )}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, idx) => {
          const colors = colorClasses[stat.color as keyof typeof colorClasses]
          const isTopGainer = stat.isTopGainer && topGainer
          const showGraph = stat.showGraph
          
          if (isTopGainer) {
            // Special card for Top Gainer with animated border
            return (
              <motion.button
                key={idx}
                onClick={() => router.push(`/coins/${topGainer.id}`)}
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer relative h-full"
              >
                {/* Animated SVG Border */}
                <svg
                  className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none z-10"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2"
                    y="2"
                    width="calc(100% - 4px)"
                    height="calc(100% - 4px)"
                    rx="12"
                    fill="none"
                    stroke="url(#blue-gradient)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  <defs>
                    <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(59,130,246)" />
                      <stop offset="50%" stopColor="rgb(147,51,234)" />
                      <stop offset="100%" stopColor="rgb(59,130,246)" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="glass-card-light rounded-xl p-5 border border-transparent transition-all duration-300 relative h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-foreground" />
                      </div>
                      {/* Coin Image next to icon */}
                      {topGainer.image && (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 shadow-sm">
                          <Image
                            src={topGainer.image}
                            alt={topGainer.name || 'Top Gainer'}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm card-text-muted mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold card-text mb-3">{stat.value}</p>
                  
                  {/* Show coins analyzed count */}
                  <p className="text-xs text-muted-foreground/60 mt-auto">
                    Based on {calculated.coinsAnalyzed.toLocaleString()} coins
                  </p>
                </div>
              </motion.button>
            )
          }
          
          // Regular stat cards with optional graph
          return (
            <motion.div
              key={idx}
              className="glass-card-light rounded-xl p-5 border border-border transition-all duration-300 relative overflow-hidden h-full flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                  stat.trend === "up" 
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" 
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm card-text-muted mb-1">{stat.label}</p>
              <p className="text-2xl font-bold card-text mb-3">{stat.value}</p>
              
              {/* Mini sparkline graph */}
              {showGraph && (
                <div className="relative h-12 mt-auto">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                  >
                    {/* Background gradient */}
                    <defs>
                      <linearGradient id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={stat.trend === "up" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={stat.trend === "up" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"} stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area under the line */}
                    <path
                      d={`M 0,40 ${sparklineData.map((value, i) => {
                        const x = (i / (sparklineData.length - 1)) * 100
                        const y = 40 - (value / 100) * 30
                        return `L ${x},${y}`
                      }).join(' ')} L 100,40 Z`}
                      fill={`url(#gradient-${idx})`}
                    />
                    
                    {/* Line */}
                    <path
                      d={`M ${sparklineData.map((value, i) => {
                        const x = (i / (sparklineData.length - 1)) * 100
                        const y = 40 - (value / 100) * 30
                        return `${x},${y}`
                      }).join(' L ')}`}
                      fill="none"
                      stroke={stat.trend === "up" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  
                  {/* Market sentiment indicator */}
                  <div className="absolute -bottom-1 right-0 text-xs text-muted-foreground">
                    {marketSentiment.toFixed(0)}% bullish
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
