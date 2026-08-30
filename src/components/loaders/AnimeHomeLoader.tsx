'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Orbit } from 'lucide-react'

export function AnimeHomeLoader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide loader after 2.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="anime-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Cyber/Anime Background Grid & Lines */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,165,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <motion.div 
            initial={{ height: '0%' }}
            animate={{ height: '100%' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/4 w-[1px] bg-orange-500/50"
          />
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="absolute top-1/3 h-[1px] bg-orange-500/50"
          />

          {/* Glitching Kanji Background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.8, 0.2, 0.9, 0.1, 0.5], scale: 1 }}
            transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
            className="absolute text-[30vw] font-black text-orange-500/10 whitespace-nowrap select-none pointer-events-none mix-blend-screen"
          >
            起動
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: [0, 0.5, 0], x: 100 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute text-[40vw] font-black text-red-500/5 whitespace-nowrap select-none pointer-events-none mix-blend-screen tracking-tighter"
          >
            探求
          </motion.div>

          {/* Central Core */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ rotate: 0, scale: 0.8 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{ 
                rotate: { duration: 2, ease: "linear", repeat: Infinity },
                scale: { duration: 0.5, ease: "easeOut" }
              }}
              className="w-32 h-32 rounded-full border-4 border-dashed border-orange-500/80 flex items-center justify-center relative"
            >
              {/* Inner solid ring */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-2 border-2 border-orange-400 rounded-full"
              />
              <Orbit className="w-12 h-12 text-white animate-pulse" />
            </motion.div>

            {/* Typography */}
            <motion.div 
              className="mt-8 text-center overflow-hidden"
            >
              <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.4 }}
                className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic pr-4"
              >
                Job<span className="text-orange-500">Orbiter</span>
              </motion.h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-1 bg-gradient-to-r from-orange-500 to-red-500 mt-2"
              />

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-4 flex items-center justify-center gap-4 text-xs font-mono text-orange-300 uppercase tracking-[0.3em]"
              >
                <span>[System Boot]</span>
                <motion.span 
                  animate={{ opacity: [1, 0, 1] }} 
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  Analyzing Data Streams...
                </motion.span>
              </motion.div>
            </motion.div>
          </div>

          {/* expanding rings overlay */}
          <motion.div
            initial={{ scale: 0, opacity: 1, borderWidth: '50px' }}
            animate={{ scale: 4, opacity: 0, borderWidth: '0px' }}
            transition={{ duration: 1.5, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-[40vh] h-[40vh] rounded-full border-orange-500 pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
