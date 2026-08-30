import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Orbit, Activity, ShieldAlert, Rocket } from 'lucide-react'
import { signout } from '@/app/login/actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import { JobCard } from '@/components/dashboard/JobCard'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { DashboardFooter } from '@/components/layout/DashboardFooter'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch resume to see if onboarding is complete
  const { data: resume } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch job matches
  const { data: jobMatches } = await supabase
    .from('job_matches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const matches = jobMatches || []
  const isAdmin = user.email === 'admin@orbiter.io' || profile?.role === 'admin'
  const isSandbox = !resume

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Consistent Header */}
      <DashboardHeader isAdmin={isAdmin} title="Job Orbiter" />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        {isSandbox && (
          <div className="w-full bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-orange-500 flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5" />
                Sandbox Mode Active
              </h2>
              <p className="text-sm text-muted-foreground">
                You skipped onboarding. Your agents do not have a resume or constraints to evaluate against. Results will be highly inaccurate until you configure your profile.
              </p>
            </div>
            <Link href="/dashboard/profile" className="whitespace-nowrap bg-orange-500 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg">
              Complete Profile
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Mission Control</h1>
          <p className="text-lg text-muted-foreground">Welcome back, {profile?.first_name || 'Agent'}. View analytics and history below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="glass p-8 rounded-[2rem] border border-border shadow-xl h-72 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent z-0 pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 mb-6 relative z-10">
              <span className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-orange-500"></span>
              </span>
            </div>
            <h3 className="font-bold text-2xl text-foreground relative z-10 mb-2">Fleet Standby</h3>
            <p className="text-sm text-muted-foreground relative z-10">
              Agents are awaiting deployment orders.
            </p>
          </div>

          {/* Stats Card */}
          <div className="glass p-8 rounded-[2rem] border border-border shadow-xl h-72 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border border-border mb-6">
              <Activity className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="font-bold text-4xl text-foreground mb-2">{matches.length}</h3>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Matches Found
            </p>
          </div>
          
          {/* Action Card */}
          <div className="glass p-8 rounded-[2rem] border border-border shadow-xl h-72 flex flex-col items-center justify-center text-center group hover:border-orange-500/50 transition-colors">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-2xl text-foreground mb-2">Deploy Agents</h3>
            <Link href="/dashboard/launch" className="text-sm font-bold bg-foreground text-background px-6 py-2.5 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-md mt-4">
              Open Launch Pad
            </Link>
          </div>
        </div>

        {/* Dynamic Charts & Metrics */}
        {matches.length > 0 && <DashboardMetrics matches={matches} />}

        {/* Intelligence Feed */}
        <div className="space-y-6 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Intelligence Feed</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Updates
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {matches.length === 0 ? (
              <div className="glass p-12 rounded-[2rem] border border-border text-center flex flex-col items-center justify-center">
                <Orbit className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Intelligence</h3>
                <p className="text-muted-foreground max-w-sm">No matches found yet. Go to the Launch Pad to deploy the agent scout.</p>
                <div className="max-w-md mt-6 text-sm bg-orange-500/5 text-orange-500/90 p-4 rounded-xl border border-orange-500/20 text-left">
                  <strong className="block mb-1 text-orange-500">Agent Tip:</strong> 
                  If you recently completed a scout mission and see zero results, your constraints might be too strict. Try lowering your minimum salary or broadening your desired roles in your Profile settings.
                </div>
              </div>
            ) : (
              matches.map((match) => (
                <JobCard key={match.id} match={match} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Consistent Footer */}
      <DashboardFooter />
    </div>
  )
}
