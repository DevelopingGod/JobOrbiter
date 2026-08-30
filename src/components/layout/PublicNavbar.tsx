'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Orbit, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/utils/supabase/client'

export function PublicNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setIsLoading(false)
    }
    checkAuth()
  }, [])
  return (
    <header className="fixed top-0 w-full p-6 md:px-12 flex justify-between items-center z-50 glass border-b-0 shadow-sm transition-all duration-300">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
            <Orbit className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-foreground drop-shadow-md">
            Job Orbiter
          </span>
        </Link>
      </motion.div>
      
      <motion.nav
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-4"
      >
        <ThemeToggle />
        {!isLoading && (
          isLoggedIn ? (
            <Link href="/dashboard" className="bg-orange-500 text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-orange-600 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="bg-foreground text-background px-8 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-500 hover:text-white transition-all shadow-md hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              Sign In
            </Link>
          )
        )}
      </motion.nav>
    </header>
  )
}
