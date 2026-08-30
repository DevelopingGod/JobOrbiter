import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { DashboardFooter } from '@/components/layout/DashboardFooter'
import { JOChatConsole } from '@/components/onboarding/JOChatConsole'

export default async function JOPermanentConsolePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  const isAdmin = user.email === 'admin@orbiter.io' || profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background glow specific to JO */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.05)_0%,_transparent_60%)] pointer-events-none" />

      {/* Consistent Header */}
      <DashboardHeader isAdmin={isAdmin} showBack={true} title="JO Console" />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12 space-y-8 flex flex-col h-full z-10">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Talk to JO</h1>
          <p className="text-lg text-muted-foreground">Your autonomous recruitment companion. Ask questions, tweak constraints, or command the fleet.</p>
        </div>

        <div className="flex-1 min-h-[600px] relative w-full max-w-3xl mx-auto md:mx-0">
          <JOChatConsole standalone={true} />
        </div>
      </main>

      {/* Consistent Footer */}
      <DashboardFooter />
    </div>
  )
}
