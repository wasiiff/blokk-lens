"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import MarketOverviewWithFavorites from "@/components/coins/MarketOverviewWithFavorites"
import TrendingSection from "@/components/coins/TrendingSection"
import MarketStats from "@/components/coins/MarketStats"

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="background-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#background-grid)" />
        </svg>
      </div>

      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 lg:max-w-[1270px] lg:w-[1360px] relative flex flex-col justify-start items-start">
          {/* Left vertical line with decorative dots */}
          <div className="hidden sm:block w-px h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-border z-0">
            <div className="absolute top-32 left-[-2px] w-1 h-1 bg-primary rounded-full opacity-60"></div>
            <div className="absolute top-64 left-[-2px] w-1 h-1 bg-primary rounded-full opacity-60"></div>
            <div className="absolute top-96 left-[-2px] w-1 h-1 bg-primary rounded-full opacity-60"></div>
          </div>

          {/* Right vertical line with decorative dots */}
          <div className="hidden sm:block w-px h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-border z-0">
            <div className="absolute top-40 right-[-2px] w-1 h-1 bg-primary rounded-full opacity-60"></div>
            <div className="absolute top-72 right-[-2px] w-1 h-1 bg-primary rounded-full opacity-60"></div>
            <div className="absolute top-[400px] right-[-2px] w-1 h-1 bg-primary rounded-full opacity-60"></div>
          </div>

          {/* Left decorative dashed border */}
          <div
            className="absolute dark:opacity-[0.15] opacity-[0.2] left-[-60px] top-0 w-[60px] h-full border border-dashed dark:border-[#eee] border-black/70 hidden xl:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, transparent, transparent 2px, currentcolor 2px, currentcolor 3px, transparent 3px, transparent 6px)",
            }}
          ></div>

          {/* Right decorative dashed border */}
          <div
            className="absolute dark:opacity-[0.15] opacity-[0.2] right-[-60px] top-0 w-[60px] h-full border border-dashed dark:border-[#eee] border-black/70 hidden xl:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, transparent, transparent 2px, currentcolor 2px, currentcolor 3px, transparent 3px, transparent 6px)",
            }}
          ></div>

          <div className="self-stretch pt-[9px] overflow-hidden flex flex-col justify-center items-start relative z-10 w-full">
            <Navbar />

            <main className="w-full">
              {/* Hero Section */}
              <motion.section
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="pt-24 sm:pt-28 md:pt-32 lg:pt-32 pb-12 px-2 sm:px-4 md:px-8 lg:px-12"
              >
                <div className="max-w-3xl">
                  <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-md border border-border/30 mb-6">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-muted-foreground">Live Market Data</span>
                  </motion.div>
                  
                  <motion.h1 variants={itemVariants} className="text-[32px] sm:text-[42px] md:text-[48px] lg:text-[56px] font-normal mb-6 leading-[1.1] font-serif">
                    <span className="text-foreground">Track Crypto</span>
                    <br />
                    <span className="text-primary">Like Never Before</span>
                  </motion.h1>
                  
                  <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                    Real-time cryptocurrency tracking with advanced analytics, 
                    personalized watchlists, and instant market insights. 
                    Stay ahead of the market.
                  </motion.p>
                </div>
              </motion.section>

              {/* Horizontal separator */}
              <div className="w-full border-t border-dashed border-border/60 mb-12"></div>

              {/* Stats Section */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={containerVariants}
                className="px-2 sm:px-4 md:px-8 lg:px-12 pb-12"
              >
                <MarketStats />
              </motion.section>

              {/* Main Content */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={containerVariants}
                className="px-2 sm:px-4 md:px-8 lg:px-12 py-8"
              >
                <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Market Overview</h2>
                    <p className="text-muted-foreground">Top cryptocurrencies by market cap</p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <motion.div variants={itemVariants} className="lg:col-span-3">
                    <MarketOverviewWithFavorites />
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="lg:col-span-1">
                    <div className="sticky top-24">
                      <TrendingSection />
                    </div>
                  </motion.div>
                </div>
              </motion.section>

              {/* Bottom separator */}
              <div className="w-full border-t border-dashed border-border/60 mt-16"></div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
