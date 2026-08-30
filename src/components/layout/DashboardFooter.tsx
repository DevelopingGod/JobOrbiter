import Link from 'next/link'

export function DashboardFooter() {
  return (
    <footer className="w-full bg-background/50 border-t border-border/50 py-12 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
        <p className="font-medium">© 2026 Job Searcher AI by Sankalp Indish.</p>
        <nav className="flex gap-4 md:gap-8 text-sm text-muted-foreground font-medium">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/architecture" className="hover:text-foreground transition-colors text-orange-500">Architecture</Link>
          <Link href="/policy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </nav>
      </div>
    </footer>
  )
}
