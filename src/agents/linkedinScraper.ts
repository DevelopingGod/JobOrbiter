import { chromium, type Browser } from 'playwright'

// NOTE (see TODOS.md "Replace LinkedIn scraping with a compliant integration"):
// LinkedIn's ToS explicitly prohibits automated login. This scraper only ever
// touches PUBLIC, unauthenticated job search pages now — no login flow, no
// stored credentials. It's still an unofficial scrape of LinkedIn's public
// pages (fragile, may get blocked), just not the ToS-violating login variant.

export interface LinkedInJob {
  title: string
  company: string
  link: string
}

export type LinkedInScrapeResult =
  | { status: 'ok'; jobs: LinkedInJob[] }
  | { status: 'error'; jobs: []; error: string }

async function connectBrowser(): Promise<Browser> {
  // In production (Vercel etc.) a real Chromium binary can't be launched
  // in-process — connect to a remote browser service instead. Set
  // BROWSERLESS_WS_ENDPOINT (Browserbase, browserless.io, or any
  // Playwright-compatible remote browser) once you have one provisioned.
  const remoteEndpoint = process.env.BROWSERLESS_WS_ENDPOINT
  if (remoteEndpoint) {
    return chromium.connect(remoteEndpoint)
  }
  // Local dev fallback: launches the Chromium binary installed on this machine.
  return chromium.launch({ headless: true })
}

export async function runLinkedinScraper(keywords: string, location: string): Promise<LinkedInScrapeResult> {
  console.log('[LinkedIn Agent] Connecting to browser to search:', keywords, 'in', location)

  let browser: Browser
  try {
    browser = await connectBrowser()
  } catch (error) {
    console.error('[LinkedIn Agent] Failed to connect to a browser:', error)
    return {
      status: 'error',
      jobs: [],
      error: process.env.BROWSERLESS_WS_ENDPOINT
        ? 'Could not connect to the configured remote browser service'
        : 'No remote browser configured and no local Chromium available in this environment',
    }
  }

  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    const publicUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`
    await page.goto(publicUrl, { waitUntil: 'domcontentloaded' })

    await page.waitForSelector('.base-card', { timeout: 10000 }).catch(() => console.log('[LinkedIn Agent] No public jobs found or timeout.'))

    const jobs = await page.$$eval('.base-card', cards => {
      return cards.map(card => {
        const title = card.querySelector('.base-search-card__title')?.textContent?.trim() || ''
        const company = card.querySelector('.base-search-card__subtitle')?.textContent?.trim() || ''
        const link = card.querySelector('a')?.href || ''
        return { title, company, link }
      })
    })

    console.log(`[LinkedIn Agent] Extracted ${jobs.length} jobs publicly.`)
    return { status: 'ok', jobs }

  } catch (error) {
    console.error('[LinkedIn Agent] Error during scraping sequence:', error)
    return { status: 'error', jobs: [], error: error instanceof Error ? error.message : 'Unknown error' }
  } finally {
    await browser.close()
    console.log('[LinkedIn Agent] Browser session terminated.')
  }
}
