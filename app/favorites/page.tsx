"use client"

import { Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import FavoritesClient from "@/components/coins/FavoritesClient"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function FavoritesPage() {
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
          </div>

          {/* Right vertical line with decorative dots */}
          <div className="hidden sm:block w-px h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-border z-0">
            <div className="absolute top-40 right-[-2px] w-1 h-1 bg-primary rounded-full opacity-60"></div>
            <div className="absolute top-72 right-[-2px] w-1 h-1 bg-primary rounded-full opacity-60"></div>
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

            <main className="w-full px-2 sm:px-4 md:px-8 lg:px-12 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pt-24 sm:pt-28 md:pt-32 lg:pt-32 pb-8"
              >
                <div className="mb-8">
                  <h1 className="text-[32px] sm:text-[42px] md:text-[48px] font-normal mb-3 leading-[1.1] font-serif text-foreground">
                    Your Favorites
                  </h1>
                  <p className="text-muted-foreground text-lg">Track your favorite cryptocurrencies</p>
                </div>

                {/* Horizontal separator */}
                <div className="w-full border-t border-dashed border-border/60 mb-8"></div>

                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  }
                >
                  <FavoritesClient />
                </Suspense>
              </motion.div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
