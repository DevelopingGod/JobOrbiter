'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface Preferences {
  desired_roles: string[]
  min_salary: number
  remote_only: boolean
  currency?: string
}

export async function updateProfileSettings(data: Preferences) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('preferences').upsert({
    id: user.id,
    desired_roles: data.desired_roles,
    min_salary: data.min_salary,
    remote_only: data.remote_only,
    currency: data.currency
  })

  // To prevent crashing if the user didn't run the migration, I'll catch and retry without currency if it fails.
  if (error) {
    if (error.message.includes('currency')) {
      await supabase.from('preferences').upsert({
        id: user.id,
        desired_roles: data.desired_roles,
        min_salary: data.min_salary,
        remote_only: data.remote_only,
      })
    } else {
      throw error
    }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
