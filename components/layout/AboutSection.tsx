"use client"

import { Github, Rocket, Bot, Coins, TrendingUp, Zap, ArrowUpRight, Sparkles, Target, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StripeBgGuides } from "@/components/ui/StripeBg"

export default function AboutSection() {
  const features = [
    { name: "Real-Time Market Data", description: "Track live cryptocurrency prices, market trends, and detailed analytics powered by CoinGecko API.", icon: TrendingUp, status: "Live" },
    { name: "AI Trading Assistant", description: "Get intelligent trading suggestions powered by AI. Our bot analyzes market trends and provides personalized recommendations.", icon: Bot, status: "Coming Soon" },
    { name: "Launch Your Coin", description: "Create and launch your own cryptocurrency with our easy-to-use platform. No technical knowledge required.", icon: Rocket, status: "Coming Soon" },
    { name: "Smart Watchlist", description: "Save and monitor your favorite cryptocurrencies with real-time alerts and personalized insights.", icon: Sparkles, status: "Live" },
    { name: "Lightning Fast", description: "Built with Next.js 14 for optimal performance, instant page loads, and seamless user experience.", icon: Zap, status: "Live" },
  ]

  return (
    <>
      {/* Header Section */}
      <div className="w-full max-w-[937px] flex flex-col justify-center items-center gap-6 mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-center">About Blokklens</h1>
        <p className="text-lg md:text-xl text-muted-foreground text-center max-w-[650px]">
          Your ultimate cryptocurrency platform. Track markets, get AI-powered trading insights, and launch your own coins — all in one place.
        </p>
      </div>

      <div className="w-full border-t border-dashed border-border/60 mb-16"></div>

      {/* Mission Section */}
      <section className="w-full max-w-5xl mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Blokklens is revolutionizing the cryptocurrency experience. We're building a comprehensive platform that empowers everyone — from beginners to experts — to navigate the crypto world with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 border border-border/50 rounded-xl bg-muted/20">
            <Target className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
            <p className="text-sm text-muted-foreground">Democratize cryptocurrency trading and creation for everyone</p>
          </div>
          <div className="text-center p-6 border border-border/50 rounded-xl bg-muted/20">
            <Users className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Community First</h3>
            <p className="text-sm text-muted-foreground">Built by traders, for traders, with community feedback at our core</p>
          </div>
          <div className="text-center p-6 border border-border/50 rounded-xl bg-muted/20">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Innovation</h3>
            <p className="text-sm text-muted-foreground">Cutting-edge AI and technology to give you the competitive edge</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
          <p className="text-lg text-muted-foreground">Everything you need to succeed in cryptocurrency</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature) => (
            <div key={feature.name} className="group flex flex-col rounded-xl border border-border/60 bg-card hover:border-primary/40 transition-all p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold">{feature.name}</h3>
                </div>
                <Badge variant={feature.status === "Live" ? "default" : "secondary"} className="text-[10px]">{feature.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Acknowledgments */}
      <section className="w-full max-w-5xl mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered By</h2>
          <p className="text-lg text-muted-foreground">Built with the best tools and technologies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer" className="block p-6 border border-border/50 rounded-xl bg-muted/20 hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <Coins className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-lg">CoinGecko API</h3>
              <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </div>
            <p className="text-sm text-muted-foreground">Real-time cryptocurrency data, market analytics, and comprehensive coin information</p>
          </a>
          <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer" className="block p-6 border border-border/50 rounded-xl bg-muted/20 hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-lg">Shadcn/ui</h3>
              <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </div>
            <p className="text-sm text-muted-foreground">Beautiful, accessible UI components that power our modern interface</p>
          </a>
        </div>
      </section>

      {/* Developer Section - CTA Style */}
      <section className="relative bg-background overflow-x-hidden -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12">
        <div className="relative flex flex-col justify-start items-center w-full">
          <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 lg:max-w-[1270px] lg:w-[1360px] relative flex flex-col justify-start items-start mx-auto">
            <StripeBgGuides
              columnCount={12}
              animated={true}
              animationDuration={10}
              glowColor="#00008B"
              randomize={true}
              randomInterval={1000}
              contained={true}
            />

            <div className="w-px h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-border z-0"></div>
            <div className="w-px h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-border z-0"></div>

            <div
              className="absolute dark:opacity-[0.15] opacity-[0.2] left-[-60px] top-0 w-[60px] h-full border border-dashed dark:border-[#eee] border-black/70 hidden xl:block"
              style={{
                backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 2px, currentcolor 2px, currentcolor 3px, transparent 3px, transparent 6px)",
              }}
            ></div>

            <div
              className="absolute dark:opacity-[0.15] opacity-[0.2] right-[-60px] top-0 w-[60px] h-full border border-dashed dark:border-[#eee] border-black/70 hidden xl:block"
              style={{
                backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 2px, currentcolor 2px, currentcolor 3px, transparent 3px, transparent 6px)",
              }}
            ></div>

            <div className="absolute top-0 left-4 sm:left-6 md:left-8 lg:left-0 right-4 sm:right-6 md:right-8 lg:right-0 h-px bg-border z-0"></div>

            <div className="self-stretch pt-[9px] overflow-hidden flex flex-col justify-center items-center relative z-10">
              <div className="py-16 sm:py-20 md:py-24 lg:py-32 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-12 w-full">
                <div className="w-full max-w-[800px] text-center space-y-8">
                  <h2 className="text-[32px] sm:text-[42px] md:text-[48px] lg:text-[56px] font-normal leading-[1.1] font-serif text-foreground">
                    Meet the Developer
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto leading-relaxed font-medium">
                    Blokklens is crafted with passion by <span className="font-semibold text-foreground">Wasif</span>, a developer dedicated to building innovative solutions for the cryptocurrency community.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                    <Button
                      size="lg"
                      className="h-12 px-8 rounded-full transition-all duration-200 gap-2"
                      onClick={() => window.open('https://github.com/wasiiff', '_blank')}
                    >
                      <Github className="w-5 h-5" />
                      View on GitHub
                    </Button>
                  </div>
                  <div className="pt-8">
                    <p className="text-sm text-muted-foreground">Open source • Built with ❤️ • Powered by Next.js & CoinGecko</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-4 sm:left-6 md:left-8 lg:left-0 right-4 sm:right-6 md:right-8 lg:right-0 h-px bg-border z-0"></div>
          </div>
        </div>
      </section>
    </>
  )
}
