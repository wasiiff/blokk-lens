'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

interface ChainBalance {
  chain: string
  chainId: number
  chainName: string
  symbol: string
  balance: number
  price: number
  value: number
  image?: string
  type?: 'native' | 'token'
  tokenAddress?: string | null
}

interface ChainBalanceCardProps {
  balance: ChainBalance
}

const CHAIN_COLORS: Record<string, string> = {
  bitcoin: 'from-orange-500 to-orange-600',
  ethereum: 'from-blue-500 to-blue-600',
  polygon: 'from-purple-500 to-purple-600',
  bsc: 'from-yellow-500 to-yellow-600',
  arbitrum: 'from-cyan-500 to-cyan-600',
  optimism: 'from-red-500 to-red-600',
  base: 'from-blue-400 to-blue-500',
  avalanche: 'from-red-400 to-red-500',
  fantom: 'from-blue-300 to-blue-400',
}

const CHAIN_EXPLORERS: Record<string, string> = {
  bitcoin: 'https://blockchain.info',
  ethereum: 'https://etherscan.io',
  polygon: 'https://polygonscan.com',
  bsc: 'https://bscscan.com',
  arbitrum: 'https://arbiscan.io',
  optimism: 'https://optimistic.etherscan.io',
  base: 'https://basescan.org',
  avalanche: 'https://snowtrace.io',
  fantom: 'https://ftmscan.com',
}

export default function ChainBalanceCard({ balance }: ChainBalanceCardProps) {
  const gradient = CHAIN_COLORS[balance.chain] || 'from-gray-500 to-gray-600'
  const explorerUrl = CHAIN_EXPLORERS[balance.chain]

  const formatBalance = (value: number) => {
    // Show more decimals for small amounts
    if (value === 0) return '0'
    if (value < 0.000001) return value.toExponential(2)
    if (value < 0.01) return value.toFixed(8)
    if (value < 1) return value.toFixed(6)
    if (value < 100) return value.toFixed(4)
    return value.toFixed(2)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden p-6 bg-card border border-border rounded-xl hover:shadow-xl hover:border-primary/50 transition-all"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Chain header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {balance.image ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-border/40">
                <img 
                  src={balance.image} 
                  alt={balance.symbol}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm`}>
                {balance.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{balance.chainName}</h3>
                {balance.type === 'token' && (
                  <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                    Token
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {balance.type === 'token' ? balance.symbol : `Chain ID: ${balance.chainId}`}
              </p>
            </div>
          </div>

          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="View on explorer"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          )}
        </div>

        {/* Balance info */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">
              {formatBalance(balance.balance)} {balance.symbol}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-sm font-medium">{formatCurrency(balance.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Value</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatCurrency(balance.value)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  )
}
