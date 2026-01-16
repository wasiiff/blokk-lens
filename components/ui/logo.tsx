export function Logo({ className = "", size = "default" }: { className?: string; size?: "sm" | "default" | "lg" }) {
  const sizes = {
    sm: { wrapper: "w-8 h-8", icon: "w-4 h-4" },
    default: { wrapper: "w-10 h-10", icon: "w-5 h-5" },
    lg: { wrapper: "w-14 h-14", icon: "w-7 h-7" },
  }
  const s = sizes[size]

  return (
    <div className={`${s.wrapper} relative ${className}`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-sm opacity-75" />
      <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <svg className={s.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 2L2 7L12 12L22 7L12 2Z" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.2)"
          />
          <path 
            d="M2 17L12 22L22 17" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M2 12L12 17L22 12" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-white tracking-tight">CryptoPulse</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest -mt-0.5">Real-time Tracking</span>
      </div>
    </div>
  )
}
