"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession, signOut } from "next-auth/react"
import { useAccount, useDisconnect } from "wagmi"
import { ChevronDown, Mail, Wallet, LogOut, User, Chrome } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GetStartedDropdownProps {
  isScrolled: boolean
}

export default function GetStartedDropdown({ isScrolled }: GetStartedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  // Determine login method
  const isWalletLogin = session?.user?.email?.includes('@wallet.blokklens')
  const isGoogleLogin = session?.user?.email && !isWalletLogin && session?.user?.email?.includes('@')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    if (isWalletLogin && isConnected) {
      // Disconnect wallet first
      disconnect()
    }
    await signOut({ redirect: false })
    router.push('/')
    setIsOpen(false)
  }

  if (session) {
    // User is logged in - show user info dropdown
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          className={`h-10 px-4 rounded-xl backdrop-blur-md transition-all duration-300 flex items-center gap-2 ${
            isScrolled
              ? 'bg-background/60 border border-border/30 hover:bg-background/80'
              : 'bg-background/40 border border-border/20 hover:bg-background/60'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            {isWalletLogin ? (
              <Wallet className="w-4 h-4 text-primary" />
            ) : isGoogleLogin ? (
              <Chrome className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-foreground leading-none">
              {session.user?.name?.slice(0, 12)}
              {(session.user?.name?.length || 0) > 12 ? '...' : ''}
            </span>
            <span className="text-xs text-muted-foreground">
              {isWalletLogin ? 'Wallet' : isGoogleLogin ? 'Google' : 'Account'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl backdrop-blur-xl bg-background/95 border border-border shadow-2xl overflow-hidden z-50">
            {/* User Info */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {isWalletLogin ? (
                    <Wallet className="w-5 h-5 text-primary" />
                  ) : isGoogleLogin ? (
                    <Chrome className="w-5 h-5 text-primary" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {isWalletLogin && address 
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : session.user?.email
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {isWalletLogin ? 'Disconnect Wallet' : 'Sign Out'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // User is not logged in - show Get Started dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        size="sm"
        className={`h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 flex items-center gap-2 ${
          isOpen ? 'ring-2 ring-primary/50' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        Get Started
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl backdrop-blur-xl bg-background/95 border border-border shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">Choose sign in method</h3>
            <p className="text-xs text-muted-foreground mt-1">Select how you want to access BLOKK LENS</p>
          </div>

          {/* Options */}
          <div className="p-2 space-y-1">
            {/* Wallet Connect - Highlighted */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-linear-to-r from-primary/50 to-purple-500/50 rounded-lg blur opacity-30"></div>
              <button
                onClick={() => {
                  router.push('/auth/login?method=wallet')
                  setIsOpen(false)
                }}
                className="relative w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">Connect Wallet</p>
                  <p className="text-xs text-muted-foreground">MetaMask, Trust, Coinbase</p>
                </div>
                <div className="px-2 py-1 rounded-md bg-primary/20 border border-primary/30">
                  <span className="text-xs font-bold text-primary">Recommended</span>
                </div>
              </button>
            </div>

            {/* Email Sign In */}
            <button
              onClick={() => {
                router.push('/auth/login')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Sign in with Email</p>
                <p className="text-xs text-muted-foreground">Use your email & password</p>
              </div>
            </button>

            {/* Google Sign In */}
            <button
              onClick={() => {
                signIn('google', { callbackUrl: '/' })
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Continue with Google</p>
                <p className="text-xs text-muted-foreground">Quick & secure sign in</p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border/50 bg-muted/30">
            <p className="text-xs text-center text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  router.push('/auth/register')
                  setIsOpen(false)
                }}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
