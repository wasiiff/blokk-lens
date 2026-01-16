import { TrendingUp, Shield, Zap } from "lucide-react"
import { GlowOrb } from "./decorative-svg"

export default function HeroSection() {
  return (
    <div className="relative py-20 overflow-hidden">
      <div className="absolute top-10 right-10 pointer-events-none opacity-40">
        <GlowOrb className="w-96 h-96" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-gradient">Track Crypto</span>
          <br />
          <span className="text-white">Like a Pro</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Real-time cryptocurrency tracking with advanced analytics, 
          personalized watchlists, and instant market insights.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="glass-effect p-6 rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Real-time Data</h3>
            <p className="text-gray-400 text-sm">
              Live price updates from CoinGecko API
            </p>
          </div>

          <div className="glass-effect p-6 rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Secure</h3>
            <p className="text-gray-400 text-sm">
              Protected with NextAuth authentication
            </p>
          </div>

          <div className="glass-effect p-6 rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Fast</h3>
            <p className="text-gray-400 text-sm">
              Built with Next.js 14 for optimal performance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
