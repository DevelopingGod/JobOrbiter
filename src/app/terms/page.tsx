import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { DashboardFooter } from '@/components/layout/DashboardFooter'
import { Scale, FileSignature, AlertTriangle } from 'lucide-react'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.05)_0%,_transparent_50%)] pointer-events-none" />
      <PublicNavbar />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-12 z-10 relative">
        <div className="text-center space-y-4 mb-16">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-inner">
            <Scale className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Effective Date: August 15, 2026</p>
        </div>

        <div className="grid gap-8">
          <section className="glass p-8 rounded-3xl border border-border shadow-lg group hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <FileSignature className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Job Orbiter, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border border-border shadow-lg group hover:border-rose-500/50 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-foreground">2. User Conduct & Agent Usage</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Job Orbiter provides autonomous AI agents that scour job boards and evaluate matches against your provided constraints. We do not guarantee employment. You agree to not use the service for any illegal purpose, or to upload malware, or to abuse the scraping endpoints intentionally. High-frequency polling outside the automated agent bounds is strictly prohibited.
            </p>
          </section>
        </div>
      </div>
      <DashboardFooter />
    </main>
  )
}
