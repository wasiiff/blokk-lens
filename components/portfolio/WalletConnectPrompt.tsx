'use client'

import { Wallet, Shield, Zap, Eye } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletConnectPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 p-8">
      {/* Icon with gradient background */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative p-8 bg-card border-2 border-primary/30 rounded-full">
          <Wallet className="w-20 h-20 text-primary" />
        </div>
      </div>

      {/* Main content */}
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Connect Your Wallet
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect your wallet to view your crypto portfolio across multiple blockchain networks
        </p>
      </div>

      {/* Connect button */}
      <div className="flex flex-col items-center gap-4">
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, mounted }) => {
            return (
              <div
                {...(!mounted && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                <button
                  onClick={openConnectModal}
                  type="button"
                  className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
                >
                  <Wallet className="w-6 h-6" />
                  Connect Wallet
                </button>
              </div>
            )
          }}
        </ConnectButton.Custom>

        <p className="text-sm text-muted-foreground">
          No authentication required • View-only access
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl w-full">
        <FeatureCard
          icon={<Eye className="w-6 h-6" />}
          title="View-Only"
          description="We only read your public wallet data. No transactions or signatures required."
        />
        <FeatureCard
          icon={<Shield className="w-6 h-6" />}
          title="Secure"
          description="Your private keys never leave your wallet. 100% safe and secure."
        />
        <FeatureCard
          icon={<Zap className="w-6 h-6" />}
          title="Multi-Chain"
          description="Track balances across 8 EVM chains including Ethereum, Polygon, BSC, Arbitrum, Optimism, Base, Avalanche, and Fantom."
        />
      </div>

      {/* Supported chains */}
      <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border max-w-2xl w-full">
        <p className="text-sm font-semibold text-center mb-4">Supported Networks</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Ethereum', 'Polygon', 'BNB Chain', 'Arbitrum', 'Optimism', 'Base', 'Avalanche', 'Fantom'].map((chain) => (
            <span
              key={chain}
              className="px-3 py-1 bg-background border border-border rounded-lg text-xs font-medium"
            >
              {chain}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          + 30+ popular ERC-20 tokens on each chain
        </p>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-shadow">
      <div className="inline-flex p-3 bg-primary/10 rounded-lg text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
