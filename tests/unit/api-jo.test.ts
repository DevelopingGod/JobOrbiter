/**
 * @jest-environment node
 */
const mockCreate = jest.fn()
const mockGetUser = jest.fn()

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: (...args: any[]) => mockCreate(...args) } },
  }))
})

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}))

import { POST } from '@/app/api/agent/jo/route'

function makeRequest(messages: any[]) {
  return new Request('http://localhost/api/agent/jo', { method: 'POST', body: JSON.stringify({ messages }) })
}

describe('POST /api/agent/jo', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockGetUser.mockReset().mockResolvedValue({ data: { user: null } })
  })

  it('returns the reply and isComplete=false when configuration is still in progress', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'What salary range are you looking for?' } }] })

    const res = await POST(makeRequest([{ role: 'user', content: 'Hi' }]))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.reply).toBe('What salary range are you looking for?')
    expect(body.isComplete).toBe(false)
  })

  it('strips the CONFIGURATION_COMPLETE sentinel and sets isComplete=true', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Great, all set! CONFIGURATION_COMPLETE' } }],
    })

    const res = await POST(makeRequest([{ role: 'user', content: 'That is all' }]))
    const body = await res.json()

    expect(body.isComplete).toBe(true)
    expect(body.reply).not.toContain('CONFIGURATION_COMPLETE')
  })

  it('returns 500 when the Groq call throws', async () => {
    mockCreate.mockRejectedValue(new Error('groq is down'))

    const res = await POST(makeRequest([{ role: 'user', content: 'Hi' }]))

    expect(res.status).toBe(500)
  })
})
