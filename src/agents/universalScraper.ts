import Groq from 'groq-sdk'
import { HackerNewsJob as ExtractedJob } from './hackernews' 

export async function universalExtractJobs(url: string, customApiKey?: string): Promise<ExtractedJob[]> {
  const groq = new Groq({
    apiKey: customApiKey || process.env.GROQ_API_KEY,
  })

  try {
    // 1. Fetch from Jina AI Reader API for clean, serverless Markdown extraction
    const jinaUrl = `https://r.jina.ai/${url}`
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/event-stream, text/plain', // Jina returns plain text markdown by default
        'X-Retain-Images': 'none'
      }
    })

    if (!response.ok) {
      throw new Error(`Jina AI Reader failed with status ${response.status}`)
    }

    const rawMarkdown = await response.text()

    // 2. Truncate text to avoid token limits but keep it large enough for big job boards (~60k chars)
    const truncatedText = rawMarkdown.substring(0, 60000)

    // 3. Use LLM to extract jobs
    const prompt = `
      You are an elite web-scraping AI.
      I have provided the raw Markdown content extracted from a job board URL: ${url}
      
      Your task is to extract ALL individual job postings found in this text.
      Output ONLY a valid, minified JSON object with a single key "jobs" containing an array of objects.
      Do not include markdown or explanations.
      CRITICAL: If you cannot find any REAL, SPECIFIC job postings in the text (e.g. if this is just a landing page or generic SEO text), you MUST output {"jobs": []}. DO NOT hallucinate or guess jobs.
      
      Schema for the object:
      {
        "jobs": [
          {
            "id": "A unique slug based on title/company",
            "title": "Job Title",
            "company_name": "Company Name (infer if not explicit, e.g. from the URL)",
            "url": "The link to the job posting. If relative, resolve it using ${new URL(url).origin}. If none found, use the source URL.",
            "description": "A 1-3 sentence summary of the role",
            "location": "Location (e.g. Remote, Singapore, London, etc). Null if not found.",
            "salary_info": "Salary range if explicitly mentioned, otherwise null."
          }
        ]
      }
      
      Raw Markdown Payload:
      ${truncatedText}
    `

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You output strictly valid JSON arrays. No markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 8000,
      response_format: { type: 'json_object' }
    })

    const resultText = completion.choices[0]?.message?.content
    if (!resultText) return []

    const parsed = JSON.parse(resultText)
    return parsed.jobs || []

  } catch (error) {
    console.error(`Jina Universal Scraper Error for ${url}:`, error)
    return []
  }
}
