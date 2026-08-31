import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileSettingsForm } from '@/components/dashboard/ProfileSettingsForm'
import { updateProfileSettings } from '@/app/dashboard/profile/actions'

jest.mock('framer-motion', () => ({
  motion: { div: ({ children, className }: any) => <div className={className}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

jest.mock('@/app/dashboard/profile/actions', () => ({
  updateProfileSettings: jest.fn(),
}))

const mockUpdateProfileSettings = updateProfileSettings as jest.Mock

const initialPreferences = {
  desired_roles: ['Engineer'],
  min_salary: 100000,
  remote_only: true,
  currency: 'USD',
}

describe('ProfileSettingsForm', () => {
  beforeEach(() => {
    mockUpdateProfileSettings.mockReset()
  })

  it('shows an error and stops the spinner instead of hanging when the save throws', async () => {
    mockUpdateProfileSettings.mockRejectedValue(new Error('Invalid preferences payload'))
    render(<ProfileSettingsForm initialPreferences={initialPreferences} />)

    fireEvent.click(screen.getByRole('button', { name: /Update Constraints/i }))

    expect(await screen.findByText(/Could not update your constraints/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Update Constraints/i })).not.toBeDisabled()
  })

  it('shows the success state on a successful save', async () => {
    mockUpdateProfileSettings.mockResolvedValue({ success: true })
    render(<ProfileSettingsForm initialPreferences={initialPreferences} />)

    fireEvent.click(screen.getByRole('button', { name: /Update Constraints/i }))

    expect(await screen.findByText(/Updated Successfully/i)).toBeInTheDocument()
  })
})
