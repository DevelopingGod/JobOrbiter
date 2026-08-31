const mockPage = {
  goto: jest.fn().mockResolvedValue(undefined),
  waitForSelector: jest.fn().mockResolvedValue(undefined),
  $$eval: jest.fn().mockResolvedValue([
    { title: 'Frontend Engineer', company: 'Acme', link: 'https://linkedin.com/jobs/1' },
  ]),
}
const mockContext = { newPage: jest.fn().mockResolvedValue(mockPage) }
const mockBrowser = {
  newContext: jest.fn().mockResolvedValue(mockContext),
  close: jest.fn().mockResolvedValue(undefined),
}

const mockLaunch = jest.fn().mockResolvedValue(mockBrowser)
const mockConnect = jest.fn().mockResolvedValue(mockBrowser)

jest.mock('playwright', () => ({
  chromium: {
    launch: (...args: any[]) => mockLaunch(...args),
    connect: (...args: any[]) => mockConnect(...args),
  },
}))

import { runLinkedinScraper } from '@/agents/linkedinScraper'

describe('linkedinScraper agent', () => {
  const originalEndpoint = process.env.BROWSERLESS_WS_ENDPOINT

  afterEach(() => {
    jest.clearAllMocks()
    if (originalEndpoint === undefined) {
      delete process.env.BROWSERLESS_WS_ENDPOINT
    } else {
      process.env.BROWSERLESS_WS_ENDPOINT = originalEndpoint
    }
  })

  it('launches a local browser when no remote endpoint is configured', async () => {
    delete process.env.BROWSERLESS_WS_ENDPOINT

    const result = await runLinkedinScraper('engineer', 'Remote')

    expect(mockLaunch).toHaveBeenCalled()
    expect(mockConnect).not.toHaveBeenCalled()
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.jobs).toHaveLength(1)
    expect(result.jobs[0].company).toBe('Acme')
  })

  it('connects to the remote browser when BROWSERLESS_WS_ENDPOINT is set', async () => {
    process.env.BROWSERLESS_WS_ENDPOINT = 'wss://example.com/browser'

    const result = await runLinkedinScraper('engineer', 'Remote')

    expect(mockConnect).toHaveBeenCalledWith('wss://example.com/browser')
    expect(mockLaunch).not.toHaveBeenCalled()
    expect(result.status).toBe('ok')
  })

  it('never fills in a login form or navigates to the login page', async () => {
    await runLinkedinScraper('engineer', 'Remote')

    const gotoUrls = mockPage.goto.mock.calls.map((call: any[]) => call[0])
    expect(gotoUrls.some((url: string) => url.includes('/login'))).toBe(false)
    expect(gotoUrls.every((url: string) => url.includes('/jobs/search'))).toBe(true)
  })

  it('returns status:error when the browser cannot be reached', async () => {
    mockLaunch.mockRejectedValueOnce(new Error('no chromium binary'))

    const result = await runLinkedinScraper('engineer', 'Remote')

    expect(result.status).toBe('error')
    expect(result.jobs).toEqual([])
  })

  it('always closes the browser, even on failure mid-scrape', async () => {
    mockPage.goto.mockRejectedValueOnce(new Error('navigation failed'))

    const result = await runLinkedinScraper('engineer', 'Remote')

    expect(result.status).toBe('error')
    expect(mockBrowser.close).toHaveBeenCalled()
  })
})
