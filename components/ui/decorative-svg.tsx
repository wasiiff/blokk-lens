export function WaveDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wave-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        d="M0 100 Q100 50 200 100 T400 100"
        stroke="url(#wave-gradient)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0 120 Q100 170 200 120 T400 120"
        stroke="url(#wave-gradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}

export function GridDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#grid)" />
    </svg>
  )
}

export function CircuitDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="3" fill="#3b82f6" opacity="0.3" />
      <circle cx="150" cy="80" r="3" fill="#8b5cf6" opacity="0.3" />
      <circle cx="250" cy="120" r="3" fill="#ec4899" opacity="0.3" />
      <path
        d="M50 50 L150 80 L250 120"
        stroke="rgba(59, 130, 246, 0.2)"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <circle cx="100" cy="200" r="3" fill="#3b82f6" opacity="0.3" />
      <circle cx="200" cy="250" r="3" fill="#8b5cf6" opacity="0.3" />
      <path
        d="M100 200 L200 250"
        stroke="rgba(139, 92, 246, 0.2)"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
    </svg>
  )
}

export function GlowOrb({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="orb-gradient">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#orb-gradient)" />
    </svg>
  )
}
