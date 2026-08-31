export interface HackerNewsJob {
  id: string
  title: string
  company_name: string
  url: string
  description: string
  location: string | null
  salary_info: string | null
}

export type FetchJobsResult =
  | { status: 'ok'; jobs: HackerNewsJob[] }
  | { status: 'error'; jobs: []; error: string }

// The "who is hiring" thread only changes monthly and is identical for every
// user, so cache it in-process instead of re-fetching + re-parsing on every
// scout run across every user.
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
let cache: { jobs: HackerNewsJob[]; fetchedAt: number } | null = null

/**
 * Fetches the most recent "Ask HN: Who is hiring?" thread and extracts jobs from the comments.
 */
export async function fetchHackerNewsJobs(): Promise<FetchJobsResult> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return { status: 'ok', jobs: cache.jobs }
  }

  try {
    // 1. Find the latest "Who is hiring?" thread
    const searchRes = await fetch(
      'https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&query=Who is hiring'
    )
    
    if (!searchRes.ok) {
      throw new Error(`Failed to fetch HN thread: ${searchRes.statusText}`)
    }

    const searchData = await searchRes.json()
    if (!searchData.hits || searchData.hits.length === 0) {
      cache = { jobs: [], fetchedAt: Date.now() }
      return { status: 'ok', jobs: [] }
    }

    const latestThreadId = searchData.hits[0].objectID

    // 2. Fetch the comments (job postings) for that thread
    const threadRes = await fetch(`https://hn.algolia.com/api/v1/items/${latestThreadId}`)
    if (!threadRes.ok) {
      throw new Error(`Failed to fetch HN comments: ${threadRes.statusText}`)
    }

    const threadData = await threadRes.json()
    const comments = threadData.children || []

    // 3. Process comments into Job Objects
    // For MVP, we use basic regex/heuristic extraction from the first line which is usually:
    // Company | Role | Location | Remote/ONSITE | Visa
    const jobs: HackerNewsJob[] = []

    for (const comment of comments) {
      if (!comment.text) continue

      // Clean HTML from text
      const cleanText = comment.text.replace(/<[^>]*>?/gm, ' ').trim()
      
      // Grab first line (or first few sentences) as title/company info
      const firstLine = cleanText.split('\n')[0] || ''
      const parts = firstLine.split('|').map((p: string) => p.trim())
      
      const companyName = parts[0] || 'Unknown Company (HN)'
      const title = parts[1] || 'Software Engineer'
      const location = parts[2] || null
      
      // Attempt to extract a URL
      const urlMatch = comment.text.match(/href="([^"]*)"/)
      const url = urlMatch ? urlMatch[1] : `https://news.ycombinator.com/item?id=${comment.id}`

      jobs.push({
        id: `hn-${comment.id}`,
        title,
        company_name: companyName,
        url,
        description: cleanText.substring(0, 800) + (cleanText.length > 800 ? '...' : ''), // Limit length for LLM
        location,
        salary_info: null, // HN rarely structures this, rely on LLM to extract from desc later if needed
      })

      // Limit to 20 jobs for compute/time limits during prototype
      if (jobs.length >= 20) break
    }

    cache = { jobs, fetchedAt: Date.now() }
    return { status: 'ok', jobs }

  } catch (error) {
    console.error('HackerNews Agent Error:', error)
    return { status: 'error', jobs: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
