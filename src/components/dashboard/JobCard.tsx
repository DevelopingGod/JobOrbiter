'use client'

import { useState } from 'react'
import { Orbit, ExternalLink, ThumbsUp, ThumbsDown, Loader2, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteJobMatch } from '@/app/dashboard/actions'

export function JobCard({ match }: { match: any }) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'loading' | 'upvoted' | 'downvoted'>('idle')
  const [isVisible, setIsVisible] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteJobMatch(match.id)
      setIsVisible(false)
    } catch (err) {
      console.error('Failed to delete:', err)
      setIsDeleting(false)
    }
  }

  const handleFeedback = async (action: 'upvote' | 'downvote') => {
    if (feedbackState !== 'idle') return
    setFeedbackState('loading')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: match.id,
          action,
          jobData: match
        })
      })

      if (res.ok) {
        setFeedbackState(action === 'upvote' ? 'upvoted' : 'downvoted')
        
        // If downvoted, animate out
        if (action === 'downvote') {
          setTimeout(() => setIsVisible(false), 500)
        }
      } else {
        setFeedbackState('idle')
        alert('Failed to save feedback.')
      }
    } catch (err) {
      console.error(err)
      setFeedbackState('idle')
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0, overflow: 'hidden', marginTop: 0, marginBottom: 0, padding: 0, border: 0 }}
        transition={{ duration: 0.4 }}
        className={`glass p-8 rounded-[2rem] border shadow-lg flex flex-col md:flex-row gap-8 relative overflow-hidden group transition-all duration-300
          ${feedbackState === 'upvoted' ? 'border-green-500/50 bg-green-500/5' : ''}
          ${feedbackState === 'downvoted' ? 'border-red-500/50 bg-red-500/5 opacity-50' : 'border-border hover:border-orange-500/30'}
        `}
      >
        <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b transition-colors
          ${feedbackState === 'upvoted' ? 'from-green-400 to-green-600' : 
            feedbackState === 'downvoted' ? 'from-red-400 to-red-600' : 'from-orange-400 to-orange-600'}
        `} />

        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10"
          title="Dismiss Match"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </button>
        
        <div className="flex-1 space-y-4 pr-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{match.job_title}</h3>
              <p className="text-lg text-muted-foreground">{match.company_name} • {match.location}</p>
            </div>
            <a href={match.job_url} target="_blank" rel="noopener noreferrer" className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2 shrink-0">
              View Role <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="p-4 bg-background/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Orbit className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-foreground">Agent Analysis (Score: {match.match_score}/100)</span>
              
              {/* Tooltip for Match Reasoning */}
              <div className="relative group flex items-center">
                <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-orange-500 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-foreground text-background text-xs rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  {match.match_reasoning}
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30">
                {match.match_score}% Match
              </span>
              {match.source && (
                <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium border border-border">
                  via {match.source === 'hackernews' ? 'HackerNews' : 'Remotive'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="md:w-48 flex flex-row md:flex-col items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 pl-0 md:pl-8">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">RLHF Feedback</span>
          <div className="flex gap-4">
            <button 
              onClick={() => handleFeedback('upvote')}
              disabled={feedbackState !== 'idle'}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border
                ${feedbackState === 'upvoted' ? 'bg-green-500 text-white border-green-500' : 
                  'bg-background border-border hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500 disabled:opacity-50'}
              `}
            >
              {feedbackState === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsUp className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => handleFeedback('downvote')}
              disabled={feedbackState !== 'idle'}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border
                ${feedbackState === 'downvoted' ? 'bg-red-500 text-white border-red-500' : 
                  'bg-background border-border hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 disabled:opacity-50'}
              `}
            >
              {feedbackState === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
