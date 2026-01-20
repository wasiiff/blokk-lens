"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchMarketCoins, searchMarketCoins, fetchFavorites, addFavorite, removeFavorite, fetchGlobalMarketData } from "@/services/queries"
import { useSession } from "next-auth/react"
import CoinCard from "./CoinCard"
import { CoinCardSkeleton } from "@/components/ui/skeleton"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const ITEMS_PER_PAGE = 20
// CoinGecko has 13,690+ coins, but API limits to 250 per page and ~10,000 total accessible via pagination
// We'll calculate total pages dynamically from global data
const MAX_COINS_ACCESSIBLE = 10000 // CoinGecko API limitation
const DEFAULT_TOTAL_PAGES = Math.ceil(MAX_COINS_ACCESSIBLE / ITEMS_PER_PAGE) // 500 pages

const CHAIN_FILTERS = [
  { id: "all", name: "All Chains", icon: "🌐", keywords: [] },
  { id: "ethereum", name: "Ethereum", icon: "Ξ", keywords: ["ethereum", "eth"] },
  { id: "bsc", name: "BSC", icon: "🟡", keywords: ["binance", "bsc", "bnb"] },
  { id: "polygon", name: "Polygon", icon: "🟣", keywords: ["polygon", "matic"] },
  { id: "arbitrum", name: "Arbitrum", icon: "🔵", keywords: ["arbitrum", "arb"] },
  { id: "optimism", name: "Optimism", icon: "🔴", keywords: ["optimism", "op"] },
  { id: "avalanche", name: "Avalanche", icon: "🔺", keywords: ["avalanche", "avax"] },
  { id: "solana", name: "Solana", icon: "◎", keywords: ["solana", "sol"] },
]

interface MarketOverviewProps {
  searchQuery?: string
}

export default function MarketOverview({ searchQuery = "" }: MarketOverviewProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(DEFAULT_TOTAL_PAGES)
  // const [selectedChain, setSelectedChain] = useState("all") // Commented out for future use

  const isSearching = searchQuery.trim().length > 0
  // const isFiltering = selectedChain !== "all" // Commented out for future use

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Fetch global data to get total coin count
  const { data: globalData } = useQuery({
    queryKey: ["global-market-data"],
    queryFn: fetchGlobalMarketData,
  })

  // Calculate total pages based on active cryptocurrencies
  useEffect(() => {
    if (globalData?.data?.active_cryptocurrencies) {
      const activeCryptos = globalData.data.active_cryptocurrencies
      // CoinGecko API limits to ~10,000 coins accessible via pagination
      const accessibleCoins = Math.min(activeCryptos, MAX_COINS_ACCESSIBLE)
      const calculatedPages = Math.ceil(accessibleCoins / ITEMS_PER_PAGE)
      setTotalPages(calculatedPages)
    }
  }, [globalData])

  // Fetch regular market coins for browsing
  const { data: marketCoins, isLoading: marketCoinsLoading } = useQuery({
    queryKey: ["market-coins", currentPage, ITEMS_PER_PAGE],
    queryFn: () => fetchMarketCoins(currentPage, ITEMS_PER_PAGE),
    enabled: !isSearching,
  })

  // Chain filtering logic - Commented out for future use
  // const filteredCoins = useMemo(() => {
  //   if (!marketCoins || selectedChain === "all") return marketCoins
  //   
  //   const selectedFilter = CHAIN_FILTERS.find(f => f.id === selectedChain)
  //   if (!selectedFilter || selectedFilter.keywords.length === 0) return marketCoins
  //
  //   return marketCoins.filter(coin => {
  //     const coinName = coin.name.toLowerCase()
  //     const coinSymbol = coin.symbol.toLowerCase()
  //     const coinId = coin.id.toLowerCase()
  //     
  //     return selectedFilter.keywords.some(keyword => {
  //       const keywordLower = keyword.toLowerCase()
  //       
  //       if (coinSymbol === keywordLower || coinSymbol.startsWith(keywordLower)) return true
  //       if (coinName === keywordLower || coinName.startsWith(keywordLower)) return true
  //       if (coinId === keywordLower || coinId.startsWith(keywordLower)) return true
  //       
  //       const nameWords = coinName.split(/[\s-_]+/)
  //       const symbolWords = coinSymbol.split(/[\s-_]+/)
  //       const idWords = coinId.split(/[\s-_]+/)
  //       
  //       return nameWords.some(word => word === keywordLower || word.startsWith(keywordLower)) ||
  //              symbolWords.some(word => word === keywordLower || word.startsWith(keywordLower)) ||
  //              idWords.some(word => word === keywordLower || word.startsWith(keywordLower))
  //     })
  //   })
  // }, [marketCoins, selectedChain])

  // const paginatedFilteredCoins = useMemo(() => {
  //   if (!isFiltering || !filteredCoins) return filteredCoins
  //   
  //   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  //   const endIndex = startIndex + ITEMS_PER_PAGE
  //   return filteredCoins.slice(startIndex, endIndex)
  // }, [filteredCoins, currentPage, isFiltering])

  // const totalFilteredPages = useMemo(() => {
  //   if (!isFiltering || !filteredCoins) return TOTAL_PAGES
  //   return Math.ceil(filteredCoins.length / ITEMS_PER_PAGE)
  // }, [filteredCoins, isFiltering])

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
      // We'll fetch a large batch and filter by the search result IDs
      const allCoins = await fetchMarketCoins(1, 250)
      return allCoins.filter(coin => searchCoinIds.includes(coin.id))
    },
    enabled: isSearching && searchCoinIds.length > 0,
  })

  const coins = isSearching ? searchCoinsData : marketCoins
  const isLoading = isSearching ? (searchLoading || searchCoinsDataLoading) : marketCoinsLoading
  const displayTotalPages = totalPages // isFiltering ? totalFilteredPages : totalPages
  
  // Calculate total coins accessible
  const totalCoinsAccessible = totalPages * ITEMS_PER_PAGE
  const actualTotalCoins = globalData?.data?.active_cryptocurrencies || totalCoinsAccessible

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

  const handleToggleFavorite = (coinId: string) => {
    if (favoriteIds.has(coinId)) {
      removeMutation.mutate(coinId)
    } else {
      addMutation.mutate(coinId)
    }
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, displayTotalPages))
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5
    const totalPages = displayTotalPages
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

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
      {/* Chain Filter - Commented out for future implementation */}
      {/* <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground">Filter by Chain</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CHAIN_FILTERS.map((chain) => (
            <Button
              key={chain.id}
              variant={selectedChain === chain.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChain(chain.id)}
              className={
                selectedChain === chain.id
                  ? "h-9 px-4 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold border-0 transition-all duration-200 hover:scale-105"
                  : "h-9 px-4 rounded-full border-2 border-border/50 bg-background/60 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all duration-200 font-medium"
              }
            >
              <span className="text-base mr-1.5">{chain.icon}</span>
              <span className="text-sm">{chain.name}</span>
            </Button>
          ))}
        </div>
        {selectedChain !== "all" && filteredCoins && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-foreground">
              Found {filteredCoins.length} {CHAIN_FILTERS.find(f => f.id === selectedChain)?.name} coins
            </span>
          </div>
        )}
      </div> */}

      {/* Coins Grid */}
      {!coins || coins.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isSearching ? `No coins found matching "${searchQuery}"` : "No coins available"}
          </p>
        </div>
      ) : (
        <>
          {/* Show search results count */}
          {isSearching && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Found {coins.length} coin{coins.length !== 1 ? 's' : ''} matching "{searchQuery}"
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
        </>
      )}

      {/* Pagination Controls - Only show when not searching */}
      {!isSearching && (
        <div className="flex flex-col items-center gap-4 pt-8 pb-4">
          {/* Mobile Pagination */}
          <div className="flex sm:hidden items-center justify-between w-full gap-3 px-2">
            <Button
              variant="outline"
              size="default"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
              className="flex-1 h-11 rounded-xl border-2 border-border/50 bg-background/60 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Prev
            </Button>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-md border-2 border-primary/20 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-foreground whitespace-nowrap">
                {currentPage} / {displayTotalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="default"
              onClick={handleNextPage}
              disabled={currentPage === displayTotalPages || isLoading}
              className="flex-1 h-11 rounded-xl border-2 border-border/50 bg-background/60 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden sm:flex items-center justify-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="default"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
              className="h-11 px-5 rounded-xl border-2 border-border/50 bg-background/60 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <ChevronLeft className="w-5 h-5 mr-1.5" />
              <span className="hidden md:inline">Previous</span>
              <span className="md:hidden">Prev</span>
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground font-bold text-lg">
                    •••
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="default"
                    onClick={() => handlePageClick(page as number)}
                    disabled={isLoading}
                    className={
                      currentPage === page
                        ? "h-11 w-11 p-0 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground font-bold border-0 transition-all duration-200 scale-110 hover:scale-115"
                        : "h-11 w-11 p-0 rounded-xl border-2 border-border/50 bg-background/60 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 hover:scale-110 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    }
                  >
                    {page}
                  </Button>
                )
              ))}
            </div>

            <Button
              variant="outline"
              size="default"
              onClick={handleNextPage}
              disabled={currentPage === displayTotalPages || isLoading}
              className="h-11 px-5 rounded-xl border-2 border-border/50 bg-background/60 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <span className="hidden md:inline">Next</span>
              <span className="md:hidden">Next</span>
              <ChevronRight className="w-5 h-5 ml-1.5" />
            </Button>
          </div>

          {/* Page Info */}
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-muted/40 backdrop-blur-md border-2 border-border/30 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            <p className="text-sm font-semibold text-muted-foreground">
              Page <span className="text-foreground font-bold text-base">{currentPage}</span> of <span className="text-foreground font-bold text-base">{displayTotalPages}</span>
              <span className="hidden md:inline"> • <span className="text-foreground font-bold">{ITEMS_PER_PAGE}</span> coins per page</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}