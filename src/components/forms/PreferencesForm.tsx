'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function PreferencesForm({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    // In a real implementation, we would extract this from FormData and send to a Server Action
    // For now, we simulate the DB insert to complete the onboarding
    setTimeout(() => {
      setLoading(false)
      onComplete()
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full text-left">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Desired Roles (comma separated)</label>
        <input
          name="roles"
          type="text"
          required
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          placeholder="Software Engineer, Frontend Developer"
          defaultValue="Full Stack Engineer, AI Engineer"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Minimum Salary (USD)</label>
        <input
          name="minSalary"
          type="number"
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          placeholder="100000"
          defaultValue="120000"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="remote"
          name="remoteOnly"
          className="w-5 h-5 rounded border-zinc-800 bg-zinc-900/50 text-orange-500 focus:ring-orange-500"
          defaultChecked
        />
        <label htmlFor="remote" className="text-sm font-medium text-zinc-300">
          Remote Only
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-bold hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.3)] mt-8"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalize Initialization'}
      </button>
    </form>
  )
}
