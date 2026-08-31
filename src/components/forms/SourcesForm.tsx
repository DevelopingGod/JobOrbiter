'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Plus, Trash2, Link as LinkIcon } from 'lucide-react'

import { useRouter } from 'next/navigation'

interface Source {
  source_id: string
  is_active: boolean
}

export function SourcesForm({ onComplete, isLoggedIn = true }: { onComplete: () => void, isLoggedIn?: boolean }) {
  const router = useRouter()
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState('')

  useEffect(() => {
    async function fetchSources() {
      try {
        const res = await fetch('/api/sources')
        if (res.ok) {
          const data = await res.json()
          setSources(data.sources || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchSources()
  }, [])

  const toggleSource = async (sourceId: string, currentStatus: boolean) => {
    setSources(prev => {
      const exists = prev.find(s => s.source_id === sourceId)
      if (exists) {
        return prev.map(s => s.source_id === sourceId ? { ...s, is_active: !currentStatus } : s)
      }
      return [...prev, { source_id: sourceId, is_active: !currentStatus }]
    })

    try {
      await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_id: sourceId, is_active: !currentStatus })
      })
      router.refresh()
    } catch (e) {
      console.error('Failed to toggle source', e)
    }
  }

  const addCustomSource = async (e: React.FormEvent) => {
    e.preventDefault()
    let url = newUrl.trim()
    if (!url) return
    if (!url.startsWith('http')) url = 'https://' + url

    setNewUrl('')
    await toggleSource(url, false) // Will set to true
  }

  const isRemotiveActive = sources.find(s => s.source_id === 'remotive')?.is_active ?? true // default true
  const isHNActive = sources.find(s => s.source_id === 'hackernews')?.is_active ?? false // default false
  const isLinkedinActive = sources.find(s => s.source_id === 'linkedin')?.is_active ?? false
  const customSources = sources.filter(s => s.source_id.startsWith('http'))

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
          <LinkIcon className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-foreground">Authentication Required</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          You must be logged in to configure or view active scraping agents.
        </p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-4 text-sm text-muted-foreground animate-pulse">Loading sources...</div>
  }

  return (
    <div className="space-y-4">
      {/* Custom URL Input */}
      <form onSubmit={addCustomSource} className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input 
            type="url" 
            placeholder="Paste any job board URL..." 
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>
        <button 
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      <div className="h-[1px] bg-border my-4" />

      {/* Built-in Sources */}
      <div className="space-y-3">
        <button 
          onClick={() => toggleSource('remotive', isRemotiveActive)}
          className={`w-full flex items-center justify-between p-4 bg-background/50 border rounded-xl transition-all ${
            isRemotiveActive ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'border-border opacity-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {isRemotiveActive ? <CheckCircle2 className="w-5 h-5 text-orange-500" /> : <Circle className="w-5 h-5 text-zinc-500" />}
            <div className="text-left">
              <p className={`font-bold ${isRemotiveActive ? 'text-white' : 'text-zinc-400'}`}>Remotive API</p>
              <p className="text-xs text-zinc-500">Default remote tech jobs</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => toggleSource('hackernews', isHNActive)}
          className={`w-full flex items-center justify-between p-4 bg-background/50 border rounded-xl transition-all ${
            isHNActive ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'border-border opacity-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {isHNActive ? <CheckCircle2 className="w-5 h-5 text-orange-500" /> : <Circle className="w-5 h-5 text-zinc-500" />}
            <div className="text-left">
              <p className={`font-bold ${isHNActive ? 'text-white' : 'text-zinc-400'}`}>HackerNews</p>
              <p className="text-xs text-zinc-500">Who is hiring? thread</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => toggleSource('linkedin', isLinkedinActive)}
          className={`w-full flex items-center justify-between p-4 bg-background/50 border rounded-xl transition-all ${
            isLinkedinActive ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-border opacity-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {isLinkedinActive ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <Circle className="w-5 h-5 text-zinc-500" />}
            <div className="text-left">
              <p className={`font-bold ${isLinkedinActive ? 'text-white' : 'text-zinc-400'}`}>LinkedIn (Experimental)</p>
              <p className="text-xs text-zinc-500">Public job search (no login)</p>
            </div>
          </div>
        </button>
      </div>

      {/* Custom Sources */}
      {customSources.length > 0 && (
        <div className="pt-2 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Custom Agents</p>
          {customSources.map((source) => (
            <button 
              key={source.source_id}
              onClick={() => toggleSource(source.source_id, source.is_active)}
              className={`w-full flex items-center justify-between p-4 bg-background/50 border rounded-xl transition-all ${
                source.is_active ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'border-border opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {source.is_active ? <CheckCircle2 className="w-5 h-5 shrink-0 text-orange-500" /> : <Circle className="w-5 h-5 shrink-0 text-zinc-500" />}
                <div className="text-left truncate">
                  <p className={`font-bold truncate ${source.is_active ? 'text-white' : 'text-zinc-400'}`}>
                    {new URL(source.source_id).hostname}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{source.source_id}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <button 
        onClick={onComplete}
        className="w-full py-3 bg-foreground text-background font-bold rounded-xl mt-6 hover:bg-orange-500 hover:text-white transition-colors"
      >
        Done
      </button>
    </div>
  )
}
