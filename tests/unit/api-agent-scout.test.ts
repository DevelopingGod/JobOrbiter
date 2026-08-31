/**
 * @jest-environment node
 */
const mockGetUser = jest.fn()
const mockGroqCreate = jest.fn()
const mockFetchHackerNewsJobs = jest.fn()
const mockUniversalExtractJobs = jest.fn()
const mockMatchesInsert = jest.fn()

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: (...args: any[]) => mockGroqCreate(...args) } },
  }))
})

jest.mock('@/agents/hackernews', () => ({
  fetchHackerNewsJobs: (...args: any[]) => mockFetchHackerNewsJobs(...args),
}))

jest.mock('@/agents/universalScraper', () => ({
  universalExtractJobs: (...args: any[]) => mockUniversalExtractJobs(...args),
}))

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'preferences') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }
      }
      if (table === 'resumes') {
        return {
          select: () => ({
            eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
          }),
        }
      }
      if (table === 'job_sources') {
        return {
          select: () => ({
            eq: async () => ({ data: [{ source_id: 'hackernews', is_active: true }] }),
          }),
        }
      }
      if (table === 'job_matches') {
        return { insert: (...args: any[]) => mockMatchesInsert(...args) }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  })),
}))

import { POST } from '@/app/api/agent/scout/route'

function makeRequest(body: any = {}) {
  return new Request('http://localhost/api/agent/scout', { method: 'POST', body: JSON.stringify(body) })
}

async function readSseEvents(res: Response): Promise<Array<{ event: string; data: any }>> {
  const text = await res.text()
  const events: Array<{ event: string; data: any }> = []
  const blocks = text.split('\n\n').filter(Boolean)
  for (const block of blocks) {
    const eventMatch = block.match(/event: (.+)/)
    const dataMatch = block.match(/data: (.+)/)
    if (eventMatch && dataMatch) {
      events.push({ event: eventMatch[1], data: JSON.parse(dataMatch[1]) })
    }
  }
  return events
}

describe('POST /api/agent/scout', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockGroqCreate.mockReset()
    mockFetchHackerNewsJobs.mockReset()
    mockUniversalExtractJobs.mockReset()
    mockMatchesInsert.mockReset().mockReturnValue({ select: async () => ({ data: [{ id: 'm1' }], error: null }) })
  })

  it('emits an error event and closes when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest())
    const events = await readSseEvents(res)

    expect(events.some(e => e.event === 'error' && e.data.message === 'Unauthorized')).toBe(true)
    expect(events.some(e => e.event === 'done')).toBe(false)
  })

  it('emits done with zero counts when no sources return jobs', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFetchHackerNewsJobs.mockResolvedValue({ status: 'ok', jobs: [] })

    const res = await POST(makeRequest())
    const events = await readSseEvents(res)

    const done = events.find(e => e.event === 'done')
    expect(done?.data).toEqual({ processed: 0, matches: 0 })
  })

  it('surfaces a source failure via a status event instead of silently returning nothing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFetchHackerNewsJobs.mockResolvedValue({ status: 'error', jobs: [], error: 'API key expired' })

    const res = await POST(makeRequest())
    const events = await readSseEvents(res)

    expect(events.some(e => e.event === 'status' && String(e.data.message).includes('API key expired'))).toBe(true)
  })

  it('evaluates jobs, batches the insert, and reports match counts on the happy path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFetchHackerNewsJobs.mockResolvedValue({
      status: 'ok',
      jobs: [
        { id: 'hn-1', title: 'Engineer A', company_name: 'Acme', url: 'https://x/1', description: 'd', location: null, salary_info: null },
        { id: 'hn-2', title: 'Engineer B', company_name: 'Acme', url: 'https://x/2', description: 'd', location: null, salary_info: null },
      ],
    })
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ score: 90, reasoning: 'great fit', is_match: true }) } }],
    })

    const res = await POST(makeRequest())
    const events = await readSseEvents(res)

    // One batched insert call, not one per match.
    expect(mockMatchesInsert).toHaveBeenCalledTimes(1)
    expect(mockMatchesInsert.mock.calls[0][0]).toHaveLength(2)

    const done = events.find(e => e.event === 'done')
    expect(done?.data).toEqual({ processed: 2, matches: 1 })
  })

  it('reports partial progress via done before rate_limit, instead of losing counts silently', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFetchHackerNewsJobs.mockResolvedValue({
      status: 'ok',
      jobs: [
        { id: 'hn-1', title: 'Engineer A', company_name: 'Acme', url: 'https://x/1', description: 'd', location: null, salary_info: null },
      ],
    })
    const rateLimitError: any = new Error('rate limited')
    rateLimitError.status = 429
    mockGroqCreate.mockRejectedValue(rateLimitError)

    const res = await POST(makeRequest())
    const events = await readSseEvents(res)

    const doneIndex = events.findIndex(e => e.event === 'done')
    const rateLimitIndex = events.findIndex(e => e.event === 'rate_limit')

    expect(doneIndex).toBeGreaterThan(-1)
    expect(rateLimitIndex).toBeGreaterThan(-1)
    // done must be sent BEFORE the connection is closed by rate_limit.
    expect(doneIndex).toBeLessThan(rateLimitIndex)
    expect(events[doneIndex].data).toEqual({ processed: 1, matches: 0 })
  })
})
