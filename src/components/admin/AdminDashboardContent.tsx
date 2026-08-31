'use client'

import { useState } from 'react'
import { Users, Activity, Settings, Database, Server, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RegisteredUser {
  id: string
  name: string
  matches: number
  joinedAt: string
}

interface AdminProps {
  usersCount: number
  matchesCount: number
  sourceStats: Record<string, number>
  sourceActive: Record<string, boolean>
  users: RegisteredUser[]
  toggleAgent: (formData: FormData) => Promise<void>
}

export function AdminDashboardContent({ usersCount, matchesCount, sourceStats, sourceActive, users, toggleAgent }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'queries'>('overview')

  return (
    <div className="space-y-8">
      {/* Clickable Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <button 
          onClick={() => setActiveTab('users')}
          className={`glass p-6 rounded-3xl border text-left transition-all shadow-lg group hover:-translate-y-1 ${
            activeTab === 'users' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-border hover:border-blue-500/50 hover:bg-blue-500/5'
          }`}
        >
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 inline-block mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground group-hover:text-blue-400 transition-colors">Total Users</p>
            <h3 className="text-3xl font-black text-foreground">{usersCount || 0}</h3>
          </div>
        </button>
        
        <button 
          onClick={() => setActiveTab('queries')}
          className={`glass p-6 rounded-3xl border text-left transition-all shadow-lg group hover:-translate-y-1 ${
            activeTab === 'queries' ? 'border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 'border-border hover:border-green-500/50 hover:bg-green-500/5'
          }`}
        >
          <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 inline-block mb-4 group-hover:scale-110 transition-transform">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground group-hover:text-green-400 transition-colors">Total Queries / Extractions</p>
            <h3 className="text-3xl font-black text-foreground">{matchesCount || 0}</h3>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('overview')}
          className={`glass p-6 rounded-3xl border text-left transition-all shadow-lg group hover:-translate-y-1 ${
            activeTab === 'overview' ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.2)]' : 'border-border hover:border-orange-500/50 hover:bg-orange-500/5'
          }`}
        >
          <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 inline-block mb-4 group-hover:scale-110 transition-transform">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-orange-400 transition-colors">Active Agents</p>
            <h3 className="text-3xl font-black text-foreground">{Object.keys(sourceStats).length}</h3>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass p-8 rounded-[2rem] border border-border mt-8 relative z-10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-[2rem] pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 shadow-inner">
                <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Fleet Control</h2>
                <p className="text-sm text-muted-foreground">Manage and override active autonomous agents.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="pb-4 font-bold">Source ID / URL</th>
                    <th className="pb-4 font-bold">Users Connected</th>
                    <th className="pb-4 font-bold text-right">Emergency Override</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {Object.entries(sourceStats).map(([source, count]) => (
                    <tr key={source} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 font-mono text-foreground font-medium">{source}</td>
                      <td className="py-4 text-muted-foreground">{count} Users</td>
                      <td className="py-4 text-right">
                        <form action={toggleAgent} className="inline">
                          <input type="hidden" name="sourceId" value={source} />
                          <input type="hidden" name="isActive" value={String(sourceActive[source] ?? false)} />
                          <button
                            type="submit"
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors"
                          >
                            {sourceActive[source] ? 'Kill Agent' : 'Reactivate Agent'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(sourceStats).length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-muted-foreground">No active scraping agents detected.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass p-8 rounded-[2rem] border border-border mt-8 relative z-10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-[2rem] pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">User Registry</h2>
                <p className="text-sm text-muted-foreground">List of authorized personnel and their token consumption.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="pb-4 font-bold">Name</th>
                    <th className="pb-4 font-bold">User ID</th>
                    <th className="pb-4 font-bold">Matches Found</th>
                    <th className="pb-4 font-bold text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">No registered users.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-4 text-foreground font-medium">{u.name}</td>
                        <td className="py-4 font-mono text-muted-foreground text-xs">{u.id}</td>
                        <td className="py-4 text-muted-foreground">{u.matches}</td>
                        <td className="py-4 text-right text-muted-foreground text-xs">
                          {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'queries' && (
          <motion.div
            key="queries"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass p-8 rounded-[2rem] border border-border mt-8 relative z-10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-[2rem] pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500 shadow-inner">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">System Queries</h2>
                <p className="text-sm text-muted-foreground">Real-time inference logs and extractions.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Mock Logs */}
              {[
                { time: '14:32:01', msg: 'Match extraction completed for user_f9a8b1x...', status: 'SUCCESS' },
                { time: '14:31:15', msg: 'Crawling Remotive API page 3...', status: 'PROCESSING' },
                { time: '14:28:44', msg: 'Failed to connect to Custom Node (HTTP 502)', status: 'ERROR' },
                { time: '14:25:10', msg: 'JO Chat: Context window exceeded. Rotating logs.', status: 'WARN' }
              ].map((log, idx) => (
                <div key={idx} className="bg-background/50 border border-border p-4 rounded-xl flex items-center gap-4 font-mono text-xs">
                  <span className="text-muted-foreground w-16 flex-shrink-0">[{log.time}]</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    log.status === 'SUCCESS' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                    log.status === 'PROCESSING' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse' : 
                    log.status === 'WARN' ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 
                    'bg-red-500 shadow-[0_0_8px_#ef4444]'
                  }`} />
                  <span className={log.status === 'ERROR' ? 'text-red-400' : 'text-zinc-300'}>{log.msg}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
