'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Orbit, Loader2, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { unstable_rethrow } from 'next/navigation'
import { login, signup } from './actions'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    try {
      const result = isLogin ? await login(formData) : await signup(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err) {
      // login()/signup() call redirect() on success, which Next.js implements
      // by throwing a special internal error — it must be allowed to keep
      // propagating, not treated as a real failure. See:
      // node_modules/next/dist/docs/.../unstable_rethrow.md
      unstable_rethrow(err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        
        {/* Pulsing Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px]" 
        />
      </div>

      {/* Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-orange-500 transition-colors font-medium text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Return to Orbit
      </Link>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md relative z-10 mx-4"
      >
        <div className="glass p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
          {/* Decorative Corner Gradients inside the card */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl" />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative"
          >
            <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                <Orbit className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Orbit'}
              </h2>
              <p className="text-muted-foreground text-sm text-center font-medium">
                {isLogin 
                  ? 'Access your autonomous job scraping agents.' 
                  : 'Create an account to put your job search on autopilot.'}
              </p>
            </motion.div>

            <form action={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name-fields"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex gap-4 overflow-hidden"
                  >
                    <div className="flex-1 space-y-1.5 relative group">
                      <User className="w-4 h-4 absolute left-3.5 top-[2.1rem] text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">First Name</label>
                      <input
                        name="firstName"
                        type="text"
                        required={!isLogin}
                        className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-muted-foreground/50"
                        placeholder="Jane"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5 relative group">
                      <User className="w-4 h-4 absolute left-3.5 top-[2.1rem] text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Last Name</label>
                      <input
                        name="lastName"
                        type="text"
                        required={!isLogin}
                        className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-muted-foreground/50"
                        placeholder="Doe"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="space-y-1.5 relative group">
                <Mail className="w-4 h-4 absolute left-3.5 top-[2.1rem] text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="agent@orbiter.io"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5 relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-[2.1rem] text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-12 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-muted-foreground/50"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[0.8rem] text-muted-foreground hover:text-orange-500 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-destructive text-xs font-semibold p-3 bg-destructive/10 rounded-xl border border-destructive/20 text-center">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center bg-foreground text-background py-4 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Initiate Link' : 'Construct Profile')}
                </button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-8 text-center pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                }}
                className="text-xs font-bold text-muted-foreground hover:text-orange-500 transition-colors uppercase tracking-wider"
              >
                {isLogin ? "No identity found? Request creation." : 'Identity verified? Authenticate here.'}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
