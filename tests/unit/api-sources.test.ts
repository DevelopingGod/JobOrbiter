/**
 * @jest-environment node
 */
const mockGetUser = jest.fn()
const mockSelect = jest.fn()
const mockUpsert = jest.fn()
const mockLike = jest.fn()

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: mockSelect,
      upsert: mockUpsert,
    }),
  })),
}))

import { GET, POST } from '@/app/api/sources/route'

describe('GET /api/sources', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockSelect.mockReset()
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await GET()

    expect(res.status).toBe(401)
  })

  it('returns the user sources on the happy path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSelect.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: [{ source_id: 'remotive', is_active: true }], error: null }),
    })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.sources).toEqual([{ source_id: 'remotive', is_active: true }])
  })

  it('returns 500 on a database error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSelect.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'db down' } }),
    })

    const res = await GET()

    expect(res.status).toBe(500)
  })
})

describe('POST /api/sources', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockUpsert.mockReset()
  })

  function makeRequest(body: any) {
    return new Request('http://localhost/api/sources', { method: 'POST', body: JSON.stringify(body) })
  }

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest({ source_id: 'remotive', is_active: true }))

    expect(res.status).toBe(401)
  })

  it('returns 400 when source_id is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const res = await POST(makeRequest({ is_active: true }))

    expect(res.status).toBe(400)
  })

  it('upserts the source on the happy path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockUpsert.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [{ source_id: 'remotive', is_active: false }], error: null }),
    })

    const res = await POST(makeRequest({ source_id: 'remotive', is_active: false }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', source_id: 'remotive', is_active: false }),
      expect.objectContaining({ onConflict: 'user_id, source_id' })
    )
  })

  // Regression coverage for the /cso security audit (2026-08-31): unbounded
  // custom sources meant unbounded Jina + LLM calls per scout run.
  describe('custom source cap', () => {
    beforeEach(() => {
      mockSelect.mockReset().mockReturnValue({ eq: () => ({ like: mockLike }) })
      mockLike.mockReset()
    })

    it('rejects a new custom source once the user is at the cap', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      const atCap = Array.from({ length: 15 }, (_, i) => ({ source_id: `https://example.com/${i}` }))
      mockLike.mockResolvedValue({ data: atCap, error: null })

      const res = await POST(makeRequest({ source_id: 'https://example.com/new', is_active: true }))

      expect(res.status).toBe(400)
      expect(mockUpsert).not.toHaveBeenCalled()
    })

    it('allows re-toggling an existing custom source even at the cap', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      const existing = 'https://example.com/0'
      const atCap = Array.from({ length: 15 }, (_, i) => ({ source_id: i === 0 ? existing : `https://example.com/${i}` }))
      mockLike.mockResolvedValue({ data: atCap, error: null })
      mockUpsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ source_id: existing, is_active: false }], error: null }) })

      const res = await POST(makeRequest({ source_id: existing, is_active: false }))

      expect(res.status).toBe(200)
    })

    it('allows a new custom source when under the cap', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockLike.mockResolvedValue({ data: [{ source_id: 'https://example.com/0' }], error: null })
      mockUpsert.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ source_id: 'https://example.com/new', is_active: true }], error: null }) })

      const res = await POST(makeRequest({ source_id: 'https://example.com/new', is_active: true }))

      expect(res.status).toBe(200)
    })
  })
})
