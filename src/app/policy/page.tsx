import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { DashboardFooter } from '@/components/layout/DashboardFooter'
import { ShieldCheck, Lock, Database } from 'lucide-react'

export default function PolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.05)_0%,_transparent_50%)] pointer-events-none" />
      <PublicNavbar />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-12 z-10 relative">
        <div className="text-center space-y-4 mb-16">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Effective Date: August 15, 2026</p>
        </div>

        <div className="grid gap-8">
          <section className="glass p-8 rounded-3xl border border-border shadow-lg group hover:border-orange-500/50 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <Database className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-foreground">1. Data Collection</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Job Orbiter collects resume data exclusively for the purpose of matching you with employment opportunities. When you upload a resume (PDF parsing), this data is transformed into vector embeddings and stored securely in our heavily-guarded PostGIS pgvector instances. We do not peek at this data unless strictly necessary.
            </p>
          </section>

          <section className="glass p-8 rounded-3xl border border-border shadow-lg group hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <Lock className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-foreground">2. Data Usage & Security</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your data is fed securely into isolated LLM (Large Language Model) context windows for semantic scoring against job descriptions. We do not sell your personal data to third-party brokers. All connections are encrypted in transit and at rest.
            </p>
          </section>
        </div>
      </div>
      <DashboardFooter />
    </main>
  )
}
