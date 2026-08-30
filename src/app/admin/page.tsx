import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Orbit, Users, Activity, Settings, Database, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { signout } from '@/app/login/actions'
import { revalidatePath } from 'next/cache'
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if admin (Assuming role column exists or user is specifically authorized)
  // For safety in this demo, if you haven't added 'role' column yet, you might need to run the SQL migration.
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  
  if (profile?.role !== 'admin' && user.email !== 'admin@orbiter.io') {
    // We allow admin@orbiter.io as a fallback admin
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
        <Orbit className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
        <h1 className="text-3xl font-black text-foreground mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">You must have Level 5 Admin clearance to view this page.</p>
        <Link href="/dashboard" className="bg-foreground text-background px-6 py-3 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all">
          Return to Mission Control
        </Link>
      </div>
    )
  }

  // Fetch global metrics
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: matchesCount } = await supabase.from('job_matches').select('*', { count: 'exact', head: true })
  const { data: allSources } = await supabase.from('job_sources').select('*')

  // Group sources by id to see popular ones
  const sourceStats: Record<string, number> = {}
  allSources?.forEach(s => {
    sourceStats[s.source_id] = (sourceStats[s.source_id] || 0) + 1
  })

  // Action to toggle global agents (for this user, or ideally a global table, but here we just simulate fixing an agent)
  async function toggleAgent(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const sourceId = formData.get('sourceId') as string
    const isActive = formData.get('isActive') === 'true'
    
    // Disable this source for all users (Emergency kill switch)
    await supabase.from('job_sources').update({ is_active: !isActive }).eq('source_id', sourceId)
    revalidatePath('/admin')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full p-6 md:px-12 flex justify-between items-center z-50 glass border-b border-border/50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-colors text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Orbit className="w-6 h-6 text-red-500" />
            <span className="font-extrabold text-xl tracking-tighter text-foreground">
              Orbiter Admin
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <form action={signout}>
            <button type="submit" className="bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-destructive hover:text-white transition-all">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 space-y-8">
        <h1 className="text-4xl font-black text-foreground drop-shadow-sm">Global Telemetry</h1>
        <AdminDashboardContent usersCount={usersCount || 0} matchesCount={matchesCount || 0} sourceStats={sourceStats} />
      </main>
    </div>
  )
}
