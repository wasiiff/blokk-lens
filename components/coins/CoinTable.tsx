"use client"

import { MarketCoin } from "@/types/types"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"

interface CoinTableProps {
  coins: MarketCoin[]
  favoriteIds: Set<string>
  onToggleFavorite?: (coinId: string) => void
}

export default function CoinTable({ coins, favoriteIds, onToggleFavorite }: CoinTableProps) {
  const { data: session } = useSession()

  return (
    <div className="glass-card-light rounded-xl overflow-hidden border border-white/10 dark:border-white/8">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 dark:border-border/30">
              <th className="text-left py-4 px-4 text-sm font-medium card-text-muted">#</th>
              <th className="text-left py-4 px-4 text-sm font-medium card-text-muted">Coin</th>
              <th className="text-right py-4 px-4 text-sm font-medium card-text-muted">Price</th>
              <th className="text-right py-4 px-4 text-sm font-medium card-text-muted">24h %</th>
              <th className="text-right py-4 px-4 text-sm font-medium card-text-muted hidden md:table-cell">Market Cap</th>
              <th className="text-right py-4 px-4 text-sm font-medium card-text-muted hidden lg:table-cell">Volume</th>
              {session && <th className="text-center py-4 px-4 text-sm font-medium card-text-muted w-12"></th>}
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, index) => {
              const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0
              const isFavorite = favoriteIds.has(coin.id)

              return (
                <motion.tr
                  key={coin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="border-b border-white/5 dark:border-border/20 hover:bg-white/5 dark:hover:bg-background/60 transition-colors"
                >
                  <td className="py-4 px-4 text-sm card-text-muted">
                    {coin.market_cap_rank || index + 1}
                  </td>
                  <td className="py-4 px-4">
                    <Link href={`/coins/${coin.id}`} className="flex items-center gap-3 group">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full ring-2 ring-white/20 dark:ring-border/20 group-hover:ring-primary/40 transition-all"
                      />
                      <div>
                        <p className="font-medium card-text group-hover:text-primary transition-colors">
                          {coin.name}
                        </p>
                        <p className="text-xs card-text-muted uppercase">{coin.symbol}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="card-text font-medium">
                      ${coin.current_price.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md ${
                        isPositive 
                          ? "text-green-600 dark:text-green-400 bg-green-500/10" 
                          : "text-red-600 dark:text-red-400 bg-red-500/10"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right hidden md:table-cell">
                    <span className="card-text-muted">
                      ${((coin.market_cap ?? 0) / 1e9).toFixed(2)}B
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right hidden lg:table-cell">
                    <span className="card-text-muted">
                      ${((coin.total_volume ?? 0) / 1e9).toFixed(2)}B
                    </span>
                  </td>
                  {session && (
                    <td className="py-4 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite?.(coin.id)}
                        className="h-8 w-8 p-0 hover:bg-white/10 dark:hover:bg-background/80"
                      >
                        <Star
                          className={`w-4 h-4 transition-all ${
                            isFavorite 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-white/60 dark:text-muted-foreground hover:text-white dark:hover:text-foreground"
                          }`}
                        />
                      </Button>
                    </td>
                  )}
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
