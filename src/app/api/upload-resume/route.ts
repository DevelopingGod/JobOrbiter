import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { extractResumeData } from '@/agents/resumeExtractor'
import PDFParser from 'pdf2json'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse form data
    const formData = await req.formData()
    const file = formData.get('resume') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Must be a PDF file' }, { status: 400 })
    }

    // 3. Extract text from PDF using pdf2json
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const rawText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1)
      pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError || errData))
      pdfParser.on('pdfParser_dataReady', () => {
        resolve(pdfParser.getRawTextContent())
      })
      pdfParser.parseBuffer(buffer)
    })

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 })
    }

    // 4. Upload original file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
    }

    // 5. Use AI to extract structured JSON
    const extraction = await extractResumeData(rawText)

    if (extraction.status === 'error') {
      return NextResponse.json({ error: extraction.error }, { status: 500 })
    }
    const structuredData = extraction.data

    // 6. Save to database
    const { error: dbError } = await supabase.from('resumes').insert([
      {
        user_id: user.id,
        storage_path: fileName,
        parsed_json: structuredData,
      },
    ])

    if (dbError) {
      console.error('DB insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save resume data' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: structuredData })
  } catch (error: any) {
    console.error('Upload route error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
