/**
 * @jest-environment node
 */
const mockGetUser = jest.fn()
const mockUpload = jest.fn()
const mockDbInsert = jest.fn()
const mockExtractResumeData = jest.fn()

let pdfParserBehavior: 'ready' | 'error' | 'empty' = 'ready'

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
    storage: { from: () => ({ upload: mockUpload }) },
    from: () => ({ insert: mockDbInsert }),
  })),
}))

jest.mock('@/agents/resumeExtractor', () => ({
  extractResumeData: (...args: any[]) => mockExtractResumeData(...args),
}))

jest.mock('pdf2json', () => {
  return jest.fn().mockImplementation(() => {
    const handlers: Record<string, (arg?: any) => void> = {}
    return {
      on: (event: string, cb: (arg?: any) => void) => {
        handlers[event] = cb
      },
      parseBuffer: () => {
        if (pdfParserBehavior === 'error') {
          handlers['pdfParser_dataError']?.({ parserError: 'bad pdf' })
        } else {
          handlers['pdfParser_dataReady']?.()
        }
      },
      getRawTextContent: () => (pdfParserBehavior === 'empty' ? '' : 'John Doe\nSenior Engineer\nSkills: React'),
    }
  })
})

import { POST } from '@/app/api/upload-resume/route'
import type { NextRequest } from 'next/server'

function makeRequest(file: File | null): NextRequest {
  const form = new FormData()
  if (file) form.append('resume', file)
  // The route only calls req.formData() — a plain Request satisfies that at
  // runtime; cast to NextRequest since that's what POST is typed to accept.
  return new Request('http://localhost/api/upload-resume', { method: 'POST', body: form }) as unknown as NextRequest
}

describe('POST /api/upload-resume', () => {
  beforeEach(() => {
    pdfParserBehavior = 'ready'
    mockGetUser.mockReset()
    mockUpload.mockReset().mockResolvedValue({ error: null })
    mockDbInsert.mockReset().mockResolvedValue({ error: null })
    mockExtractResumeData.mockReset()
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest(new File(['%PDF'], 'resume.pdf', { type: 'application/pdf' })))

    expect(res.status).toBe(401)
  })

  it('returns 400 when no file is provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const res = await POST(makeRequest(null))

    expect(res.status).toBe(400)
  })

  it('returns 400 when the file is not a PDF', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const res = await POST(makeRequest(new File(['plain text'], 'resume.txt', { type: 'text/plain' })))

    expect(res.status).toBe(400)
  })

  it('parses, uploads, and saves the resume on the happy path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockExtractResumeData.mockResolvedValue({
      status: 'ok',
      data: { contact: {}, skills: ['React'], experience: [], education: [] },
    })

    const res = await POST(makeRequest(new File(['%PDF'], 'resume.pdf', { type: 'application/pdf' })))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockUpload).toHaveBeenCalled()
    expect(mockDbInsert).toHaveBeenCalledWith([
      expect.objectContaining({ user_id: 'u1', parsed_json: expect.objectContaining({ skills: ['React'] }) }),
    ])
  })

  it('returns 500 when the PDF parser reports an error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    pdfParserBehavior = 'error'

    const res = await POST(makeRequest(new File(['%PDF'], 'resume.pdf', { type: 'application/pdf' })))

    expect(res.status).toBe(500)
  })

  it('returns 400 when the PDF parses successfully but yields no text', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    pdfParserBehavior = 'empty'

    const res = await POST(makeRequest(new File(['%PDF'], 'resume.pdf', { type: 'application/pdf' })))

    expect(res.status).toBe(400)
  })

  it('returns 500 with the extraction error message when AI parsing fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockExtractResumeData.mockResolvedValue({ status: 'error', error: 'AI response was not valid JSON' })

    const res = await POST(makeRequest(new File(['%PDF'], 'resume.pdf', { type: 'application/pdf' })))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('AI response was not valid JSON')
  })
})
