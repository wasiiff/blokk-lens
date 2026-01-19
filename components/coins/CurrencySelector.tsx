"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price?: number
  price_change_percentage_24h?: number
}

interface CurrencySelectorProps {
  label: string
  selectedCoin: Coin
  onCoinSelect: (coin: Coin) => void
  amount: string
  onAmountChange: (amount: string) => void
  readOnly?: boolean
}

export default function CurrencySelector({
  label,
  selectedCoin,
  onCoinSelect,
  amount,
  onAmountChange,
  readOnly = false,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [coins, setCoins] = useState<Coin[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchCoins = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Use the internal API route instead of direct CoinGecko call
      const response = await fetch("/api/coins/market?per_page=100&page=1")
      
      if (!response.ok) {
        throw new Error("Failed to fetch coins")
      }
      
      const data = await response.json()
      setCoins(data)
    } catch (error) {
      console.error("Error fetching coins:", error)
      setError("Failed to load cryptocurrencies. Please try again.")
      setCoins([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && coins.length === 0) {
      fetchCoins()
    }
  }, [isOpen, coins.length])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            suppressHydrationWarning
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
                      suppressHydrationWarning
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-foreground">{coin.symbol.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{coin.name}</p>
                      </div>
                      {coin.current_price && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            ${coin.current_price.toLocaleString()}
                          </p>
                          {coin.price_change_percentage_24h !== undefined && coin.price_change_percentage_24h !== null && (
                            <p
                              className={`text-xs flex items-center gap-1 ${
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
