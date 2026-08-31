import { universalExtractJobs } from '@/agents/universalScraper'
import { generateCompletion } from '@/lib/ai-client'

jest.mock('@/lib/ai-client', () => ({
  generateCompletion: jest.fn(),
}))

const mockGenerateCompletion = generateCompletion as jest.Mock

describe('universalScraper agent', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    mockGenerateCompletion.mockReset()
  })

  it('extracts and validates jobs on the happy path', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => '# Senior Engineer at Acme\nRemote, $150k',
    })
    mockGenerateCompletion.mockResolvedValue(
      JSON.stringify({
        jobs: [
          {
            id: 'acme-senior-engineer',
            title: 'Senior Engineer',
            company_name: 'Acme',
            url: 'https://example.com/job/1',
            description: 'Build things.',
            location: 'Remote',
            salary_info: '$150k',
          },
        ],
      })
    )

    const result = await universalExtractJobs('https://example.com/jobs')

    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.jobs).toHaveLength(1)
    expect(result.jobs[0].title).toBe('Senior Engineer')
  })

  it('returns status:error when the Jina fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 502 })

    const result = await universalExtractJobs('https://example.com/jobs')

    expect(result.status).toBe('error')
  })

  it('returns status:error when the AI response is not valid JSON', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => 'content' })
    mockGenerateCompletion.mockResolvedValue('not json')

    const result = await universalExtractJobs('https://example.com/jobs')

    expect(result.status).toBe('error')
  })

  it('returns status:error when the AI response fails schema validation', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => 'content' })
    mockGenerateCompletion.mockResolvedValue(JSON.stringify({ jobs: [{ title: 'Missing required fields' }] }))

    const result = await universalExtractJobs('https://example.com/jobs')

    expect(result.status).toBe('error')
  })

  it('passes a custom API key through to generateCompletion', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => 'content' })
    mockGenerateCompletion.mockResolvedValue(JSON.stringify({ jobs: [] }))

    await universalExtractJobs('https://example.com/jobs', 'user-supplied-key')

    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ apiKey: 'user-supplied-key' })
    )
  })
})
