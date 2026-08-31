/**
 * @jest-environment node
 */
const mockGetUser = jest.fn()
const mockRunLinkedinScraper = jest.fn()

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({ auth: { getUser: mockGetUser } })),
}))

jest.mock('@/agents/linkedinScraper', () => ({
  runLinkedinScraper: (...args: any[]) => mockRunLinkedinScraper(...args),
}))

import { POST } from '@/app/api/agent/linkedin/route'

function makeRequest(body: any) {
  return new Request('http://localhost/api/agent/linkedin', { method: 'POST', body: JSON.stringify(body) })
}

describe('POST /api/agent/linkedin', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockRunLinkedinScraper.mockReset()
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest({ keywords: 'engineer' }))

    expect(res.status).toBe(401)
  })

  it('returns 400 when keywords is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const res = await POST(makeRequest({}))

    expect(res.status).toBe(400)
  })

  it('returns the scraped jobs on the happy path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockRunLinkedinScraper.mockResolvedValue({
      status: 'ok',
      jobs: [{ title: 'Engineer', company: 'Acme', link: 'https://linkedin.com/jobs/1' }],
    })

    const res = await POST(makeRequest({ keywords: 'engineer', location: 'Remote' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.jobs).toHaveLength(1)
    expect(mockRunLinkedinScraper).toHaveBeenCalledWith('engineer', 'Remote')
  })

  it('returns 502 when the scraper reports an error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockRunLinkedinScraper.mockResolvedValue({ status: 'error', jobs: [], error: 'could not connect to browser' })

    const res = await POST(makeRequest({ keywords: 'engineer' }))
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toBe('could not connect to browser')
  })
})
