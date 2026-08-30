import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, action, jobData } = await req.json()

    if (!jobId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Determine the score
    let feedbackScore = 0
    if (action === 'upvote') feedbackScore = 1
    if (action === 'downvote') feedbackScore = -1

    // Insert into feedback table
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        action_type: 'job_match_rating',
        context_data: jobData, // Context about the job for future fine-tuning
        feedback_score: feedbackScore,
      })

    if (error) {
      console.error('Feedback insertion error:', error)
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    // Optional: If downvoted, maybe delete or hide the job from matches so it doesn't clutter
    if (action === 'downvote') {
      await supabase.from('job_matches').delete().eq('id', jobId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Feedback API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
