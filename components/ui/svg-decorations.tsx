export function FloatingLines({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="line-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path d="M0 300 Q200 100 400 300 T800 300" stroke="url(#line-gradient-1)" strokeWidth="1.5" fill="none" />
      <path d="M0 350 Q200 550 400 350 T800 350" stroke="url(#line-gradient-2)" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M100 0 Q300 300 100 600" stroke="url(#line-gradient-1)" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M700 0 Q500 300 700 600" stroke="url(#line-gradient-2)" strokeWidth="1" fill="none" opacity="0.4" />
      <circle cx="200" cy="150" r="2" fill="#3b82f6" opacity="0.5" />
      <circle cx="600" cy="450" r="2" fill="#ec4899" opacity="0.5" />
      <circle cx="400" cy="300" r="3" fill="#8b5cf6" opacity="0.4" />
    </svg>
  )
}

export function GlowingOrb({ className = "", color = "blue" }: { className?: string; color?: "blue" | "purple" | "pink" }) {
  const colors = {
    blue: { start: "#3b82f6", end: "#1d4ed8" },
    purple: { start: "#8b5cf6", end: "#6d28d9" },
    pink: { start: "#ec4899", end: "#be185d" },
  }
  const { start, end } = colors[color]

  return (
    <svg className={className} viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`orb-${color}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={start} stopOpacity="0.3" />
          <stop offset="50%" stopColor={end} stopOpacity="0.1" />
          <stop offset="100%" stopColor={end} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="300" fill={`url(#orb-${color})`} />
    </svg>
  )
}

export function ConnectingDots({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dot-line" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="4" fill="#3b82f6" opacity="0.6" />
      <circle cx="150" cy="100" r="3" fill="#8b5cf6" opacity="0.5" />
      <circle cx="250" cy="60" r="4" fill="#ec4899" opacity="0.6" />
      <circle cx="350" cy="120" r="3" fill="#3b82f6" opacity="0.5" />
      <circle cx="100" cy="180" r="3" fill="#ec4899" opacity="0.5" />
      <circle cx="200" cy="220" r="4" fill="#8b5cf6" opacity="0.6" />
      <circle cx="300" cy="200" r="3" fill="#3b82f6" opacity="0.5" />
      <path d="M50 50 L150 100 L250 60 L350 120" stroke="url(#dot-line)" strokeWidth="1" fill="none" />
      <path d="M100 180 L200 220 L300 200" stroke="url(#dot-line)" strokeWidth="1" fill="none" />
      <path d="M150 100 L100 180" stroke="url(#dot-line)" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M250 60 L200 220" stroke="url(#dot-line)" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  )
}

export function HexagonGrid({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hex-pattern" width="60" height="52" patternUnits="userSpaceOnUse">
          <path
            d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#hex-pattern)" />
    </svg>
  )
}

export function PulseRings({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="30" stroke="url(#ring-gradient)" strokeWidth="1" fill="none" />
      <circle cx="100" cy="100" r="50" stroke="url(#ring-gradient)" strokeWidth="1" fill="none" opacity="0.7" />
      <circle cx="100" cy="100" r="70" stroke="url(#ring-gradient)" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="100" cy="100" r="90" stroke="url(#ring-gradient)" strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  )
}


export function HeroGlow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hero-glow-1" cx="20%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-glow-2" cx="80%" cy="60%" r="35%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-glow-3" cx="50%" cy="80%" r="30%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#hero-glow-1)" />
      <rect width="1200" height="800" fill="url(#hero-glow-2)" />
      <rect width="1200" height="800" fill="url(#hero-glow-3)" />
    </svg>
  )
}
