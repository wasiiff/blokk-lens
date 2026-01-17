"use client"

import { MarketCoin } from "@/types/types"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

interface CoinCardProps {
  coin: MarketCoin
  isFavorite?: boolean
  onToggleFavorite?: (coinId: string) => void
}

export default function CoinCard({ coin, isFavorite, onToggleFavorite }: CoinCardProps) {
  const { data: session } = useSession()
  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0

  return (
    <div className="glass-card-light rounded-xl p-5 border border-white/10 dark:border-white/8 hover:border-white/20 dark:hover:border-border/80 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <Link href={`/coins/${coin.id}`} className="flex items-center gap-3 flex-1">
          <div className="relative">
            <img
              src={coin.image}
              alt={coin.name}
              className="relative w-12 h-12 rounded-full ring-2 ring-white/20 dark:ring-border group-hover:ring-primary/40 transition-all duration-300"
            />
          </div>
          <div>
            <h3 className="font-semibold card-text group-hover:text-primary transition-all duration-300">
              {coin.name}
            </h3>
            <p className="text-sm card-text-muted uppercase tracking-wider">{coin.symbol}</p>
          </div>
        </Link>
        
        {session && onToggleFavorite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(coin.id)}
            className="h-9 w-9 p-0 rounded-lg hover:bg-white/10 dark:hover:bg-background/60"
          >
            <Star
              className={`w-4 h-4 transition-all duration-300 ${
                isFavorite 
                  ? "fill-yellow-500 text-yellow-500" 
                  : "text-white/60 dark:text-muted-foreground hover:text-white dark:hover:text-foreground"
              }`}
            />
          </Button>
        )}
      </div>

      <Link href={`/coins/${coin.id}`} className="block">
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold card-text">
              ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium border ${
                isPositive 
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" 
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </div>

            {coin.market_cap_rank && (
              <span className="text-xs card-text-muted px-2 py-1 rounded-md bg-white/5 dark:bg-background border border-white/10 dark:border-border">
                #{coin.market_cap_rank}
              </span>
            )}
          </div>

          {coin.market_cap && (
            <div className="pt-3 border-t border-white/10 dark:border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs card-text-muted">Market Cap</span>
                <span className="text-sm font-medium card-text">
                  ${(coin.market_cap / 1e9).toFixed(2)}B
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
