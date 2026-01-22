"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchFavorites, removeFavorite } from "@/services/queries"
import { useSession } from "next-auth/react"
import CoinCard from "./CoinCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, Loader2 } from "lucide-react"
import { memo, useCallback, useMemo } from "react"

const FavoritesClient = memo(function FavoritesClient() {
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: !!session,
    staleTime: 60000, // 1 minute
  })

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })

  const handleRemoveFavorite = useCallback((coinId: string) => {
    removeMutation.mutate(coinId)
  }, [removeMutation])

  const isLoadingState = useMemo(() => 
    status === "loading" || isLoading,
    [status, isLoading]
  )

  const hasFavorites = useMemo(() => 
    favorites && Array.isArray(favorites) && favorites.length > 0,
    [favorites]
  )

  if (isLoadingState) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Star className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Sign in to save favorites
        </h2>
        <p className="text-muted-foreground mb-6">
          Create an account to track your favorite cryptocurrencies
        </p>
        <Link href="/auth/login">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  if (!hasFavorites) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Star className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          No favorites yet
        </h2>
        <p className="text-muted-foreground mb-6">
          Start adding coins to your favorites list
        </p>
        <Link href="/">
          <Button>Browse Markets</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {favorites?.map((coin) => (
        <CoinCard
          key={coin.id}
          coin={coin}
          isFavorite={true}
          onToggleFavorite={handleRemoveFavorite}
        />
      ))}
    </div>
  )
})

export default FavoritesClient
