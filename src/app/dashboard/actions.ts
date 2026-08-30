'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteJobMatch(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('job_matches').delete().eq('id', matchId).eq('user_id', user.id)
  
  if (error) {
    console.error('Failed to delete job match:', error)
    throw new Error('Failed to delete match')
  }

  revalidatePath('/dashboard')
}
