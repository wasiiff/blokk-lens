"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchMarketCoins, searchMarketCoins, fetchFavorites, addFavorite, removeFavorite, fetchGlobalMarketData } from "@/services/queries"
import { useSession } from "next-auth/react"
import CoinCard from "./CoinCard"
import { CoinCardSkeleton } from "@/components/ui/skeleton"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronDown } from "lucide-react"

const COINS_PER_LOAD = 100 // Load 100 coins at a time
const MAX_COINS_ACCESSIBLE = 10000 // CoinGecko API limitation

interface MarketOverviewProps {
  searchQuery?: string
}

export default function MarketOverview({ searchQuery = "" }: MarketOverviewProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loadedPages, setLoadedPages] = useState(1) // Track how many pages loaded
  const [allCoins, setAllCoins] = useState<any[]>([]) // Store all loaded coins

  const isSearching = searchQuery.trim().length > 0

  // Fetch global data to get total coin count
  const { data: globalData } = useQuery({
    queryKey: ["global-market-data"],
    queryFn: fetchGlobalMarketData,
  })

  // Calculate total available coins
  const totalAvailableCoins = Math.min(
    globalData?.data?.active_cryptocurrencies || MAX_COINS_ACCESSIBLE,
    MAX_COINS_ACCESSIBLE
  )

  // Fetch market coins for current page
  const { data: currentPageCoins, isLoading: isLoadingPage, isFetching } = useQuery({
    queryKey: ["market-coins-page", loadedPages],
    queryFn: () => fetchMarketCoins(loadedPages, COINS_PER_LOAD),
    enabled: !isSearching && loadedPages > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Add newly loaded coins to the collection
  useEffect(() => {
    if (currentPageCoins && Array.isArray(currentPageCoins) && currentPageCoins.length > 0) {
      setAllCoins(prev => {
        // Avoid duplicates by checking IDs
        const existingIds = new Set(prev.map(coin => coin.id))
        const newCoins = currentPageCoins.filter(coin => !existingIds.has(coin.id))
        return [...prev, ...newCoins]
      })
    }
  }, [currentPageCoins])

  // Reset when search query changes
  useEffect(() => {
    if (!isSearching) {
      setLoadedPages(1)
      setAllCoins([])
    }
  }, [searchQuery, isSearching])

  // Fetch search results
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["search-coins", searchQuery],
    queryFn: () => searchMarketCoins(searchQuery),
    enabled: isSearching,
  })

  // Fetch detailed market data for search results
  const searchCoinIds = useMemo(() => {
    return searchResults?.coins?.map(coin => coin.id) || []
  }, [searchResults])

  const { data: searchCoinsData, isLoading: searchCoinsDataLoading } = useQuery({
    queryKey: ["search-coins-data", searchCoinIds],
    queryFn: async () => {
      if (searchCoinIds.length === 0) return []
      
      // Fetch market data for all search result coins
      const allCoins = await fetchMarketCoins(1, 250)
      return allCoins.filter(coin => searchCoinIds.includes(coin.id))
    },
    enabled: isSearching && searchCoinIds.length > 0,
  })

  const coins = isSearching ? (searchCoinsData || []) : allCoins
  const isLoading = isSearching ? (searchLoading || searchCoinsDataLoading) : (isLoadingPage && allCoins.length === 0)
  
  // Calculate if more coins can be loaded
  const canLoadMore = allCoins.length < totalAvailableCoins && !isSearching
  const totalCoinsLoaded = allCoins.length

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: !!session,
  })

  useEffect(() => {
    if (favorites && Array.isArray(favorites)) {
      setFavoriteIds(new Set(favorites.map((coin) => coin.id)))
    } else {
      setFavoriteIds(new Set())
    }
  }, [favorites])

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: (_, coinId) => {
      setFavoriteIds((prev) => new Set(prev).add(coinId))
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: (_, coinId) => {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        next.delete(coinId)
        return next
      })
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })

  const handleToggleFavorite = useCallback((coinId: string) => {
    if (favoriteIds.has(coinId)) {
      removeMutation.mutate(coinId)
    } else {
      addMutation.mutate(coinId)
    }
  }, [favoriteIds, addMutation, removeMutation])

  const handleLoadMore = useCallback(() => {
    if (canLoadMore && !isFetching) {
      setLoadedPages(prev => prev + 1)
    }
  }, [canLoadMore, isFetching])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <CoinCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Coins Grid */}
      {!coins || coins.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isSearching ? `No coins found matching "${searchQuery}"` : "No coins available"}
          </p>
        </div>
      ) : (
        <>
          {/* Show search results count or loaded coins count */}
          {isSearching ? (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Found {coins.length} coin{coins.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-muted/40 backdrop-blur-md border-2 border-border/30 shadow-lg w-fit">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              <p className="text-sm font-semibold text-muted-foreground">
                Showing <span className="text-foreground font-bold text-base">{totalCoinsLoaded.toLocaleString()}</span> of <span className="text-foreground font-bold text-base">{totalAvailableCoins.toLocaleString()}</span> coins
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {coins.map((coin, index) => (
              <CoinCard
                key={`${coin.id}-${index}`}
                coin={coin}
                isFavorite={favoriteIds.has(coin.id)}
                onToggleFavorite={session ? handleToggleFavorite : undefined}
              />
            ))}
          </div>

          {/* Load More Button - Only show when not searching */}
          {!isSearching && (
            <div className="flex justify-center items-center py-8">
              {canLoadMore ? (
                <Button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  size="lg"
                  className="h-12 px-8 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground font-bold border-0 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5 mr-2" />
                      Load More Coins ({COINS_PER_LOAD})
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-muted/40 backdrop-blur-md border-2 border-border/30 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    All coins loaded ({totalCoinsLoaded.toLocaleString()} total)
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
