import { render, screen } from '@testing-library/react'
import { JOChatConsole } from '@/components/onboarding/JOChatConsole'

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

describe('JOChatConsole resume data panel', () => {
  it('shows a "no data extracted" message instead of fake mock data when parsedResumeData is missing', () => {
    render(<JOChatConsole />)

    expect(screen.getByText(/No resume data was extracted/i)).toBeInTheDocument()
    // The old mock fallback content must never appear.
    expect(screen.queryByText('Senior AI Engineer')).not.toBeInTheDocument()
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument()
  })

  it('shows the real extracted data when parsedResumeData is present', () => {
    render(
      <JOChatConsole
        parsedResumeData={{
          skills: ['Go', 'Kubernetes'],
          experience: [{ title: 'Platform Engineer', company: 'Acme', years: '2020-2026' }],
          education: [{ degree: 'BS Computer Science' }],
        }}
      />
    )

    expect(screen.getByText('Go')).toBeInTheDocument()
    expect(screen.getByText('Platform Engineer')).toBeInTheDocument()
    expect(screen.getByText('BS Computer Science')).toBeInTheDocument()
  })

  it('does not render the Extracted DNA panel at all in standalone mode', () => {
    render(<JOChatConsole standalone />)

    expect(screen.queryByText('Extracted DNA')).not.toBeInTheDocument()
    expect(screen.queryByText(/No resume data was extracted/i)).not.toBeInTheDocument()
  })
})
