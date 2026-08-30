'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false)
  
  // Use framer-motion values to avoid React re-renders on every mouse move
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics for the outer ring (the "Orbiter")
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15, mass: 0.5 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15, mass: 0.5 })

  useEffect(() => {
    setIsMounted(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseX, mouseY])

  if (!isMounted) return null

  // We use fixed positioning, pointer-events-none so it doesn't block clicks,
  // and mix-blend-difference so it inverts on white/black backgrounds nicely,
  // but since we want an orange orbiter, we'll keep it standard z-index.
  return (
    <>
      {/* Outer Spring Ring (The Orbiter) */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-orange-500 rounded-full pointer-events-none z-[9999]"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        {/* Inner rotating orbit element */}
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_10px_#f97316] -translate-x-1/2 -translate-y-1/2 animate-spin-slow origin-[50%_20px]" />
      </motion.div>

      {/* Inner Dot (Instant track) */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-orange-500 rounded-full pointer-events-none z-[9999] shadow-[0_0_10px_#f97316]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  )
}
