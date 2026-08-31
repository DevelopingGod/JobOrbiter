import { render, screen, fireEvent } from '@testing-library/react'
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent'

jest.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) => ({ children, className }: any) => {
        const Tag = tag as any
        return <Tag className={className}>{children}</Tag>
      },
    }
  ),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const baseProps = {
  usersCount: 2,
  matchesCount: 5,
  sourceStats: { remotive: 2, hackernews: 1 },
  sourceActive: { remotive: true, hackernews: false },
  toggleAgent: jest.fn(),
}

describe('AdminDashboardContent', () => {
  it('renders real users instead of hardcoded mock rows', () => {
    render(
      <AdminDashboardContent
        {...baseProps}
        users={[
          { id: 'u1', name: 'Jane Doe', matches: 3, joinedAt: '2026-01-01T00:00:00Z' },
          { id: 'u2', name: 'Unnamed', matches: 0, joinedAt: '2026-02-01T00:00:00Z' },
        ]}
      />
    )

    fireEvent.click(screen.getByText('Total Users'))

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('u1')).toBeInTheDocument()
    // The old mock data must not appear anywhere.
    expect(screen.queryByText(/user_f9a8b/)).not.toBeInTheDocument()
    expect(screen.queryByText('Tokens Consumed')).not.toBeInTheDocument()
  })

  it('shows an empty state when there are no registered users', () => {
    render(<AdminDashboardContent {...baseProps} users={[]} />)

    fireEvent.click(screen.getByText('Total Users'))

    expect(screen.getByText('No registered users.')).toBeInTheDocument()
  })

  it('submits the kill-switch form with the correct source and current active state', () => {
    const { container } = render(<AdminDashboardContent {...baseProps} users={[]} />)

    // Overview tab is the default; the remotive row's hidden fields should
    // reflect sourceActive.remotive (true) so submitting flips it off.
    const hiddenInputs = container.querySelectorAll('input[name="sourceId"]')
    const remotiveForm = Array.from(hiddenInputs).find((el) => (el as HTMLInputElement).value === 'remotive')?.closest('form')
    expect(remotiveForm).not.toBeNull()
    const isActiveInput = remotiveForm!.querySelector('input[name="isActive"]') as HTMLInputElement
    expect(isActiveInput.value).toBe('true')
  })
})
