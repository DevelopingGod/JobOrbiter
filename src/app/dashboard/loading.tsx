'use client'
import { Orbit, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function DashboardLoading() {
  const [dots, setDots] = useState('')
  const [timeMs, setTimeMs] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
      setTimeMs(t => t + 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-background to-background pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-[spin_2s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-orange-400/50 animate-[spin_3s_linear_infinite_reverse]" />
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse">
            <Orbit className="w-6 h-6 text-orange-500" />
          </div>
        </div>

        <div className="mt-8 text-center space-y-2">
          <h2 className="text-2xl font-black tracking-widest uppercase text-foreground">
            Deploying <span className="text-orange-500">Scout Agents</span>{dots}
          </h2>
          <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm font-mono bg-muted/30 px-4 py-2 rounded-full border border-border">
            <Activity className="w-4 h-4 animate-pulse text-orange-500" />
            <span>Establishing secure connection...</span>
            <span className="text-orange-500 font-bold">{(timeMs / 1000).toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}
