export interface HackerNewsJob {
  id: string
  title: string
  company_name: string
  url: string
  description: string
  location: string | null
  salary_info: string | null
}

/**
 * Fetches the most recent "Ask HN: Who is hiring?" thread and extracts jobs from the comments.
 */
export async function fetchHackerNewsJobs(): Promise<HackerNewsJob[]> {
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
      return []
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

    return jobs

  } catch (error) {
    console.error('HackerNews Agent Error:', error)
    return []
  }
}
