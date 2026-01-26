'use client'

import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Wallet } from 'lucide-react'

// Dynamic imports to avoid SSR issues
const PortfolioStats = dynamic(() => import('./PortfolioStats'), { ssr: false })
const PortfolioChart = dynamic(() => import('./PortfolioChart'), { ssr: false })
const PortfolioAssetsList = dynamic(() => import('./PortfolioAssetsList'), { ssr: false })
const PortfolioLoading = dynamic(() => import('./PortfolioLoading'), { ssr: false })
const WalletConnectPrompt = dynamic(() => import('./WalletConnectPrompt'), { ssr: false })
const PortfolioHeader = dynamic(() => import('./PortfolioHeader'), { ssr: false })

interface PortfolioData {
  walletAddress: string
  totalValue: number
  balances: Array<{
    chain: string
    chainId: number
    chainName: string
    symbol: string
    balance: number
    price: number
    value: number
    coingeckoId: string
    image?: string
    type?: 'native' | 'token'
    tokenAddress?: string | null
  }>
  timestamp: string
}

export default function PortfolioClient() {
  const { address, isConnected } = useAccount()

  const {
    data: portfolio,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<PortfolioData>({
    queryKey: ['portfolio', address],
    queryFn: async () => {
      if (!address) throw new Error('No wallet connected')
      
      const res = await fetch(`/api/portfolio/balances?address=${address}`)
      if (!res.ok) throw new Error('Failed to fetch portfolio')
      return res.json()
    },
    enabled: !!address && isConnected,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Auto-refetch every 2 minutes
  })

  // Show wallet connect prompt if not connected
  if (!isConnected || !address) {
    return <WalletConnectPrompt />
  }

  if (isLoading) {
    return <PortfolioLoading />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <Wallet className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold">Failed to load portfolio</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!portfolio || portfolio.balances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative w-20 h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center">
            <Wallet className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">No Assets Found</h2>
          <p className="text-muted-foreground max-w-md">
            Your wallet doesn't have any assets on the supported chains yet.
          </p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PortfolioHeader
          walletAddress={portfolio.walletAddress}
          onRefresh={refetch}
          isRefreshing={isRefetching}
        />
      </motion.div>

      {/* Stats Section with Chart */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Stats Cards - Takes 8 columns */}
          <div className="xl:col-span-8">
            <PortfolioStats
              totalValue={portfolio.totalValue}
              balances={portfolio.balances}
            />
          </div>
          
          {/* Chart - Takes 4 columns */}
          <div className="xl:col-span-4">
            <PortfolioChart balances={portfolio.balances} />
          </div>
        </div>
      </motion.div>

      {/* Assets List */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Your Assets</h2>
            <p className="text-muted-foreground text-sm">
              {portfolio.balances.length} {portfolio.balances.length === 1 ? 'asset' : 'assets'} across multiple chains
            </p>
          </div>
        </div>

        <PortfolioAssetsList balances={portfolio.balances} />
      </motion.div>

      {/* Last updated */}
      <div className="text-xs text-muted-foreground text-center py-6 border-t border-dashed border-border/40">
        Last updated: {new Date(portfolio.timestamp).toLocaleString()}
      </div>
    </motion.div>
  )
}
