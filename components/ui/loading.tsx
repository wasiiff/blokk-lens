import { Loader2 } from "lucide-react"

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="glass-effect p-4 rounded-lg animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="flex-1">
          <div className="h-4 bg-white/10 rounded w-24 mb-2" />
          <div className="h-3 bg-white/10 rounded w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-white/10 rounded w-32" />
        <div className="h-4 bg-white/10 rounded w-20" />
      </div>
    </div>
  )
}
