/**
 * @jest-environment node
 */
const mockGetUser = jest.fn()
const mockInsert = jest.fn()
const mockDelete = jest.fn()
// job_matches delete is chained: .delete().eq('id', jobId).eq('user_id', user.id)
// — both calls must be tracked so a test can assert the deletion is actually
// scoped to the requesting user (regression coverage for the IDOR fixed in
// the /cso security audit, 2026-08-31: this route used to delete by id alone).
const mockEqId = jest.fn()
const mockEqUserId = jest.fn()

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'feedback') {
        return { insert: mockInsert }
      }
      if (table === 'job_matches') {
        return { delete: () => ({ eq: mockEqId }) }
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
    mockEqUserId.mockReset().mockResolvedValue({ error: null })
    mockEqId.mockReset().mockReturnValue({ eq: mockEqUserId })
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
    expect(mockEqId).not.toHaveBeenCalled()
  })

  it('records a downvote with score -1 and deletes ONLY the requesting user\'s match (IDOR regression check)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const res = await POST(makeRequest({ jobId: 'job-1', action: 'downvote' }))

    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ feedback_score: -1 }))
    expect(mockEqId).toHaveBeenCalledWith('id', 'job-1')
    // This is the assertion that matters: the delete must ALSO be scoped to
    // the authenticated user, not just the job id. Deleting by id alone lets
    // any authenticated user delete another user's match.
    expect(mockEqUserId).toHaveBeenCalledWith('user_id', 'u1')
  })

  it('returns 500 when the feedback insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockInsert.mockResolvedValue({ error: { message: 'db down' } })

    const res = await POST(makeRequest({ jobId: 'job-1', action: 'upvote' }))

    expect(res.status).toBe(500)
  })
})
