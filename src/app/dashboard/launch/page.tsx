import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Orbit, ArrowLeft, Rocket } from 'lucide-react'
import { signout } from '@/app/login/actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ScoutButton } from '@/components/dashboard/ScoutButton'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default async function LaunchPadPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: resume } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  const { data: preferences } = await supabase.from('preferences').select('*').eq('id', user.id).maybeSingle()

  const isReady = !!resume && !!preferences

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader showBack={true} title="Launch Pad" />

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 space-y-12 flex flex-col items-center justify-center text-center">
        
        <div className="w-32 h-32 rounded-[3rem] bg-orange-500/10 flex items-center justify-center mb-4 transform rotate-12 shadow-[0_0_50px_rgba(249,115,22,0.2)]">
          <Rocket className="w-16 h-16 text-orange-500" />
        </div>

        <h1 className="text-5xl font-black tracking-tight text-foreground">Initialize Agent Fleet</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Deploy your autonomous AI scouts to crawl job boards, extract raw intelligence, and mechanistically score matches against your constraints.
        </p>

        {!isReady ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl max-w-lg mx-auto mt-8">
            <h3 className="text-red-500 font-bold mb-2">Systems Not Ready</h3>
            <p className="text-sm text-red-500/80 mb-4">You must complete your profile and upload a resume before launching the fleet.</p>
            <Link href="/dashboard/profile" className="inline-block bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-colors">
              Configure Profile
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-xl mx-auto mt-12">
            <ScoutButton />
          </div>
        )}

      </main>
    </div>
  )
}
