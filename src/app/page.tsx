'use client'

import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ArrowRight, Orbit, BrainCircuit, Network, Zap, ShieldCheck, Database, LineChart } from 'lucide-react'
import { Suspense } from 'react'
import { AnimeHomeLoader } from '@/components/loaders/AnimeHomeLoader'
import { PublicNavbar } from '@/components/layout/PublicNavbar'

// Lazy load the 3D scene for better performance (parallel hydration)
const OrbiterScene = dynamic(
  () => import('@/components/3d/OrbiterScene').then((mod) => mod.OrbiterScene),
  { ssr: false }
)

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2 // Wait for 3D scene to initialize to prevent stutter
    }
  }
}

export default function Home() {
  return (
    <main className="relative flex flex-col bg-background selection:bg-orange-500/30">
      <AnimeHomeLoader />
      
      {/* 3D Master's Level Scene - Fixed Background */}
      <Suspense fallback={null}>
        <OrbiterScene />
      </Suspense>

      {/* Glassmorphism Navigation/Header */}
      <PublicNavbar />

      {/* SECTION 1: HERO (min-h-screen to prevent layout overlap) */}
      <section className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-16 lg:px-24 pt-32 pb-20 max-w-[1400px] w-full mx-auto pointer-events-none">
        
        <div className="flex flex-col items-start text-left max-w-2xl pointer-events-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start"
            style={{ willChange: "transform, opacity" }}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <span className="text-sm font-bold text-foreground tracking-wide uppercase text-xs">Autonomous Agent Active</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-foreground mb-6 leading-[1.05] drop-shadow-xl">
              Find your <br /> next role on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                autopilot mode.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-xl font-medium leading-relaxed drop-shadow-md">
              Upload your resume and set your constraints. Our <span className="font-semibold text-foreground">AI agents</span> scour the web, evaluate matches, and present the perfect opportunities in real-time.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/login" className="group flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-500 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                Initialize Orbiter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-500 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                View Live Demo
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: INTELLIGENT FEATURES */}
      <section className="relative z-10 w-full bg-background/90 backdrop-blur-3xl border-t border-border/50 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
              Beyond Keyword Matching.
            </h2>
            <p className="text-xl text-muted-foreground">
              Job Orbiter utilizes advanced LLM chains and RLHF (Reinforcement Learning from Human Feedback) to truly understand your career trajectory, not just parse keywords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                <BrainCircuit className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Semantic Evaluation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Agents read job descriptions like a human recruiter, mapping your raw experience to implied requirements and evaluating cultural fit.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                <Network className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Continuous Scraping</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributed scraping agents constantly monitor target companies, startup boards, and hidden tech pipelines so you are always the first to apply.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                <ShieldCheck className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">RLHF Feedback Loop</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reject a job? The model learns exactly why. Our RLAIF architecture dynamically updates your latent preference vector with every interaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ARCHITECTURE / HOW IT WORKS */}
      <section className="relative z-10 w-full bg-secondary/30 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
              The Architecture.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              A transparent, high-performance pipeline built for engineers. Watch your agents work in real-time.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-orange-500/50 to-transparent transform -translate-x-1/2 hidden md:block" />

            <div className="space-y-12 md:space-y-24 relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 flex justify-start md:justify-end text-left md:text-right">
                  <div className="max-w-md">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white font-black text-xl mb-6 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                      1
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-4">Ingestion & Structuring</h3>
                    <p className="text-muted-foreground text-lg">
                      Upload your PDF. An LLM agent reads it and extracts your contact info, skills, work history, and education into structured data, ready for matching.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                  <div className="glass w-full max-w-md p-6 rounded-2xl border-orange-500/30 font-mono text-xs text-left overflow-hidden relative">
                    <Database className="w-8 h-8 text-orange-500 mb-4" />
                    <pre className="text-muted-foreground whitespace-pre-wrap">
                      <span className="text-orange-400">{"{"}</span>{`
  "status": "success",
  "skills": [`}
                      <span className="text-orange-500">"React", "System Design", "RLHF"</span>
                      {`],
  "experience": [
    { "title": "Senior Engineer", "company": "..." }
  ]
`}<span className="text-orange-400">{"}"}</span>
                    </pre>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 flex justify-start text-left">
                  <div className="max-w-md">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white font-black text-xl mb-6 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                      2
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-4">Autonomous Scouting</h3>
                    <p className="text-muted-foreground text-lg">
                      The core loop dispatches lightweight scraper agents to index roles across multiple platforms, adhering strictly to your remote, salary, and title constraints.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                  <div className="glass w-full max-w-md p-6 rounded-2xl border-orange-500/30 font-mono text-xs text-left overflow-hidden relative">
                    <Zap className="w-8 h-8 text-orange-500 mb-4" />
                    <div className="flex flex-col gap-2 text-muted-foreground">
                      <p><span className="text-emerald-500">[20:41:03]</span> [Agent_Scout] Spawned 12 threads.</p>
                      <p><span className="text-emerald-500">[20:41:04]</span> Connecting to YC Work at a Startup...</p>
                      <p><span className="text-orange-500">[20:41:08]</span> Found 1,204 roles. Filtering...</p>
                      <p><span className="text-emerald-500">[20:41:12]</span> Match found: "Senior AI Engineer". Pushing to evaluation queue.</p>
                      <div className="w-2 h-4 bg-orange-500 animate-pulse mt-2" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 flex justify-start md:justify-end text-left md:text-right">
                  <div className="max-w-md">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white font-black text-xl mb-6 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                      3
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-4">Mechanistic Scoring</h3>
                    <p className="text-muted-foreground text-lg">
                      You receive a curated dashboard of matches. Every match includes a transparent, structured JSON breakdown of exactly why the LLM scored it highly against your profile.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                  <div className="glass w-full max-w-md p-6 rounded-2xl border-orange-500/30 text-left">
                    <LineChart className="w-8 h-8 text-orange-500 mb-4" />
                    <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
                      <div>
                        <h4 className="font-bold text-foreground">Anthropic</h4>
                        <p className="text-xs text-muted-foreground">Member of Technical Staff</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-sm">
                        94% Match
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Tech Stack Alignment</span>
                          <span className="text-orange-500 font-mono">0.98</span>
                        </div>
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="w-[98%] h-full bg-orange-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Experience Constraint</span>
                          <span className="text-orange-500 font-mono">0.92</span>
                        </div>
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="w-[92%] h-full bg-orange-500 opacity-80" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA FOOTER */}
      <footer className="relative z-10 w-full bg-background border-t border-border/50 py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <Orbit className="w-16 h-16 text-orange-500 mx-auto mb-8 animate-spin-slow" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-8">
            Ready to deploy your agents?
          </h2>
          <Link href="/login" className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-10 py-5 rounded-full font-bold text-xl hover:bg-orange-500 hover:text-white transition-all hover:scale-[1.02] shadow-xl">
            Start the Engine
            <ArrowRight className="w-6 h-6" />
          </Link>
          
          <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
            <p>© 2026 Job Orbiter. Master's Project.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/policy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/architecture" className="hover:text-foreground">Architecture</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
