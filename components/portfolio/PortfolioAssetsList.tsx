'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useMemo } from 'react'

interface Balance {
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

interface PortfolioAssetsListProps {
  balances: Balance[]
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

export default function PortfolioAssetsList({ balances }: PortfolioAssetsListProps) {
  const groupedBalances = useMemo(() => {
    // Group by chain
    const groups: Record<string, Balance[]> = {}
    balances.forEach((balance) => {
      if (!groups[balance.chain]) {
        groups[balance.chain] = []
      }
      groups[balance.chain].push(balance)
    })

    // Sort each group by value
    Object.keys(groups).forEach((chain) => {
      groups[chain].sort((a, b) => b.value - a.value)
    })

    // Sort chains by total value
    return Object.entries(groups).sort((a, b) => {
      const totalA = a[1].reduce((sum, item) => sum + item.value, 0)
      const totalB = b[1].reduce((sum, item) => sum + item.value, 0)
      return totalB - totalA
    })
  }, [balances])

  const formatBalance = (value: number) => {
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
    <div className="space-y-6">
      {groupedBalances.map(([chain, assets], chainIndex) => {
        const chainTotal = assets.reduce((sum, asset) => sum + asset.value, 0)
        const gradient = CHAIN_COLORS[chain] || 'from-gray-500 to-gray-600'
        const explorerUrl = CHAIN_EXPLORERS[chain]

        return (
          <motion.div
            key={chain}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: chainIndex * 0.1 }}
            className="glass-card-light rounded-2xl border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
          >
            {/* Chain Header */}
            <div className="p-5 border-b border-border/60 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {assets[0].image ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-border/40">
                      <img 
                        src={assets[0].image} 
                        alt={assets[0].chainName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
                      {assets[0].chainName.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{assets[0].chainName}</h3>
                    <p className="text-xs font-medium text-muted-foreground">
                      {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Total Value</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(chainTotal)}</p>
                </div>
              </div>
            </div>

            {/* Assets List */}
            <div className="divide-y divide-border/60">
              {assets.map((asset, assetIndex) => (
                <div
                  key={`${asset.chain}-${asset.symbol}-${assetIndex}`}
                  className="p-5 hover:bg-muted/30 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Asset Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {asset.image ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-border/40 group-hover:scale-110 transition-transform duration-300">
                          <img 
                            src={asset.image} 
                            alt={asset.symbol}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          {asset.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-foreground text-base">{asset.symbol}</p>
                          {asset.type === 'token' && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-primary/20 text-primary rounded-lg border border-primary/20">
                              Token
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatBalance(asset.balance)} {asset.symbol}
                        </p>
                      </div>
                    </div>

                    {/* Price & Value */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-muted-foreground mb-1">
                        {formatCurrency(asset.price)}
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(asset.value)}
                      </p>
                    </div>

                    {/* Explorer Link */}
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="View on explorer"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
