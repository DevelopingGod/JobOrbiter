import Link from 'next/link'
import { Orbit, ShieldAlert, Home, ArrowLeft } from 'lucide-react'
import { signout } from '@/app/login/actions'
import { ThemeToggle } from '@/components/ThemeToggle'

interface DashboardHeaderProps {
  isAdmin?: boolean
  showBack?: boolean
  title?: string
}

export function DashboardHeader({ isAdmin = false, showBack = false, title = "Job Orbiter" }: DashboardHeaderProps) {
  return (
    <header className="w-full p-6 md:px-12 flex justify-between items-center z-50 glass border-b border-border/50 shadow-sm transition-all duration-300 relative">
      <div className="flex items-center gap-6">
        {showBack && (
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-colors text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
            <Orbit className="w-5 h-5 text-white animate-spin-slow" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <span className="font-extrabold text-xl tracking-tighter text-foreground">
              {title}
            </span>
            <nav className="flex items-center gap-4 border-l border-border/50 pl-6">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Mission Control</Link>
              <Link href="/dashboard/jo" className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                JO Console
              </Link>
            </nav>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm font-semibold hover:text-orange-500 transition-colors flex items-center gap-2">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        {isAdmin && (
          <Link href="/admin" className="text-red-500 font-bold text-sm hover:text-red-400 transition-colors flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Console</span>
          </Link>
        )}
        <ThemeToggle />
        <form action={signout}>
          <button type="submit" className="bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-destructive hover:text-white transition-all shadow-md cursor-pointer">
            Abort Mission
          </button>
        </form>
      </div>
    </header>
  )
}
