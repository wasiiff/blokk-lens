"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { TrendingUp, Shield, Zap, Sparkles, ArrowRight } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
}

export default function HeroSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Live market insights"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-grade security"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant updates"
    }
  ]

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-16 px-2 sm:px-4 md:px-8 lg:px-12 overflow-hidden"
    >
      <div className="relative w-full max-w-250 mx-auto flex flex-col justify-center items-center gap-8">
        {/* Main Heading with Gradient */}
        <motion.div
          variants={itemVariants}
          className="w-full text-center flex justify-center flex-col px-4"
        >
          <h1 className="text-[40px] xs:text-[48px] sm:text-[56px] md:text-[64px] lg:text-[72px] font-bold leading-[1.1] tracking-tight">
            <span className="bg-linear-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
              Track Crypto
            </span>
            <br />
            <span 
              className="font-bold"
              style={{
                WebkitTextFillColor: 'transparent',
                WebkitTextStrokeWidth: '2px',
                WebkitTextStrokeColor: '#6366f1',
                color: 'transparent',
              }}
            >
              Like Never Before
            </span>
          </h1>
          
          {/* Decorative underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-32 h-1 bg-linear-to-r from-primary via-purple-500 to-primary rounded-full mx-auto mt-6"
          />
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="w-full max-w-175 text-center text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed px-4 font-normal"
        >
          Experience the future of cryptocurrency tracking with advanced analytics, 
          real-time market insights, and personalized watchlists. 
          <span className="text-foreground font-medium"> Stay ahead of the market.</span>
        </motion.p>

        {/* Feature Pills - Redesigned */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                className="group relative flex items-center gap-3 px-5 py-3 rounded-xl bg-background/40 backdrop-blur-xl border border-border/30 hover:border-primary/30 transition-all duration-300 cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{feature.title}</span>
                  <span className="text-xs text-muted-foreground">{feature.description}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full max-w-3xl mt-4"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/60 px-3 py-1 text-xs font-semibold text-primary mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Trading Assistant
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  Ask for live setups, risk plans, and technical breakdowns
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Chat with BlokkLens AI and get actionable trade insights in seconds.
                </p>
              </div>

              <Link
                href="/trading-assistant"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                Ask AI Assistant
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom separator with gradient */}
      <div className="relative w-full mt-16">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-border/50 to-transparent h-px" />
        <div className="w-full border-t border-dashed border-border/30" />
      </div>
    </motion.section>
  )
}
