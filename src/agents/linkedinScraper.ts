import { chromium } from 'playwright'

export async function runLinkedinScraper(keywords: string, location: string) {
  console.log(`[LinkedIn Agent] Booting headless chromium to search: ${keywords} in ${location}`)
  
  // Note: Running this on Vercel requires specialized browserless.io setup.
  // For local execution, this will use the installed Chromium binary.
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to LinkedIn Login
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' })
    
    // In a production secure environment, you would retrieve these from a secrets vault or user preferences securely.
    // For this demonstration, we rely on environment variables if they exist, otherwise we just scrape public job pages.
    const username = process.env.LINKEDIN_USER
    const password = process.env.LINKEDIN_PASS

    if (username && password) {
      console.log('[LinkedIn Agent] Credentials found. Attempting login...')
      await page.fill('#username', username)
      await page.fill('#password', password)
      await page.click('[type="submit"]')
      await page.waitForNavigation()
      console.log('[LinkedIn Agent] Login successful. Navigating to jobs...')
      
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' })
      
      // Wait for job cards to load
      await page.waitForSelector('.job-card-container', { timeout: 10000 }).catch(() => console.log('[LinkedIn Agent] No jobs found or timeout.'))
      
      const jobs = await page.$$eval('.job-card-container', cards => {
        return cards.map(card => {
          const title = card.querySelector('.job-card-list__title')?.textContent?.trim() || ''
          const company = card.querySelector('.job-card-container__company-name')?.textContent?.trim() || ''
          const link = card.querySelector('a')?.href || ''
          return { title, company, link }
        })
      })
      
      console.log(`[LinkedIn Agent] Extracted ${jobs.length} jobs.`)
      return jobs

    } else {
      console.log('[LinkedIn Agent] No credentials provided. Attempting public unauthenticated scraping (may be blocked)...')
      
      // Public search
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
      return jobs
    }

  } catch (error) {
    console.error('[LinkedIn Agent] Error during scraping sequence:', error)
    return []
  } finally {
    await browser.close()
    console.log('[LinkedIn Agent] Chromium session terminated.')
  }
}
