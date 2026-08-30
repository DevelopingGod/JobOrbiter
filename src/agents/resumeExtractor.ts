import { generateCompletion } from '@/lib/ai-client'

export interface ParsedResume {
  contact: {
    email: string | null
    phone: string | null
    linkedin: string | null
    github: string | null
    portfolio: string | null
  }
  skills: string[]
  experience: Array<{
    title: string
    company: string
    startDate: string
    endDate: string | 'Present'
    description: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    graduationYear: string
  }>
}

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

export async function extractResumeData(rawText: string): Promise<ParsedResume | null> {
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
    return null
  }

  try {
    const data = JSON.parse(response) as ParsedResume
    return data
  } catch (error) {
    console.error('Failed to parse AI resume extraction output:', error)
    return null
  }
}
