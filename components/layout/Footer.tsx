"use client"

import { Logo } from "@/components/ui/logo"
import { Github, Mail, ExternalLink, Heart } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: "Markets", href: "/" },
      { label: "Converter", href: "/convert" },
      { label: "Watchlist", href: "/favorites" },
      { label: "About", href: "/about" },
    ],
    resources: [
      { label: "Documentation", href: "https://docs.coingecko.com/", external: true },
      { label: "API Access", href: "https://www.coingecko.com/api", external: true },
      { label: "GitHub Repo", href: "https://github.com/wasiiff/blokk-lens", external: true },
      { label: "Shadcn/ui", href: "https://ui.shadcn.com/", external: true },
    ],
    company: [
      { label: "About Developer", href: "/about" },
      { label: "Contact", href: "mailto:wasifbinnasir@gmail.com" },
    ],
  }

  return (
    <footer className="relative bg-background overflow-hidden border-t border-border/50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <div className="flex items-center space-x-3 mb-4">
                <Logo />
                <span className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  BLOKK LENS
                </span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed mb-6">
                Your gateway to real-time cryptocurrency insights. Track markets, 
                analyze trends, and stay ahead with professional-grade analytics.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com/wasiiff/blokklens" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 hover:border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                
                {/* X (Twitter) Logo - Latest Design */}
                <a 
                  href="https://x.com/wasif_bin_nasir" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 hover:border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200"
                  aria-label="X (Twitter)"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                
                <a 
                  href="mailto:wasifbinnasir@gmail.com" 
                  className="group relative w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 hover:border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Product */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                  Product
                </h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a 
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <Link 
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                        >
                          {link.label}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                  Company
                </h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {currentYear} BLOKK LENS.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 fill-red-500 text-red-500" /> by Wasif
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <a
                href="https://www.coingecko.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium"
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
