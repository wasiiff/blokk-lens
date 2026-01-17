"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTrendingCoins } from "@/services/queries"
import { Flame, TrendingUp } from "lucide-react"
import Link from "next/link"
import { TrendingItemSkeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export default function TrendingSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrendingCoins,
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-light rounded-xl overflow-hidden border border-white/10 dark:border-white/8"
    >
      <div className="p-5 border-b border-white/10 dark:border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-muted border border-white/20 dark:border-border flex items-center justify-center">
            <Flame className="w-5 h-5 card-text" />
          </div>
          <div>
            <h3 className="font-semibold card-text">Trending</h3>
            <p className="text-xs card-text-muted">Top 7 coins by search</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <TrendingItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {data?.coins.slice(0, 7).map((item, idx) => (
              <Link
                key={item.item.id}
                href={`/coins/${item.item.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 dark:hover:bg-background/60 transition-all duration-200 group"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? "bg-primary/20 text-primary border border-primary/30" :
                  idx === 1 ? "bg-white/10 dark:bg-muted card-text border border-white/20 dark:border-border" :
                  idx === 2 ? "bg-white/10 dark:bg-muted card-text border border-white/20 dark:border-border" :
                  "bg-white/5 dark:bg-muted card-text-muted border border-white/10 dark:border-border"
                }`}>
                  {idx + 1}
                </div>
                
                <div className="relative">
                  <img
                    src={item.item.thumb}
                    alt={item.item.name}
                    className="w-8 h-8 rounded-full ring-2 ring-white/20 dark:ring-border/20 group-hover:ring-primary/40 transition-all"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium card-text truncate group-hover:text-primary transition-all duration-300">
                    {item.item.name}
                  </p>
                  <p className="text-xs card-text-muted uppercase">
                    {item.item.symbol}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
