"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMarketCoins, fetchGlobalMarketData } from "@/services/queries"
import { TrendingUp, DollarSign, BarChart3, Activity } from "lucide-react"
import { StatCardSkeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"

export default function MarketStats() {
  const router = useRouter()
  
  const { data: globalData, isLoading: isGlobalLoading } = useQuery({
    queryKey: ["global-market-data"],
    queryFn: fetchGlobalMarketData,
  })

  const { data: coins, isLoading: isCoinsLoading } = useQuery({
    queryKey: ["market-coins-stats"],
    queryFn: () => fetchMarketCoins(1, 100), // Fetch top 100 for better stats
  })

  const isLoading = isGlobalLoading || isCoinsLoading

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Use global data for market cap and volume
  const totalMarketCap = globalData?.data?.total_market_cap?.usd || 0
  const totalVolume = globalData?.data?.total_volume?.usd || 0
  const marketCapChange = globalData?.data?.market_cap_change_percentage_24h_usd || 0

  // Calculate average change and top gainer from coins
  const avgChange = (coins?.reduce((acc, coin) => acc + (coin.price_change_percentage_24h || 0), 0) || 0) / (coins?.length || 1)
  const topGainer = coins?.reduce((max, coin) => 
    (coin.price_change_percentage_24h || 0) > (max.price_change_percentage_24h || 0) ? coin : max
  , coins?.[0]) || { price_change_percentage_24h: 0, symbol: "N/A" }

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
    },
    {
      label: "Top Gainer",
      value: topGainer?.symbol?.toUpperCase() || "N/A",
      change: `+${(topGainer?.price_change_percentage_24h || 0).toFixed(1)}%`,
      trend: "up" as const,
      icon: TrendingUp,
      color: "cyan",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses]
        const isTopGainer = stat.label === "Top Gainer"
        
        if (isTopGainer) {
          // Special card for Top Gainer with animated border
          return (
            <motion.button
              key={idx}
              onClick={() => router.push(`/coins/${topGainer.id}`)}
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer relative"
            >
              {/* Animated SVG Border */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
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

              <div className="glass-card-light rounded-xl p-5 border border-transparent transition-all duration-300 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-foreground" />
                    </div>
                    {/* Coin Image next to icon */}
                    {topGainer?.image && (
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
                <p className="text-2xl font-bold card-text">{stat.value}</p>
                
                {/* Subtle hint */}
                <p className="text-xs text-muted-foreground/60 mt-2 group-hover:text-primary transition-colors">
                  Click to view →
                </p>
              </div>
            </motion.button>
          )
        }
        
        // Regular stat cards
        return (
          <motion.div
            key={idx}
            className="glass-card-light rounded-xl p-5 border border-border transition-all duration-300"
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
            <p className="text-2xl font-bold card-text">{stat.value}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
