"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Star, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import GetStartedDropdown from "./GetStartedDropdown"

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="relative flex flex-col justify-start items-center w-full">
        <div className={`self-stretch flex flex-col items-center relative z-10 transition-all duration-500 ${isScrolled ? 'py-3' : 'pt-6 pb-3'}`}>
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center w-full px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="flex items-center justify-between w-full max-w-6xl">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/">
                  <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-105 ${
                      isScrolled
                        ? 'bg-background/60 border border-border/30'
                        : 'bg-background/40 border border-border/20'
                    }`}>
                    <Logo />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-foreground leading-none">BLOKK LENs</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Navigation Links */}
              <div className={`flex items-center space-x-2 px-6 py-3 rounded-xl backdrop-blur-md transition-all duration-300 ${
                  isScrolled
                    ? 'bg-background/60 border border-border/30'
                    : 'bg-background/40 border border-border/20'
                }`}>
                <Link href="/">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50 cursor-pointer">
                    Markets
                  </div>
                </Link>
                {session && (
                  <Link href="/favorites">
                    <div className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50 cursor-pointer inline-flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Watchlist
                    </div>
                  </Link>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {/* GitHub Star Button */}
                <div className="hover:scale-105 transition-transform">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 px-4 rounded-xl backdrop-blur-md transition-all duration-300 group ${
                      isScrolled
                        ? 'bg-background/60 border border-border/30 hover:bg-background/80'
                        : 'bg-background/40 border border-border/20 hover:bg-background/60'
                    }`}
                    onClick={() => window.open("https://github.com/wasiiff/blokk-lens", "_blank", "noopener,noreferrer")}
                  >
                    <Star className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      Star
                    </span>
                  </Button>
                </div>

                {/* Theme Toggle */}
                <div className="hover:scale-105 transition-transform">
                  <ThemeToggle />
                </div>

                {/* Get Started Dropdown */}
                <div className="hover:scale-105 transition-transform">
                  <GetStartedDropdown isScrolled={isScrolled} />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex flex-col items-center w-full space-y-3 px-4">
            {/* Mobile Header */}
            <div className="flex items-center justify-between w-full">
              {/* Mobile Logo */}
              <Link href="/">
                <div className={`flex items-center space-x-2 backdrop-blur-xl rounded-2xl px-3 py-2 border shadow-lg transition-all duration-500 cursor-pointer ${
                    isScrolled
                      ? 'bg-background/20 border-border/10'
                      : 'bg-background/40 border-border/20'
                  }`}>
                  <Logo />
                  <span className="font-bold text-base text-foreground">BLOKK LENS</span>
                </div>
              </Link>

              {/* Mobile Menu Toggle */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <div className="hover:scale-105 transition-transform">
                  <ThemeToggle />
                </div>

                <div className="hover:scale-105 transition-transform">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 w-10 backdrop-blur-xl border transition-all duration-300 rounded-2xl shadow-lg ${
                      isScrolled
                        ? 'bg-background/20 border-border/10 hover:bg-background/40'
                        : 'bg-background/40 border-border/20 hover:bg-background/60'
                    }`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <div className={`transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`}>
                      {mobileMenuOpen ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Menu className="w-4 h-4" />
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className={`w-full overflow-hidden transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-100 max-h-[600px]' : 'opacity-0 max-h-0'
              }`}>
              <div className={`flex flex-col gap-2 backdrop-blur-xl rounded-2xl p-3 border shadow-lg transition-all duration-500 ${
                isScrolled
                  ? 'bg-background/20 border-border/10'
                  : 'bg-background/40 border-border/20'
              }`}>
                <Link href="/">
                  <div
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-xl hover:bg-background/60 relative cursor-pointer hover:scale-105"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Markets
                  </div>
                </Link>
                {session && (
                  <Link href="/favorites">
                    <div
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-xl hover:bg-background/60 relative cursor-pointer hover:scale-105 inline-flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Star className="w-4 h-4" />
                      Watchlist
                    </div>
                  </Link>
                )}

                {/* Mobile Auth Section */}
                <div className="border-t border-border/20 mt-2 pt-2">
                  <GetStartedDropdown isScrolled={isScrolled} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
