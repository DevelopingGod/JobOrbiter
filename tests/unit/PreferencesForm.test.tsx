import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PreferencesForm } from '@/components/forms/PreferencesForm'
import { updateProfileSettings } from '@/app/dashboard/profile/actions'

jest.mock('framer-motion', () => ({
  motion: { div: ({ children, className }: any) => <div className={className}>{children}</div> },
}))

jest.mock('@/app/dashboard/profile/actions', () => ({
  updateProfileSettings: jest.fn(),
}))

const mockUpdateProfileSettings = updateProfileSettings as jest.Mock

describe('PreferencesForm', () => {
  beforeEach(() => {
    mockUpdateProfileSettings.mockReset().mockResolvedValue({ success: true })
  })

  it('actually calls updateProfileSettings with the form values instead of just simulating success', async () => {
    const onComplete = jest.fn()
    render(<PreferencesForm onComplete={onComplete} />)

    fireEvent.change(screen.getByPlaceholderText('Software Engineer, Frontend Developer'), {
      target: { value: 'Backend Engineer, Platform Engineer' },
    })
    fireEvent.change(screen.getByPlaceholderText('100000'), { target: { value: '150000' } })

    fireEvent.click(screen.getByRole('button', { name: /Finalize Initialization/i }))

    await waitFor(() => expect(mockUpdateProfileSettings).toHaveBeenCalledTimes(1))

    expect(mockUpdateProfileSettings).toHaveBeenCalledWith({
      desired_roles: ['Backend Engineer', 'Platform Engineer'],
      min_salary: 150000,
      remote_only: true, // the checkbox defaults checked
    })
    await waitFor(() => expect(onComplete).toHaveBeenCalled())
  })

  it('shows an error and stops the spinner instead of hanging when the save fails', async () => {
    mockUpdateProfileSettings.mockRejectedValue(new Error('db down'))
    const onComplete = jest.fn()
    render(<PreferencesForm onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /Finalize Initialization/i }))

    expect(await screen.findByText(/Could not save your preferences/i)).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
