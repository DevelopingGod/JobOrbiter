'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, CheckCircle2, Orbit, FileText, Briefcase, Code, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { JOChatConsole } from '@/components/onboarding/JOChatConsole'

const steps = ['Upload Resume', 'AI Parsing', 'JO Configuration']

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(-1) // -1 is the "Choice" step
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('resume', file)

      setCurrentStep(1) // Move to AI parsing simulation UI

      const res = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume')
      }

      setParsedData(data.data)
      setCurrentStep(2) // Move to JO Configuration
    } catch (error) {
      console.error(error)
      alert("Failed to upload and parse resume. Please try again.")
      setCurrentStep(0)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Floating Shapes */}
        <motion.div 
          animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-500/10 backdrop-blur-md rounded-2xl border border-orange-500/20 flex items-center justify-center shadow-2xl transform -rotate-12"
        >
          <FileText className="w-12 h-12 text-orange-500/50" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 40, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-rose-500/10 backdrop-blur-md rounded-[3rem] border border-rose-500/20 flex items-center justify-center shadow-2xl transform rotate-12"
        >
          <Briefcase className="w-16 h-16 text-rose-500/50" />
        </motion.div>

        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[100px]"
        />
        
        {/* Abstract Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-20" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        <AnimatePresence mode="wait">
          {/* STEP -1: The Choice */}
          {currentStep === -1 && (
            <motion.div
              key="step-choice"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.05 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="glass p-12 rounded-[2rem] border border-border shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-rose-500" />
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(249,115,22,0.4)] transform rotate-3">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">Identity Established.</h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
                Welcome to Job Orbiter. Would you like to configure your autonomous agents now, or explore the dashboard first?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="group bg-foreground text-background px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-500 hover:text-white transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                >
                  Configure Agent Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="glass text-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-muted transition-all hover:scale-[1.02]"
                >
                  Skip for Now
                </button>
              </div>
            </motion.div>
          )}

          {/* ONBOARDING FLOW */}
          {currentStep >= 0 && (
            <motion.div
              key="step-flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              {/* Progress Bar */}
              <div className="flex justify-between mb-12 relative max-w-xl mx-auto">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center gap-3 bg-background px-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500
                        ${
                          currentStep > index
                            ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)]'
                            : currentStep === index
                            ? 'bg-orange-500/20 text-orange-500 border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                            : 'bg-background border-2 border-border text-muted-foreground'
                        }`}
                    >
                      {currentStep > index ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= index ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Content Area */}
              <div className="glass p-4 md:p-8 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden min-h-[450px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {/* Step 1: Upload */}
                  {currentStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col items-center text-center w-full"
                    >
                      <div className="w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center mb-6 text-orange-500 border border-orange-500/20 shadow-inner">
                        <UploadCloud className="w-10 h-10" />
                      </div>
                      <h2 className="text-3xl font-black text-foreground tracking-tight mb-3">Upload your resume</h2>
                      <p className="text-muted-foreground mb-10 max-w-md mx-auto text-sm leading-relaxed">
                        Provide your latest PDF resume. Our AI agent will extract your skills, experience, and education automatically to build your search profile.
                      </p>
                      
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                      />
                      
                      {!file ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-foreground text-background hover:bg-orange-500 hover:text-white px-8 py-4 rounded-full transition-all font-bold flex items-center gap-3 shadow-lg active:scale-95"
                        >
                          <FileText className="w-5 h-5" />
                          Select PDF File
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                          <div className="w-full bg-background/50 backdrop-blur-md border border-orange-500/30 rounded-2xl p-5 flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                              <span className="text-foreground truncate font-bold text-sm">{file.name}</span>
                            </div>
                            <button onClick={() => setFile(null)} className="text-xs font-bold text-destructive hover:text-red-400 ml-4 transition-colors">REMOVE</button>
                          </div>
                          <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full transition-all font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] disabled:opacity-50 flex justify-center items-center gap-2 active:scale-95"
                          >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Extraction'}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: AI Parsing */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-full border-4 border-orange-500/20 animate-ping absolute inset-0" />
                        <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                          <Orbit className="w-12 h-12 text-orange-500 animate-spin-slow" />
                        </div>
                      </div>
                      <h2 className="text-3xl font-black text-foreground tracking-tight mb-3">Agent Active</h2>
                      <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                        Our intelligence engine is currently extracting and structuring your resume data using LLM inference...
                      </p>
                      
                      <div className="mt-8 w-48 h-2 bg-background rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-orange-500 w-1/2 animate-[pulse_1s_ease-in-out_infinite]" style={{ transformOrigin: 'left', animation: 'progress 2s infinite linear' }} />
                      </div>
                      <style>
                        {`
                        @keyframes progress {
                          0% { width: 0%; transform: translateX(0); }
                          50% { width: 50%; transform: translateX(50%); }
                          100% { width: 100%; transform: translateX(100%); }
                        }
                        `}
                      </style>
                    </motion.div>
                  )}

                  {/* Step 3: JO Chat Console */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="w-full text-center"
                    >
                      <div className="mb-8 text-center">
                        <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">System Configuration</h2>
                        <p className="text-muted-foreground text-sm">JO is ready to initialize your agent fleet.</p>
                      </div>
                      <JOChatConsole onComplete={() => router.push('/dashboard')} parsedResumeData={parsedData} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
