"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Search, ChevronDown, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { cacheManager } from "@/lib/cache-manager"
import { usePageVisibility } from "@/lib/hooks/usePageVisibility"

interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price?: number
  price_change_percentage_24h?: number
}

interface VirtualizedCoinSelectorProps {
  label: string
  selectedCoin: Coin
  onCoinSelect: (coin: Coin) => void
  amount: string
  onAmountChange: (amount: string) => void
  readOnly?: boolean
}

export default function VirtualizedCoinSelector({
  label,
  selectedCoin,
  onCoinSelect,
  amount,
  onAmountChange,
  readOnly = false,
}: VirtualizedCoinSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [coins, setCoins] = useState<Coin[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isPageVisible = usePageVisibility()

  const fetchCoins = async () => {
    // Don't fetch if page is not visible
    if (!isPageVisible) {
      console.log('[CoinSelector] Page not visible, skipping fetch')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Use cache manager with 3-minute cache
      const data = await cacheManager.get(
        'market-coins-100',
        async () => {
          const response = await fetch("/api/coins/market?per_page=100&page=1")
          if (!response.ok) {
            throw new Error("Failed to fetch coins")
          }
          return response.json()
        },
        {
          ttl: 180000, // 3 minutes
          staleTime: 60000, // 1 minute
        }
      )
      
      setCoins(data)
    } catch (error) {
      console.error("Error fetching coins:", error)
      setError("Failed to load cryptocurrencies. Please try again.")
      setCoins([])
    } finally {
      setIsLoading(false)
    }
  }

  // Only fetch when dropdown opens AND page is visible
  useEffect(() => {
    if (isOpen && coins.length === 0 && isPageVisible) {
      fetchCoins()
    }
  }, [isOpen, coins.length, isPageVisible])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter coins based on search query
  const filteredCoins = useMemo(() => {
    if (!searchQuery) return coins
    
    const query = searchQuery.toLowerCase()
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query)
    )
  }, [coins, searchQuery])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      
      <div className="flex gap-3">
        {/* Amount Input */}
        <div className="flex-1">
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            readOnly={readOnly}
            className="h-14 text-2xl font-semibold bg-muted/50 border-border/50 focus:border-primary/50"
          />
        </div>

        {/* Currency Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="h-14 px-4 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all flex items-center gap-3 min-w-[160px]"
          >
            {selectedCoin.image && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-background flex items-center justify-center">
                <Image
                  src={selectedCoin.image}
                  alt={selectedCoin.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">{selectedCoin.symbol.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground truncate">{selectedCoin.name}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full mt-2 w-80 max-h-96 rounded-xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl overflow-hidden z-50">
              {/* Search */}
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search cryptocurrency..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 bg-muted/50 border-border/50"
                  />
                </div>
              </div>

              {/* Coins List */}
              <div className="overflow-y-auto max-h-80">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-red-500 mb-3">{error}</p>
                    <button
                      onClick={fetchCoins}
                      type="button"
                      className="text-sm text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredCoins.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No cryptocurrencies found</p>
                  </div>
                ) : (
                  filteredCoins.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => {
                        onCoinSelect(coin)
                        setIsOpen(false)
                        setSearchQuery("")
                      }}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{coin.symbol.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground truncate">{coin.name}</p>
                      </div>
                      {coin.current_price && (
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-foreground">
                            ${coin.current_price.toLocaleString()}
                          </p>
                          {coin.price_change_percentage_24h !== undefined && coin.price_change_percentage_24h !== null && (
                            <p
                              className={`text-xs flex items-center gap-1 justify-end ${
                                coin.price_change_percentage_24h >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              <TrendingUp className="w-3 h-3" />
                              {coin.price_change_percentage_24h.toFixed(2)}%
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
