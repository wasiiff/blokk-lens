"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchCoinDetails, addFavorite, removeFavorite, fetchFavorites } from "@/services/queries"
import { TrendingUp, TrendingDown, ArrowLeft, ExternalLink, Star, Bot } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CircuitDecoration } from "@/components/ui/decorative-svg"
import { CoinDetailSkeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"

// Lazy load heavy components
const PriceChart = lazy(() => import("@/components/trading-assistant/PriceChart"))

interface CoinDetailClientProps {
  coinId: string
}

const CoinDetailClient = memo(function CoinDetailClient({ coinId }: CoinDetailClientProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isFavorite, setIsFavorite] = useState(false)

  const { data: coin, isLoading } = useQuery({
    queryKey: ["coin", coinId],
    queryFn: () => fetchCoinDetails(coinId),
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes cache
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  })

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: !!session,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes cache
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (favorites && Array.isArray(favorites)) {
      setIsFavorite(favorites.some((fav) => fav.id === coinId))
    } else {
      setIsFavorite(false)
    }
  }, [favorites, coinId])

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onMutate: async () => {
      // Optimistic update
      setIsFavorite(true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
    onError: () => {
      // Rollback on error
      setIsFavorite(false)
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onMutate: async () => {
      // Optimistic update
      setIsFavorite(false)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
    onError: () => {
      // Rollback on error
      setIsFavorite(true)
    },
  })

  const handleToggleFavorite = useCallback(() => {
    if (!session) {
      router.push("/auth/login")
      return
    }

    if (isFavorite) {
      removeMutation.mutate(coinId)
    } else {
      addMutation.mutate(coinId)
    }
  }, [session, isFavorite, coinId, router, addMutation, removeMutation])

  // Memoized values
  const currentPrice = useMemo(() => 
    coin?.market_data?.current_price?.usd ?? 0,
    [coin]
  )

  const priceChange = useMemo(() => 
    coin?.market_data?.price_change_percentage_24h ?? 0,
    [coin]
  )

  const isPositive = useMemo(() => 
    priceChange >= 0,
    [priceChange]
  )

  const marketCap = useMemo(() => 
    ((coin?.market_data?.market_cap?.usd ?? 0) / 1e9).toFixed(2),
    [coin]
  )

  const circulatingSupply = useMemo(() => 
    (coin?.market_data?.circulating_supply ?? 0).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }),
    [coin]
  )

  const totalSupply = useMemo(() => 
    coin?.market_data?.total_supply?.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }),
    [coin]
  )

  const high24h = useMemo(() => 
    (coin?.market_data?.high_24h?.usd ?? 0).toLocaleString(),
    [coin]
  )

  const low24h = useMemo(() => 
    (coin?.market_data?.low_24h?.usd ?? 0).toLocaleString(),
    [coin]
  )

  const ath = useMemo(() => 
    (coin?.market_data?.ath?.usd ?? 0).toLocaleString(),
    [coin]
  )

  const description = useMemo(() => {
    if (!coin?.description?.en) return null
    // Sanitize and truncate description for performance
    const text = coin.description.en.replace(/<[^>]*>/g, '').split(". ").slice(0, 3).join(". ") + "."
    return text
  }, [coin])

  if (isLoading) {
    return <CoinDetailSkeleton />
  }

  if (!coin) return null

  return (
    <div className="relative w-full py-4 sm:py-6 md:py-8">
      <div className="absolute -right-20 top-0 pointer-events-none opacity-10 hidden lg:block">
        <CircuitDecoration className="w-96 h-96" />
      </div>

      <Link href="/">
        <Button variant="ghost" className="mb-4 sm:mb-6 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Markets
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="glass-card-light border border-border">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={coin.image?.large}
                  alt={coin.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-2xl sm:text-3xl card-text mb-1 break-words">
                    {coin.name}
                  </CardTitle>
                  <p className="card-text-muted uppercase text-sm">
                    {coin.symbol}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {coin.market_data?.market_cap_rank && (
                    <div className="px-2 sm:px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs sm:text-sm font-medium whitespace-nowrap">
                      Rank #{coin.market_data.market_cap_rank}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="gap-2 border-primary/20 bg-muted/30 cursor-not-allowed opacity-60"
                  >
                    <Bot className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask AI</span>
                    <span className="sm:hidden">AI</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      Soon
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    disabled={addMutation.isPending || removeMutation.isPending}
                    className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-muted transition-all"
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                        isFavorite 
                          ? "fill-yellow-500 text-yellow-500" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold card-text break-all">
                      ${currentPrice.toLocaleString()}
                    </span>
                    <div
                      className={`flex items-center gap-1 text-base sm:text-lg font-medium ${
                        isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      {Math.abs(priceChange).toFixed(2)}%
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm card-text-muted">24h change</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs sm:text-sm card-text-muted mb-1">Market Cap</p>
                    <p className="text-base sm:text-lg font-semibold card-text break-all">
                      ${marketCap}B
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm card-text-muted mb-1">Circulating Supply</p>
                    <p className="text-base sm:text-lg font-semibold card-text break-all">
                      {circulatingSupply}
                    </p>
                  </div>
                  {totalSupply && (
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs sm:text-sm card-text-muted mb-1">Total Supply</p>
                      <p className="text-base sm:text-lg font-semibold card-text break-all">
                        {totalSupply}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Suspense fallback={
            <Card className="glass-card-light border border-border p-4 sm:p-6">
              <div className="h-[250px] sm:h-[300px] md:h-[350px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground text-sm">Loading chart...</div>
              </div>
            </Card>
          }>
            <PriceChart coinId={coinId} days={30} />
          </Suspense>

          {description && (
            <Card className="glass-card-light border border-border">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="card-text text-lg sm:text-xl">About {coin.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="card-text text-sm sm:text-base leading-relaxed">
                  {description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="glass-card-light border border-border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="card-text text-lg sm:text-xl">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-6">
              {coin.links?.homepage?.[0] && (
                <a
                  href={coin.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="card-text text-sm sm:text-base">Website</span>
                  <ExternalLink className="w-4 h-4 card-text-muted flex-shrink-0" />
                </a>
              )}
              {coin.links?.blockchain_site?.[0] && (
                <a
                  href={coin.links.blockchain_site[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="card-text text-sm sm:text-base">Explorer</span>
                  <ExternalLink className="w-4 h-4 card-text-muted flex-shrink-0" />
                </a>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card-light border border-border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="card-text text-lg sm:text-xl">Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="flex justify-between items-center gap-2">
                <span className="card-text-muted text-xs sm:text-sm">24h High</span>
                <span className="card-text font-medium text-sm sm:text-base break-all text-right">
                  ${high24h}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="card-text-muted text-xs sm:text-sm">24h Low</span>
                <span className="card-text font-medium text-sm sm:text-base break-all text-right">
                  ${low24h}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="card-text-muted text-xs sm:text-sm">All-Time High</span>
                <span className="card-text font-medium text-sm sm:text-base break-all text-right">
                  ${ath}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
})

export default CoinDetailClient
