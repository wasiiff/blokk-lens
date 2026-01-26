"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import PortfolioClient from '@/components/portfolio/PortfolioClient'
import { BackgroundGrid, LeftDecorativePattern, RightDecorativePattern, VerticalBorderLines } from "@/components/ui/background-patterns"

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background geometric pattern */}
      <BackgroundGrid />

      {/* Navbar - Fixed at top */}
      <Navbar />

      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:max-w-[1400px] xl:w-[1400px] relative flex flex-col justify-start items-start">
          {/* Left decorative pattern */}
          <LeftDecorativePattern />

          {/* Right decorative pattern */}
          <RightDecorativePattern />

          {/* Vertical border lines */}
          <VerticalBorderLines />

          <div className="self-stretch overflow-hidden flex flex-col justify-center items-start relative z-10 w-full">
            {/* Main content with proper top spacing */}
            <main className="w-full pt-32 lg:pt-28 pb-16">
              {/* Portfolio Content */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-2 sm:px-4 md:px-8 lg:px-12"
              >
                <PortfolioClient />
              </motion.section>
            </main>

            {/* Bottom separator */}
            <div className="w-full border-t border-dashed border-border/60"></div>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
