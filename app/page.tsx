"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSection from "@/components/layout/HeroSection"
import MarketOverviewWithFavorites from "@/components/coins/MarketOverviewWithFavorites"
import TrendingSection from "@/components/coins/TrendingSection"
import MarketStats from "@/components/coins/MarketStats"
import { BackgroundGrid, LeftDecorativePattern, RightDecorativePattern, VerticalBorderLines } from "@/components/ui/background-patterns"

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

            <main className="w-full">
              {/* Hero Section */}
              <HeroSection />

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
