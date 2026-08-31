import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Each custom URL source triggers a Jina AI Reader fetch + an LLM extraction
// call (plus one LLM evaluation call per job found) on every scout run —
// unbounded per-user source growth is a real cost-amplification risk, not
// just a UX concern. See /cso security audit, 2026-08-31.
const MAX_CUSTOM_SOURCES_PER_USER = 15

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('job_sources')
    .select('source_id, is_active')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sources: data || [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { source_id, is_active } = body

  if (!source_id) {
    return NextResponse.json({ error: 'source_id is required' }, { status: 400 })
  }

  if (typeof source_id === 'string' && source_id.startsWith('http')) {
    const { data: existingCustomSources } = await supabase
      .from('job_sources')
      .select('source_id')
      .eq('user_id', user.id)
      .like('source_id', 'http%')

    const isNewSource = !(existingCustomSources || []).some(s => s.source_id === source_id)
    if (isNewSource && (existingCustomSources?.length || 0) >= MAX_CUSTOM_SOURCES_PER_USER) {
      return NextResponse.json(
        { error: `You can add at most ${MAX_CUSTOM_SOURCES_PER_USER} custom sources.` },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabase
    .from('job_sources')
    .upsert(
      { 
        user_id: user.id, 
        source_id, 
        is_active 
      },
      { onConflict: 'user_id, source_id' }
    )
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, source: data?.[0] })
}
