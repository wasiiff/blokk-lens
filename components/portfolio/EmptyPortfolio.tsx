'use client'

import { Wallet, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EmptyPortfolio() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative p-6 bg-card border-2 border-primary/20 rounded-full">
          <Wallet className="w-16 h-16 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-3xl font-bold">No Assets Found</h2>
        <p className="text-muted-foreground">
          Your wallet doesn't have any native tokens on the supported chains yet.
          Start by adding some crypto to your wallet!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            View Markets
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/convert">
          <Button className="gap-2">
            Convert Crypto
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border max-w-md">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Supported Chains:</strong> Ethereum, Polygon, BNB Chain, Arbitrum, Optimism, Base
        </p>
      </div>
    </div>
  )
}
