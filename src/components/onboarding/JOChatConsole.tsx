'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Orbit, Mic, MicOff, Send, CheckCircle2, Terminal } from 'lucide-react'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export function JOChatConsole({ onComplete, standalone = false, parsedResumeData }: { onComplete?: () => void, standalone?: boolean, parsedResumeData?: any }) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: standalone 
        ? 'Greetings. I am JO, your autonomous assistant. I monitor your scraping fleet and manage your constraints. How can I assist you today?'
        : 'Greetings. I am JO, your autonomous assistant. I have analyzed your resume DNA. The extraction is displayed on the left. Could you confirm if this is accurate? Also, please tell me your minimum salary expectation, preferred regions, and any niche keywords you want me to hunt for.'
    }
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const recognitionInitialized = useRef(false)

  // Constructed once (not on every render): a fresh SpeechRecognition
  // instance per render would wire fresh event handlers each time while
  // any in-flight instance from a prior render kept its own stale handlers.
  if (!recognitionInitialized.current) {
    recognitionInitialized.current = true
    const SpeechRecognition = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }

  const toggleListen = () => {
    const recognition = recognitionRef.current
    if (!recognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.")
      return
    }
    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      try {
        recognition.start()
        setIsListening(true)
      } catch (e) {
        setIsListening(false)
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsProcessing(true)

    try {
      const res = await fetch('/api/agent/jo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      
      if (data.isComplete && onComplete) {
        setTimeout(onComplete, 3000)
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'SYSTEM ANOMALY DETECTED. PLEASE RETRY.' }])
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col lg:flex-row gap-6 h-[600px] text-left font-mono"
    >
      {/* LEFT: Formatted Resume Data */}
      {!standalone && (
        <div className="flex-1 bg-zinc-950/80 p-6 rounded-none border-l-4 border-l-cyan-500 border-r border-t border-b border-zinc-800 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col clip-path-cyber">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400 uppercase tracking-widest relative z-10">
            <CheckCircle2 className="w-5 h-5" />
            Extracted DNA
          </h3>

          {!parsedResumeData ? (
            <p className="text-sm text-zinc-500 relative z-10">
              No resume data was extracted. This is a bug, not expected behavior here — please re-upload your resume.
            </p>
          ) : (
          <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 relative z-10 flex-1">
            <div>
              <h4 className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-3">Skills_Matrix</h4>
              <div className="flex flex-wrap gap-2">
                {(parsedResumeData?.skills || []).map((skill: string) => (
                  <span key={skill} className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded-none text-xs font-medium uppercase tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-3">Exp_Log</h4>
              <div className="space-y-4">
                {(parsedResumeData?.experience || []).map((exp: any, i: number) => (
                  <div key={i} className="border-l-2 border-cyan-500/50 pl-4 py-1 relative">
                    <div className="absolute w-2 h-2 bg-cyan-500 -left-[5px] top-2 transform rotate-45" />
                    <p className="font-bold text-white tracking-wide">{exp.title}</p>
                    <p className="text-xs text-cyan-200/60 mt-1 uppercase">{exp.company} <span className="mx-2 text-cyan-500">•</span> {exp.years || exp.duration}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-3">Edu_Record</h4>
              <p className="text-white text-sm">
                {parsedResumeData?.education
                  ? (Array.isArray(parsedResumeData.education) ? parsedResumeData.education.map((e: any) => e.degree).join(' // ') : parsedResumeData.education)
                  : '—'}
              </p>
            </div>
          </div>
          )}
        </div>
      )}

      {/* RIGHT: JO Chat Console - Anime/Cyberpunk Style */}
      <div className="flex-[1.2] bg-zinc-950/90 rounded-none border-l-4 border-l-orange-500 border-r border-t border-b border-zinc-800 shadow-[0_0_50px_rgba(249,115,22,0.15)] flex flex-col overflow-hidden relative group">
        
        {/* Animated Scanline */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.05)_50%)] bg-[length:100%_4px] pointer-events-none z-0" />
        
        <div className="p-4 border-b border-orange-500/20 bg-black/50 flex items-center gap-4 relative z-20">
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 blur-md ${isProcessing ? 'bg-orange-500 animate-pulse' : 'bg-orange-500/50'}`} />
            <div className="relative w-12 h-12 bg-black border border-orange-500 flex items-center justify-center transform rotate-45">
              <Orbit className={`w-6 h-6 text-orange-500 -rotate-45 ${isProcessing ? 'animate-spin' : 'animate-spin-slow'}`} />
            </div>
          </div>
          <div>
            <h3 className="font-black text-white tracking-widest text-lg uppercase flex items-center gap-2">
              JO.sys <span className="text-[10px] font-mono text-orange-500 border border-orange-500/50 px-1 py-0.5 bg-orange-500/10">v2.0_BETA</span>
            </h3>
            <p className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-widest mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
              Neural_Link_Active
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 relative ${
                  msg.role === 'user' 
                    ? 'bg-orange-500/10 border-r-2 border-orange-500 text-orange-50 ml-8' 
                    : 'bg-zinc-900/80 border-l-2 border-cyan-500 text-zinc-300 mr-8'
                }`}>
                  {/* Decorative corners */}
                  <div className={`absolute top-0 w-2 h-2 border-t ${msg.role === 'user' ? 'left-0 border-l border-orange-500/50' : 'right-0 border-r border-cyan-500/50'}`} />
                  <div className={`absolute bottom-0 w-2 h-2 border-b ${msg.role === 'user' ? 'left-0 border-l border-orange-500/50' : 'right-0 border-r border-cyan-500/50'}`} />
                  
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-[10px] text-cyan-500/70 uppercase tracking-widest">
                      <Terminal className="w-3 h-3" /> JO_Response
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-zinc-900/80 border-l-2 border-cyan-500 p-4 flex gap-2 items-center">
                  <div className="text-[10px] text-cyan-500 uppercase tracking-widest animate-pulse">Computing_</div>
                  <motion.div className="w-1.5 h-1.5 bg-cyan-500" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-cyan-500" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-cyan-500" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-black/80 relative z-20 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleListen}
              className={`p-3 transition-all border ${
                isListening 
                  ? 'bg-red-500/20 text-red-500 border-red-500 animate-pulse' 
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-orange-500/50 hover:text-orange-500'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice dictation'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="[INPUT_COMMAND]..."
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-orange-500 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
              />
              {/* Typing indicator bar */}
              <div className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${input.length > 0 ? 'w-full' : 'w-0'}`} />
            </div>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="p-3 bg-orange-500 text-black border border-orange-500 hover:bg-orange-400 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
