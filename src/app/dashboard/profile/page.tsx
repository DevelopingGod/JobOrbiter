import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { signout } from '@/app/login/actions'
import { Orbit, FileText, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { ProfileSettingsForm } from '@/components/dashboard/ProfileSettingsForm'
import { ResumeUploader } from '@/components/dashboard/ResumeUploader'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { DashboardFooter } from '@/components/layout/DashboardFooter'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle() // Profile should exist
  const { data: preferences } = await supabase.from('preferences').select('*').eq('id', user.id).maybeSingle()
  const { data: resume } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()

  const isAdmin = user.email === 'admin@orbiter.io' || profile?.role === 'admin'

  // Generate a signed URL to view the resume PDF
  let resumeUrl = null
  if (resume?.storage_path) {
    const { data } = await supabase.storage.from('resumes').createSignedUrl(resume.storage_path, 3600)
    resumeUrl = data?.signedUrl
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-background to-background pointer-events-none z-0" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-[0.03] z-0 pointer-events-none" />

      <DashboardHeader isAdmin={isAdmin} title="Agent Profile" />

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 space-y-8 relative z-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Identity & Settings</h1>
          <p className="text-lg text-muted-foreground">Manage your recruitment constraints and view your parsed resume DNA.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Settings Form */}
          <div className="glass p-8 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden group">
            {/* Ambient hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="p-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-inner">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Constraints</h2>
            </div>
            
            <div className="relative z-10">
              <ProfileSettingsForm initialPreferences={preferences} />
            </div>
          </div>

          {/* Resume Viewer */}
          <div className="glass p-8 rounded-[2.5rem] border border-border shadow-2xl flex flex-col h-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">Resume DNA</h2>
              </div>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold bg-foreground text-background px-4 py-2 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-md active:scale-95">
                  View Source PDF
                </a>
              )}
            </div>

            <div className="flex-1 bg-background/50 rounded-2xl border border-border p-6 overflow-auto font-mono text-xs text-muted-foreground whitespace-pre-wrap max-h-[500px] relative z-10 shadow-inner custom-scrollbar">
              {resume?.parsed_json ? JSON.stringify(resume.parsed_json, null, 2) : <ResumeUploader hasResume={false} />}
            </div>
            
            {resume && (
              <div className="mt-4 relative z-10">
                <ResumeUploader hasResume={true} />
              </div>
            )}
          </div>

        </div>
      </main>
      
      {/* Consistent Footer */}
      <DashboardFooter />

      {/* Global CSS for scrollbar if not defined globally */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 20px;
        }
      `}</style>
    </div>
  )
}
