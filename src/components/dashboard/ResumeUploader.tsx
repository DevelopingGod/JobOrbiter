'use client'

import { useState, useRef } from 'react'
import { UploadCloud, FileText, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ResumeUploader({ hasResume }: { hasResume: boolean }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload')
      }

      setFile(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  if (!hasResume && !file) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-background/50 rounded-2xl border border-dashed border-orange-500/50 mt-4">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-orange-500 border border-orange-500/20">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">No Resume Found</h3>
        <p className="text-sm text-muted-foreground mb-6">Upload your PDF resume to extract your DNA.</p>
        
        <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
        
        <button onClick={() => fileInputRef.current?.click()} className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg active:scale-95">
          Select PDF
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
      
      {!file ? (
        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-background border border-border text-foreground px-6 py-3 rounded-xl text-sm font-bold hover:bg-muted transition-colors active:scale-95 flex justify-center items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          Upload New Resume
        </button>
      ) : (
        <div className="flex flex-col gap-4 bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span className="text-foreground truncate font-bold text-sm">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors" disabled={isUploading}>
              Cancel
            </button>
          </div>
          
          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
          
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</> : 'Confirm Upload & Parse'}
          </button>
        </div>
      )}
    </div>
  )
}
