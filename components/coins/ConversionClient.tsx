"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import VirtualizedCoinSelector from "./VirtualizedCoinSelector"
import ConversionDisplay from "./ConversionDisplay"
import PopularPairs from "./PopularPairs"
import { BackgroundGrid, LeftDecorativePattern, RightDecorativePattern, VerticalBorderLines } from "@/components/ui/background-patterns"
import { ArrowDownUp } from "lucide-react"
import { usePageVisibility } from "@/lib/hooks/usePageVisibility"

export default function ConversionClient() {
  const [fromCoin, setFromCoin] = useState({ 
    id: "bitcoin", 
    symbol: "BTC", 
    name: "Bitcoin", 
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" 
  })
  const [toCoin, setToCoin] = useState({ 
    id: "ethereum", 
    symbol: "ETH", 
    name: "Ethereum", 
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" 
  })
  const [amount, setAmount] = useState("1")
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPageVisible = usePageVisibility()

  const fetchConversionRate = async () => {
    // Don't fetch if page is not visible
    if (!isPageVisible) {
      console.log('[Convert] Page not visible, skipping conversion')
      return
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setConvertedAmount(0)
      setExchangeRate(null)
      setError(null)
      return
    }

    if (!fromCoin.id || !toCoin.id) {
      console.error("Missing coin IDs")
      setError("Invalid coin selection")
      return
    }

    // If same coin, rate is 1:1
    if (fromCoin.id === toCoin.id) {
      setExchangeRate(1)
      setConvertedAmount(parseFloat(amount))
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const url = `/api/convert?from=${encodeURIComponent(fromCoin.id)}&to=${encodeURIComponent(toCoin.id)}`
      console.log("Fetching conversion:", url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("API Error:", response.status, errorData)
        
        // Show user-friendly error message
        if (response.status === 404) {
          setError(`Price data not available for ${fromCoin.symbol.toUpperCase()} or ${toCoin.symbol.toUpperCase()}`)
        } else if (response.status === 429) {
          setError("Too many requests. Please wait a moment and try again.")
        } else {
          setError("Unable to fetch conversion rate. Please try again.")
        }
        
        setConvertedAmount(null)
        setExchangeRate(null)
        return
      }
      
      const data = await response.json()
      console.log("Conversion data:", data)
      
      if (data.rate !== undefined && data.rate !== null) {
        setExchangeRate(data.rate)
        setConvertedAmount(parseFloat(amount) * data.rate)
        setError(null)
      } else {
        console.error("No rate in response:", data)
        setError("Invalid response from server")
        setConvertedAmount(null)
        setExchangeRate(null)
      }
    } catch (error) {
      console.error("Error fetching conversion rate:", error)
      setError("Network error. Please check your connection.")
      setConvertedAmount(null)
      setExchangeRate(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = () => {
    const temp = fromCoin
    setFromCoin(toCoin)
    setToCoin(temp)
    // Clear results when swapping
    setConvertedAmount(null)
    setExchangeRate(null)
    setError(null)
  }

  const handleFromCoinSelect = useCallback((coin: any) => {
    setFromCoin(coin)
    // Clear results when changing coins
    setConvertedAmount(null)
    setExchangeRate(null)
    setError(null)
  }, [])

  const handleToCoinSelect = useCallback((coin: any) => {
    setToCoin(coin)
    // Clear results when changing coins
    setConvertedAmount(null)
    setExchangeRate(null)
    setError(null)
  }, [])

  const handleAmountChange = useCallback((newAmount: string) => {
    setAmount(newAmount)
  }, [])

  const handlePopularPairSelect = (from: any, to: any) => {
    setFromCoin(from)
    setToCoin(to)
    // Clear results when changing pairs
    setConvertedAmount(null)
    setExchangeRate(null)
    setError(null)
  }

  const handleConvert = async () => {
    await fetchConversionRate()
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundGrid />

      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:max-w-[1400px] xl:w-[1400px] relative flex flex-col justify-start items-start">
          {/* Left decorative pattern */}
          <LeftDecorativePattern />

          {/* Right decorative pattern */}
          <RightDecorativePattern />

          {/* Vertical border lines */}
          <VerticalBorderLines />

          <div className="self-stretch pt-[9px] overflow-hidden flex flex-col justify-center items-start relative z-10 w-full">
            <Navbar />

            <main className="w-full px-2 sm:px-4 md:px-8 lg:px-12 py-24 sm:py-28 md:py-32">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-primary font-medium">Real-time Conversion</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                  Crypto Converter
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Convert between cryptocurrencies with live exchange rates
                </p>
              </motion.div>

              {/* Conversion Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-4xl mx-auto mb-12"
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl blur-xl opacity-50" />
                  
                  <div className="relative glass-card-light rounded-2xl p-6 sm:p-8 border border-border/50">
                    {/* From Currency */}
                    <VirtualizedCoinSelector
                      label="From"
                      selectedCoin={fromCoin}
                      onCoinSelect={handleFromCoinSelect}
                      amount={amount}
                      onAmountChange={handleAmountChange}
                    />

                    {/* Swap Button */}
                    <div className="flex justify-center -my-3 relative z-10">
                      <button
                        onClick={handleSwap}
                        type="button"
                        className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
                      >
                        <ArrowDownUp className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                      </button>
                    </div>

                    {/* To Currency */}
                    <VirtualizedCoinSelector
                      label="To"
                      selectedCoin={toCoin}
                      onCoinSelect={handleToCoinSelect}
                      amount={convertedAmount?.toFixed(8) || "0"}
                      onAmountChange={() => {}}
                      readOnly
                    />

                    {/* Convert Button */}
                    <div className="mt-6">
                      <button
                        onClick={handleConvert}
                        type="button"
                        disabled={isLoading || !amount || parseFloat(amount) <= 0}
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Converting...
                          </>
                        ) : (
                          <>
                            <ArrowDownUp className="w-4 h-4" />
                            Convert
                          </>
                        )}
                      </button>
                    </div>

                    {/* Conversion Display */}
                    <ConversionDisplay
                      fromCoin={fromCoin}
                      toCoin={toCoin}
                      amount={amount}
                      convertedAmount={convertedAmount}
                      exchangeRate={exchangeRate}
                      isLoading={isLoading}
                      error={error}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Popular Pairs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PopularPairs onPairSelect={handlePopularPairSelect} />
              </motion.div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
