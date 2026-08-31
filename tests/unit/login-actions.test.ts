/**
 * @jest-environment node
 */
const mockSignInWithPassword = jest.fn()
const mockSignUp = jest.fn()
const mockSignOut = jest.fn()
const mockProfilesInsert = jest.fn()
const mockDeleteUser = jest.fn()
const mockRedirect = jest.fn((path: string) => {
  const err: any = new Error('NEXT_REDIRECT')
  err.digest = `NEXT_REDIRECT;${path}`
  throw err
})

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: (path: string) => mockRedirect(path) }))

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
    from: () => ({ insert: mockProfilesInsert }),
  })),
}))

jest.mock('@/utils/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    auth: { admin: { deleteUser: mockDeleteUser } },
  })),
}))

import { login, signup, signout } from '@/app/login/actions'

function formData(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

describe('login/actions', () => {
  beforeEach(() => {
    mockSignInWithPassword.mockReset()
    mockSignUp.mockReset()
    mockSignOut.mockReset()
    mockProfilesInsert.mockReset().mockResolvedValue({ error: null })
    mockDeleteUser.mockReset().mockResolvedValue({ error: null })
    mockRedirect.mockClear()
  })

  describe('login', () => {
    it('returns an error without redirecting when required fields are missing', async () => {
      const result = await login(formData({ email: '' }))
      expect(result?.error).toBe('Email and password are required')
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('returns the auth error message on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })

      const result = await login(formData({ email: 'a@b.com', password: 'wrong' }))

      expect(result?.error).toBe('Invalid login credentials')
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('redirects to /dashboard on success', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })

      await expect(login(formData({ email: 'a@b.com', password: 'right' }))).rejects.toThrow('NEXT_REDIRECT')
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('signup', () => {
    it('returns the auth error message when signUp fails', async () => {
      mockSignUp.mockResolvedValue({ data: { user: null }, error: { message: 'Email already registered' } })

      const result = await signup(formData({ email: 'a@b.com', password: 'pw', firstName: 'A', lastName: 'B' }))

      expect(result?.error).toBe('Email already registered')
      expect(mockProfilesInsert).not.toHaveBeenCalled()
    })

    it('rolls back the auth user when the profile insert fails', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
      mockProfilesInsert.mockResolvedValue({ error: { message: 'insert failed' } })

      const result = await signup(formData({ email: 'a@b.com', password: 'pw', firstName: 'A', lastName: 'B' }))

      expect(mockDeleteUser).toHaveBeenCalledWith('u1')
      expect(result?.error).toBe('Signup failed while setting up your profile. Please try again.')
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('still returns an error (does not crash) if the rollback itself fails', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
      mockProfilesInsert.mockResolvedValue({ error: { message: 'insert failed' } })
      mockDeleteUser.mockRejectedValue(new Error('no service role key'))

      const result = await signup(formData({ email: 'a@b.com', password: 'pw' }))

      expect(result?.error).toBe('Signup failed while setting up your profile. Please try again.')
    })

    it('redirects to /onboarding on success', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
      mockProfilesInsert.mockResolvedValue({ error: null })

      await expect(
        signup(formData({ email: 'a@b.com', password: 'pw', firstName: 'A', lastName: 'B' }))
      ).rejects.toThrow('NEXT_REDIRECT')
      expect(mockRedirect).toHaveBeenCalledWith('/onboarding')
    })
  })

  describe('signout', () => {
    it('signs out and redirects to /login', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      await expect(signout()).rejects.toThrow('NEXT_REDIRECT')
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })
})
