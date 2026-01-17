"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSignMessage } from 'wagmi'
import { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected && address) {
      handleWalletAuth(address)
    }
  }, [isConnected, address])

  const handleWalletAuth = async (walletAddress: string) => {
    try {
      // Register/login user with wallet
      const res = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })

      if (!res.ok) {
        throw new Error('Failed to authenticate wallet')
      }

      const data = await res.json()

      // Sign in with NextAuth using wallet credentials
      const result = await signIn('credentials', {
        redirect: false,
        email: data.user.email,
        password: walletAddress,
      })

      if (result?.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Wallet authentication error:', error)
    }
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="w-full h-12 bg-white/5 dark:bg-background border border-white/20 dark:border-border hover:bg-white/10 dark:hover:bg-muted hover:border-white/30 dark:hover:border-border/80 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                      <path
                        d="M8.68 15.32L20 7.46l11.32 7.86v15.36L20 38.54l-11.32-7.86V15.32z"
                        fill="url(#wallet-gradient)"
                      />
                      <defs>
                        <linearGradient id="wallet-gradient" x1="8.68" y1="7.46" x2="31.32" y2="38.54">
                          <stop stopColor="#667EEA" />
                          <stop offset="1" stopColor="#764BA2" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="card-text font-medium">Connect Wallet</span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="w-full h-12 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all"
                  >
                    <span className="text-red-600 dark:text-red-400 font-medium">Wrong network</span>
                  </button>
                )
              }

              return (
                <div className="flex gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-2 px-4 h-12 bg-white/5 dark:bg-background border border-white/20 dark:border-border hover:bg-white/10 dark:hover:bg-muted rounded-xl transition-all"
                  >
                    {chain.hasIcon && (
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-5 h-5"
                          />
                        )}
                      </div>
                    )}
                    <span className="card-text text-sm">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 px-4 h-12 bg-white/5 dark:bg-background border border-white/20 dark:border-border hover:bg-white/10 dark:hover:bg-muted rounded-xl transition-all"
                  >
                    <span className="card-text text-sm font-medium">
                      {account.displayName}
                    </span>
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
