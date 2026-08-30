'use client'

import { useState, useRef, useEffect } from 'react'
import { RefreshCw, Loader2, Sparkles, Key } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Confetti from 'react-confetti'
import { motion, AnimatePresence } from 'framer-motion'

const AI_PHRASES = [
  "Ruminating...",
  "Synthesizing constraints...",
  "Flibbertigibbeting...",
  "Extracting telemetry...",
  "Pondering existence...",
  "Analyzing DOM nodes...",
  "Aligning tensors...",
]

export function ScoutButton() {
  const [status, setStatus] = useState<'idle' | 'scouting' | 'ready' | 'rate_limit'>('idle')
  const [statusMessage, setStatusMessage] = useState('Agents Scouting...')
  const [showConfetti, setShowConfetti] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [phraseIndex, setPhraseIndex] = useState(0)
  const router = useRouter()
  
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const savedKey = localStorage.getItem('groq_api_key')
    if (savedKey) setCustomKey(savedKey)
  }, [])

  useEffect(() => {
    if (status === 'scouting') {
      const interval = setInterval(() => {
        setPhraseIndex(prev => (prev + 1) % AI_PHRASES.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [status])

  const handleScout = async (apiKey?: string) => {
    setStatus('scouting')
    setStatusMessage('Booting Agents...')
    setShowConfetti(false)

    try {
      const activeKey = apiKey || customKey
      if (activeKey) {
        localStorage.setItem('groq_api_key', activeKey)
        setCustomKey(activeKey)
      }

      const response = await fetch('/api/agent/scout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(activeKey ? { 'x-groq-api-key': activeKey } : {})
        },
        body: JSON.stringify({ customApiKey: activeKey })
      })

      if (!response.body) throw new Error('No readable stream')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      let done = false
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n\n')
          
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              const eventType = line.split('\n')[0].replace('event: ', '')
              const dataStr = line.split('\n')[1]?.replace('data: ', '')
              
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr)
                  
                  if (eventType === 'status') {
                    setStatusMessage(data.message)
                  } else if (eventType === 'rate_limit') {
                    setStatus('rate_limit')
                    return // Stop reading
                  } else if (eventType === 'done') {
                    setStatus('ready')
                  } else if (eventType === 'error') {
                    setStatus('idle')
                    alert(`Error: ${data.message}`)
                    return
                  }
                } catch (e) {
                  console.error('Error parsing SSE data', e)
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
      setStatus('idle')
      alert('Agent encountered an error.')
    }
  }

  const handleReveal = () => {
    setShowConfetti(true)
    setStatus('idle')
    
    // Navigate back to the dashboard to see the feed
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
    
    // Stop confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
  }

  return (
    <>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }} />}
      
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.button 
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => handleScout()}
            className="w-full h-full min-h-[140px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-muted-foreground hover:bg-orange-500/5 hover:border-orange-500/50 hover:text-orange-500 transition-all cursor-pointer group"
          >
            <RefreshCw className="w-8 h-8 group-hover:animate-spin" />
            <span className="font-bold">Force Manual Sync</span>
          </motion.button>
        )}

        {status === 'scouting' && (
          <motion.div 
            key="scouting"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full min-h-[140px] rounded-2xl border-2 border-orange-500/50 bg-orange-500/5 flex flex-col items-center justify-center gap-3 p-4 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-1" />
            <AnimatePresence mode="wait">
              <motion.p
                key={AI_PHRASES[phraseIndex]}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-orange-500 text-xs italic opacity-80 h-4"
              >
                {AI_PHRASES[phraseIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="font-bold text-orange-500 text-sm">{statusMessage}</p>
          </motion.div>
        )}

        {status === 'ready' && (
          <motion.button 
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            onClick={handleReveal}
            className="w-full h-full min-h-[140px] rounded-2xl border-2 border-green-500 bg-green-500/10 flex flex-col items-center justify-center gap-4 text-green-500 hover:bg-green-500 hover:text-white transition-all cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]"
          >
            <Sparkles className="w-8 h-8 animate-bounce" />
            <span className="font-black text-lg tracking-widest uppercase">Reveal Results</span>
          </motion.button>
        )}

        {status === 'rate_limit' && (
          <motion.div 
            key="rate_limit"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full min-h-[140px] rounded-2xl border-2 border-red-500/50 bg-red-500/10 flex flex-col items-center justify-center gap-3 p-4 text-center"
          >
            <Key className="w-6 h-6 text-red-500" />
            <p className="text-xs font-bold text-red-500">AI Limit Exhausted.</p>
            <input 
              type="password" 
              placeholder="Enter Groq API Key"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
            <button 
              onClick={() => handleScout(customKey)}
              disabled={!customKey}
              className="w-full bg-red-500 text-white rounded-md py-1.5 text-xs font-bold disabled:opacity-50"
            >
              Resume Mission
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
