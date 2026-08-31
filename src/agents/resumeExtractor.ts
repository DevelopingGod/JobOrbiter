import { generateCompletion } from '@/lib/ai-client'
import { z } from 'zod'

const ParsedResumeSchema = z.object({
  contact: z.object({
    email: z.string().nullable(),
    phone: z.string().nullable(),
    linkedin: z.string().nullable(),
    github: z.string().nullable(),
    portfolio: z.string().nullable(),
  }),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      graduationYear: z.string(),
    })
  ),
})

export type ParsedResume = z.infer<typeof ParsedResumeSchema>

export type ExtractResumeResult =
  | { status: 'ok'; data: ParsedResume }
  | { status: 'error'; error: string }

const SYSTEM_PROMPT = `You are a highly intelligent Resume Extraction Agent.
Your job is to read raw, unstructured text extracted from a PDF resume and output a strictly structured JSON object.
Do NOT include any markdown formatting, preamble, or conversational text. Output ONLY the JSON object.

The JSON MUST conform exactly to the following schema:
{
  "contact": {
    "email": "string | null",
    "phone": "string | null",
    "linkedin": "string | null",
    "github": "string | null",
    "portfolio": "string | null"
  },
  "skills": ["string", "string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "string",
      "endDate": "string | 'Present'",
      "description": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "graduationYear": "string"
    }
  ]
}

If a field cannot be determined, use null for strings, or empty arrays [] for lists. Extract descriptions as bullet points.`

export async function extractResumeData(rawText: string): Promise<ExtractResumeResult> {
  const response = await generateCompletion(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Extract the resume data from the following text:\n\n${rawText}` },
    ],
    {
      jsonMode: true,
      temperature: 0.1, // Low temperature for factual extraction
    }
  )

  if (!response) {
    return { status: 'error', error: 'AI returned no response' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(response)
  } catch (error) {
    console.error('Failed to parse AI resume extraction output as JSON:', error)
    return { status: 'error', error: 'AI response was not valid JSON' }
  }

  const result = ParsedResumeSchema.safeParse(parsed)
  if (!result.success) {
    console.error('AI resume extraction output failed schema validation:', result.error.message)
    return { status: 'error', error: 'AI response did not match the expected resume schema' }
  }

  return { status: 'ok', data: result.data }
}
