'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // 1. Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // 2. Add them to the profiles table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
        },
      ])

    if (profileError) {
      console.error('Failed to create profile, rolling back auth user:', profileError)
      try {
        const adminClient = createAdminClient()
        await adminClient.auth.admin.deleteUser(data.user.id)
      } catch (rollbackError) {
        // Rollback itself failed (e.g. SUPABASE_SERVICE_ROLE_KEY not configured) —
        // the user IS now stuck in the orphaned state this rollback exists to
        // prevent. Log loudly so it's actually noticed and fixed, rather than
        // silently leaving a broken account with no trace.
        console.error('Signup rollback failed — orphaned auth user left behind:', data.user.id, rollbackError)
      }
      return { error: 'Signup failed while setting up your profile. Please try again.' }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
