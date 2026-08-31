import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Groq from 'groq-sdk'
import { fetchHackerNewsJobs } from '@/agents/hackernews'
import { universalExtractJobs } from '@/agents/universalScraper'

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

const EVAL_BATCH_SIZE = 5

export async function POST(req: Request) {
  // We need to support reading a custom API key from the request if the user provided one due to 429
  const body = await req.json().catch(() => ({}))
  const customGroqKey = body.customApiKey

  const apiKey = customGroqKey || process.env.GROQ_API_KEY
  const groq = new Groq({ apiKey })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const supabase = await createClient()
        sendEvent('status', { message: 'Initializing mission control...' })

        // 1. Verify User Session
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          sendEvent('error', { message: 'Unauthorized' })
          controller.close()
          return
        }

        sendEvent('status', { message: 'Retrieving your constraints and resume DNA...' })

        // 2. Fetch User Preferences and Resume
        const { data: preferences } = await supabase.from('preferences').select('*').eq('id', user.id).maybeSingle()
        const { data: resume } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()

        // 3. Determine Active Sources
        const { data: sources } = await supabase.from('job_sources').select('*').eq('user_id', user.id)
        const activeSources = sources && sources.length > 0
          ? sources.filter(s => s.is_active).map(s => s.source_id)
          : ['remotive']

        // 4. Multi-Agent Fetching
        const fetchPromises = []
        let allJobs: Array<any> = []

        if (activeSources.includes('remotive')) {
          sendEvent('status', { message: 'Deploying Remotive Scout Agent...' })
          fetchPromises.push(
            fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=10')
              .then(res => res.json())
              .then(data => (data.jobs || []).map((j: any) => ({
                id: `rm-${j.id}`, title: j.title, company_name: j.company_name, url: j.url, description: j.description, location: j.candidate_required_location, salary_info: j.salary, source: 'remotive'
              })))
              .catch(() => {
                sendEvent('status', { message: 'Remotive source failed, continuing with other sources.' })
                return []
              })
          )
        }

        if (activeSources.includes('hackernews')) {
          sendEvent('status', { message: 'Deploying HackerNews Scout Agent...' })
          fetchPromises.push(
            fetchHackerNewsJobs()
              .then(result => {
                if (result.status === 'error') {
                  sendEvent('status', { message: `HackerNews source failed: ${result.error}` })
                  return []
                }
                return result.jobs.map(j => ({ ...j, source: 'hackernews' }))
              })
              .catch(() => {
                sendEvent('status', { message: 'HackerNews source failed, continuing with other sources.' })
                return []
              })
          )
        }

        const customUrls = activeSources.filter(s => s.startsWith('http'))
        for (const url of customUrls) {
          sendEvent('status', { message: `Deploying Universal Scraper on ${new URL(url).hostname}...` })
          fetchPromises.push(
            universalExtractJobs(url, apiKey)
              .then(result => {
                if (result.status === 'error') {
                  sendEvent('status', { message: `${new URL(url).hostname} source failed: ${result.error}` })
                  return []
                }
                return result.jobs.map(j => ({ ...j, source: new URL(url).hostname }))
              })
              .catch(() => {
                sendEvent('status', { message: `${new URL(url).hostname} source failed, continuing with other sources.` })
                return []
              })
          )
        }

        sendEvent('status', { message: 'Flibbertigibbeting across the web...' })
        const jobResults = await Promise.all(fetchPromises)
        allJobs = jobResults.flat()

        if (allJobs.length === 0) {
          sendEvent('status', { message: 'No jobs found across active sources.' })
          sendEvent('done', { processed: 0, matches: 0 })
          controller.close()
          return
        }

        sendEvent('status', { message: `Ruminating on ${allJobs.length} extracted jobs against your profile...` })

        // 5. Evaluate collected jobs with Groq, in concurrency-limited batches.
        // Matches are collected here and inserted in ONE batched call at the
        // end instead of one insert per match.
        const matchesToInsert: Array<any> = []
        let processedCount = 0
        let rateLimited = false

        const batches = chunk(allJobs, EVAL_BATCH_SIZE)

        for (const batch of batches) {
          if (rateLimited) break

          sendEvent('status', { message: `Evaluating batch ${processedCount + 1} to ${Math.min(processedCount + batch.length, allJobs.length)} of ${allJobs.length}...` })

          const settled = await Promise.allSettled(
            batch.map(async (job) => {
              const prompt = `
                You are an elite, mechanistic AI recruitment agent.
                USER PREFERENCES: ${JSON.stringify(preferences || {})} (Please normalize all salary estimates in the output to the currency specified here, if present)
                USER RESUME DATA (parsed): ${JSON.stringify(resume?.parsed_json || { skills: "React, TypeScript, Node.js", experience: "Software Engineer" })}

                JOB TO EVALUATE:
                Source: ${job.source}
                Title: ${job.title}
                Company: ${job.company_name}
                Location: ${job.location || 'Unknown'}
                Salary: ${job.salary_info || 'Unknown'}
                Description: ${job.description.substring(0, 1500)}

                TASK: Evaluate match. Output ONLY valid minified JSON: {"score": <0-100>, "reasoning": "<1-2 sentences>", "is_match": <bool>}
              `

              const completion = await groq.chat.completions.create({
                messages: [
                  { role: 'system', content: 'You output strictly valid JSON. No markdown.' },
                  { role: 'user', content: prompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1,
                max_tokens: 300,
                response_format: { type: 'json_object' }
              })

              const resultText = completion.choices[0]?.message?.content
              if (!resultText) return null

              const evaluation = JSON.parse(resultText)
              if (evaluation.is_match || evaluation.score > 70) {
                return {
                  user_id: user.id,
                  job_title: job.title,
                  company_name: job.company_name,
                  job_url: job.url,
                  salary_info: job.salary_info || 'Not specified',
                  location: job.location || 'Remote',
                  description: job.description.substring(0, 500) + '...',
                  match_score: evaluation.score,
                  match_reasoning: evaluation.reasoning,
                  source: job.source,
                }
              }
              return null
            })
          )

          for (const outcome of settled) {
            processedCount++
            if (outcome.status === 'fulfilled') {
              if (outcome.value) matchesToInsert.push(outcome.value)
            } else {
              const err: any = outcome.reason
              if (err?.status === 429) {
                rateLimited = true
              } else {
                console.error('Groq parsing error:', err)
              }
            }
          }
        }

        // Single batched insert instead of one insert per match.
        let insertedMatches: Array<any> = []
        if (matchesToInsert.length > 0) {
          const { data, error } = await supabase.from('job_matches').insert(matchesToInsert).select()
          if (error) {
            console.error('Batch job_matches insert error:', error)
          } else {
            insertedMatches = data || []
          }
        }

        if (rateLimited) {
          // Tell the client what WAS accomplished before the rate limit hit,
          // instead of leaving it looking like the whole scan failed.
          sendEvent('done', { processed: processedCount, matches: insertedMatches.length })
          sendEvent('rate_limit', { message: 'AI Limit Exhausted. Provide your own Groq API key to continue.' })
          controller.close()
          return
        }

        sendEvent('status', { message: 'Finalizing intelligence report...' })
        sendEvent('done', { processed: allJobs.length, matches: insertedMatches.length })
        controller.close()

      } catch (error: any) {
        console.error('Scout Agent Router Error:', error)
        sendEvent('error', { message: error.message || 'Internal Server Error' })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
