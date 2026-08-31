/**
 * @jest-environment node
 */
const mockGetUser = jest.fn()
const mockUpsert = jest.fn()

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({ upsert: mockUpsert }),
  })),
}))

import { updateProfileSettings } from '@/app/dashboard/profile/actions'

describe('updateProfileSettings', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockUpsert.mockReset().mockResolvedValue({ error: null })
  })

  it('throws when the payload fails schema validation', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    await expect(
      updateProfileSettings({ desired_roles: 'not-an-array', min_salary: 'not-a-number' } as any)
    ).rejects.toThrow(/Invalid preferences payload/)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('throws Unauthorized when there is no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    await expect(
      updateProfileSettings({ desired_roles: ['Engineer'], min_salary: 100000, remote_only: true })
    ).rejects.toThrow('Unauthorized')
  })

  it('upserts valid preferences and returns success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const result = await updateProfileSettings({
      desired_roles: ['Engineer'],
      min_salary: 100000,
      remote_only: true,
      currency: 'USD',
    })

    expect(result).toEqual({ success: true })
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', desired_roles: ['Engineer'], min_salary: 100000, currency: 'USD' })
    )
  })

  it('propagates a database error instead of silently retrying', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockUpsert.mockResolvedValue({ error: { message: 'column "currency" does not exist' } })

    await expect(
      updateProfileSettings({ desired_roles: ['Engineer'], min_salary: 100000, remote_only: false })
    ).rejects.toBeTruthy()
    // Exactly one upsert attempt — no silent retry-without-currency fallback.
    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })
})
