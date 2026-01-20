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
          // Special card for Top Gainer with shadway-style design
          return (
            <motion.button
              key={idx}
              onClick={() => router.push(`/coins/${topGainer.id}`)}
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer col-span-1 sm:col-span-2 lg:col-span-1"
            >
              <div className="relative h-full w-full">
                {/* Featured badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-sm shadow-green-500/40">
                    Top Gainer
                  </span>
                </div>

                {/* Main SVG Border with geometric elements */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Main border rectangle */}
                  <rect
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    rx="3"
                    stroke="url(#green-gradient)"
                    strokeWidth="0.9"
                    strokeDasharray="4 2"
                    fill="none"
                    className="opacity-60"
                  />

                  {/* Corner geometric elements */}
                  <g className="opacity-40">
                    {/* Top-left corner */}
                    <line x1="0" y1="8" x2="8" y2="8" stroke="rgb(34,197,94)" strokeWidth="0.3" />
                    <line x1="8" y1="0" x2="8" y2="8" stroke="rgb(34,197,94)" strokeWidth="0.3" />

                    {/* Top-right corner */}
                    <line x1="92" y1="0" x2="92" y2="8" stroke="rgb(34,197,94)" strokeWidth="0.3" />
                    <line x1="92" y1="8" x2="100" y2="8" stroke="rgb(34,197,94)" strokeWidth="0.3" />

                    {/* Bottom-left corner */}
                    <line x1="0" y1="92" x2="8" y2="92" stroke="rgb(34,197,94)" strokeWidth="0.3" />
                    <line x1="8" y1="92" x2="8" y2="100" stroke="rgb(34,197,94)" strokeWidth="0.3" />

                    {/* Bottom-right corner */}
                    <line x1="92" y1="92" x2="100" y2="92" stroke="rgb(34,197,94)" strokeWidth="0.3" />
                    <line x1="92" y1="92" x2="92" y2="100" stroke="rgb(34,197,94)" strokeWidth="0.3" />
                  </g>

                  {/* Grid pattern overlay */}
                  <defs>
                    <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(34,197,94)" />
                      <stop offset="50%" stopColor="rgb(16,185,129)" />
                      <stop offset="100%" stopColor="rgb(5,150,105)" />
                    </linearGradient>
                    <pattern id="green-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgb(34,197,94)" strokeWidth="0.2" className="opacity-20" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#green-grid)" className="opacity-30" />
                </svg>

                {/* Card Content */}
                <div className="relative h-full w-full p-1">
                  <div className="h-full w-full bg-muted/50 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 flex flex-col border border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.35)] bg-gradient-to-br from-green-500/10 via-green-500/5 to-background/80 dark:from-green-500/25 dark:via-green-500/15 dark:to-background/40">
                    
                    {/* Coin Image Section */}
                    <div className="relative h-24 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                      {topGainer?.image && (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500/50 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                          <Image
                            src={topGainer.image}
                            alt={topGainer.name || 'Top Gainer'}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-4 flex flex-col relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                          {stat.change}
                        </span>
                      </div>
                      
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {stat.value}
                      </p>
                      
                      {topGainer?.name && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                          {topGainer.name}
                        </p>
                      )}
                      
                      <div className="mt-auto">
                        <div className="inline-flex items-center justify-center gap-2 w-full h-8 px-3 text-sm font-medium bg-green-500/10 hover:bg-green-500 hover:text-white border border-green-500/30 rounded-md transition-all duration-200 group/btn">
                          <span>View Details</span>
                          <TrendingUp className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
