"use client"

import { Logo } from "@/components/ui/logo"
import { Github, Twitter, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-background overflow-x-hidden">
      {/* Footer background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
              <path d="M0,40 L40,0 M40,80 L80,40" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      <div className="relative py-16 sm:py-20 md:py-24 px-2 sm:px-4 md:px-8 lg:px-12 w-full">
        {/* Top separator line */}
        <div className="w-full border-t border-dashed border-border/60 mb-16"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Logo />
              <span className="font-bold text-2xl text-foreground">BLOKK LENS</span>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed text-base">
              Real-time cryptocurrency tracking platform. Stay updated with the latest 
              market trends, prices, and insights. Built for traders, by traders.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-background/60 backdrop-blur-md border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 hover:border-border/50 transition-all duration-200"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-background/60 backdrop-blur-md border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 hover:border-border/50 transition-all duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-background/60 backdrop-blur-md border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 hover:border-border/50 transition-all duration-200"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-6 text-lg text-foreground">Product</h3>
            <div className="space-y-4">
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Markets
              </Link>
              <Link href="/favorites" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Watchlist
              </Link>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                API Access
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Mobile App
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-6 text-lg text-foreground">Company</h3>
            <div className="space-y-4">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                About Us
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Careers
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Bottom separator line */}
        <div className="w-full border-t border-dashed border-border/60 mt-16 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} BLOKK LENS. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <a
                href="https://www.coingecko.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                CoinGecko API
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
