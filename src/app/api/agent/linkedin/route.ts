import { NextResponse } from 'next/server'
import { runLinkedinScraper } from '@/agents/linkedinScraper'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keywords, location } = await req.json()

    if (!keywords) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 })
    }

    const result = await runLinkedinScraper(keywords, location || 'Remote')

    if (result.status === 'error') {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json({ success: true, jobs: result.jobs })
  } catch (error: any) {
    console.error('LinkedIn Scraper API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
