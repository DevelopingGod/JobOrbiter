/**
 * @jest-environment node
 */
const mockGetUser = jest.fn()
const mockInsert = jest.fn()
const mockDelete = jest.fn()
const mockEq = jest.fn()

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'feedback') {
        return { insert: mockInsert }
      }
      if (table === 'job_matches') {
        return { delete: () => ({ eq: mockEq }) }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  })),
}))

import { POST } from '@/app/api/feedback/route'

function makeRequest(body: any) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/feedback', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockInsert.mockReset().mockResolvedValue({ error: null })
    mockDelete.mockReset()
    mockEq.mockReset().mockResolvedValue({ error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(makeRequest({ jobId: '1', action: 'upvote' }))

    expect(res.status).toBe(401)
  })

  it('returns 400 when jobId or action is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const res = await POST(makeRequest({ action: 'upvote' }))

    expect(res.status).toBe(400)
  })

  it('records an upvote with score 1 and does not delete the match', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const res = await POST(makeRequest({ jobId: 'job-1', action: 'upvote', jobData: { title: 'Engineer' } }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', feedback_score: 1, action_type: 'job_match_rating' })
    )
    expect(mockEq).not.toHaveBeenCalled()
  })

  it('records a downvote with score -1 and deletes the job match', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const res = await POST(makeRequest({ jobId: 'job-1', action: 'downvote' }))

    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ feedback_score: -1 }))
    expect(mockEq).toHaveBeenCalledWith('id', 'job-1')
  })

  it('returns 500 when the feedback insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockInsert.mockResolvedValue({ error: { message: 'db down' } })

    const res = await POST(makeRequest({ jobId: 'job-1', action: 'upvote' }))

    expect(res.status).toBe(500)
  })
})
