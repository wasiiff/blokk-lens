'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

interface PortfolioBalance {
  chain: string
  chainId: number
  chainName: string
  symbol: string
  balance: number
  price: number
  value: number
  coingeckoId: string
}

interface PortfolioData {
  walletAddress: string
  totalValue: number
  balances: PortfolioBalance[]
  timestamp: string
}

export function usePortfolio(walletAddress?: string) {
  const queryClient = useQueryClient()

  const query = useQuery<PortfolioData>({
    queryKey: ['portfolio', walletAddress],
    queryFn: async () => {
      const res = await fetch('/api/portfolio/balances')
      if (!res.ok) {
        throw new Error('Failed to fetch portfolio')
      }
      return res.json()
    },
    enabled: !!walletAddress,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // 2 minutes
    refetchOnWindowFocus: true,
  })

  const invalidatePortfolio = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['portfolio', walletAddress] })
  }, [queryClient, walletAddress])

  const prefetchPortfolio = useCallback(() => {
    if (walletAddress) {
      queryClient.prefetchQuery({
        queryKey: ['portfolio', walletAddress],
        queryFn: async () => {
          const res = await fetch('/api/portfolio/balances')
          if (!res.ok) throw new Error('Failed to fetch portfolio')
          return res.json()
        },
      })
    }
  }, [queryClient, walletAddress])

  return {
    ...query,
    invalidatePortfolio,
    prefetchPortfolio,
  }
}
