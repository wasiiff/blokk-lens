"use client"

import Image from "next/image"
import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"

export function Logo({ className = "", size = "default" }: { className?: string; size?: "sm" | "default" | "lg" }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  
  const sizes = {
    sm: { width: 40, height: 30 },
    default: { width: 56, height: 42 },
    lg: { width: 80, height: 60 },
  }
  const s = sizes[size]

  useEffect(() => {
    setMounted(true)
    
    // Function to update dark mode state
    const updateDarkMode = () => {
      if (theme === "system") {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
      } else {
        setIsDark(theme === "dark")
      }
    }
    
    updateDarkMode()
    
    // Listen for system theme changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => updateDarkMode()
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }
  }, [theme])

  // Determine which logo to use based on theme
  const logoSrc = mounted && isDark ? "/blokklensDark.svg" : "/blokklensLight.svg"

  return (
    <div className={`relative ${className}`} style={{ width: s.width, height: s.height }}>
      <Image
        src={logoSrc}
        alt="Blokklens Logo"
        width={s.width}
        height={s.height}
        className="w-full h-full object-contain transition-opacity duration-200"
        priority
        key={logoSrc}
      />
    </div>
  )
}

export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-foreground tracking-tight">BLOKK LENS</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-0.5">Real-time Tracking</span>
      </div>
    </div>
  )
}
