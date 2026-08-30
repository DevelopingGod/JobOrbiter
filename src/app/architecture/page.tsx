import { createClient } from '@/utils/supabase/server'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { ArchitectureGraph } from '@/components/dashboard/ArchitectureGraph'

export default async function ArchitecturePage() {
  const supabase = await createClient()

  // We do not redirect if unauthenticated. The page is public.
  const { data: { user } } = await supabase.auth.getUser()
  
  let userSources: any[] = []
  
  if (user) {
    // If the user is logged in, fetch their specific sources
    const { data: sourcesData } = await supabase
      .from('job_sources')
      .select('source_id, is_active')
      .eq('user_id', user.id)
    
    if (sourcesData) {
      userSources = sourcesData
    }
  } else {
    // Default mock sources for public view
    userSources = [
      { source_id: 'remotive', is_active: true },
      { source_id: 'hackernews', is_active: true }
    ]
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-32 md:px-12 space-y-8 flex flex-col h-full z-10 relative pointer-events-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Agent Architecture</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Interactive visualization of your AI recruitment pipeline. {user ? "Showing your specific active scraping sources." : "Log in to add custom scraping endpoints."}
          </p>
        </div>

        <div className="flex-1 min-h-[700px] relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
          <ArchitectureGraph userSources={userSources} isLoggedIn={!!user} />
        </div>
      </main>
    </div>
  )
}
