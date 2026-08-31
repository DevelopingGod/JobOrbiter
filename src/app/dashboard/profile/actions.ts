'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const PreferencesSchema = z.object({
  desired_roles: z.array(z.string()),
  min_salary: z.number(),
  remote_only: z.boolean(),
  currency: z.string().optional(),
})

type Preferences = z.infer<typeof PreferencesSchema>

export async function updateProfileSettings(data: Preferences) {
  const parsed = PreferencesSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid preferences payload: ${parsed.error.message}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('preferences').upsert({
    id: user.id,
    desired_roles: parsed.data.desired_roles,
    min_salary: parsed.data.min_salary,
    remote_only: parsed.data.remote_only,
    currency: parsed.data.currency,
  })

  if (error) throw error

  revalidatePath('/dashboard/profile')
  return { success: true }
}
