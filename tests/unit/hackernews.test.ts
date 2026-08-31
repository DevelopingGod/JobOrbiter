// The module keeps an in-process cache (by design, see hackernews.ts) so it
// must be re-imported fresh per test — otherwise test 2's mocked response
// never gets hit because test 1's result is still cached.
let fetchHackerNewsJobs: typeof import('@/agents/hackernews').fetchHackerNewsJobs

describe('hackernews agent', () => {
  beforeEach(() => {
    jest.resetModules()
    global.fetch = jest.fn()
    fetchHackerNewsJobs = require('@/agents/hackernews').fetchHackerNewsJobs
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns parsed jobs from the latest thread on the happy path', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hits: [{ objectID: 'thread-1' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          children: [
            { id: 1, text: 'Acme Inc | Senior Engineer | Remote<p>more text' },
          ],
        }),
      })

    const result = await fetchHackerNewsJobs()

    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.jobs).toHaveLength(1)
    expect(result.jobs[0].company_name).toBe('Acme Inc')
    expect(result.jobs[0].title).toBe('Senior Engineer')
  })

  it('returns an empty ok result when no hiring thread is found', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hits: [] }),
    })

    const result = await fetchHackerNewsJobs()

    expect(result).toEqual({ status: 'ok', jobs: [] })
  })

  it('returns a status:error result when the search request fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Service Unavailable',
    })

    const result = await fetchHackerNewsJobs()

    expect(result.status).toBe('error')
    if (result.status !== 'error') return
    expect(result.jobs).toEqual([])
    expect(result.error).toContain('Failed to fetch HN thread')
  })
})
