"use client"

import { motion } from "framer-motion"
import { ArrowRight, TrendingUp } from "lucide-react"

interface PopularPairsProps {
  onPairSelect: (from: any, to: any) => void
}

const popularPairs = [
  {
    from: { id: "bitcoin", symbol: "BTC", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
    to: { id: "ethereum", symbol: "ETH", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  },
  {
    from: { id: "ethereum", symbol: "ETH", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    to: { id: "tether", symbol: "USDT", name: "Tether", image: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  },
  {
    from: { id: "bitcoin", symbol: "BTC", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
    to: { id: "tether", symbol: "USDT", name: "Tether", image: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  },
  {
    from: { id: "binancecoin", symbol: "BNB", name: "BNB", image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
    to: { id: "ethereum", symbol: "ETH", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  },
  {
    from: { id: "solana", symbol: "SOL", name: "Solana", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
    to: { id: "bitcoin", symbol: "BTC", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  },
  {
    from: { id: "cardano", symbol: "ADA", name: "Cardano", image: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
    to: { id: "ethereum", symbol: "ETH", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  },
]

export default function PopularPairs({ onPairSelect }: PopularPairsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Popular Pairs</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularPairs.map((pair, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onPairSelect(pair.from, pair.to)}
            className="group relative p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/50 transition-all hover:scale-105"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-background border-2 border-background overflow-hidden">
                    <img
                      src={pair.from.image}
                      alt={pair.from.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-background border-2 border-background overflow-hidden">
                    <img
                      src={pair.to.image}
                      alt={pair.to.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {pair.from.symbol.toUpperCase()}/{pair.to.symbol.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pair.from.name} to {pair.to.name}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-border/30"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Real-time Exchange Rates with Smart Caching</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All conversion rates are fetched in real-time from CoinGecko API and cached for 30 seconds to ensure fast performance. 
              Rates may vary slightly across different exchanges. This tool is for informational purposes only and should not be considered as financial advice.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
