import { render, screen } from '@testing-library/react'
import Page from './page'

// Mock the 3D scene since it requires a Canvas environment not supported by jsdom
jest.mock('@/components/3d/OrbiterScene', () => ({
  OrbiterScene: () => <div data-testid="mock-scene" />
}))

// Mock Framer Motion to prevent animation issues in JSDOM. A Proxy covers
// every motion.* tag the tree uses (motion.div, motion.h1, motion.button, ...)
// instead of a hand-picked list that silently breaks (undefined component)
// the next time a child component reaches for a tag nobody added here yet.
jest.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        ({ children, className, ...rest }: any) => {
          const Tag = tag as any
          const { onClick } = rest
          return <Tag className={className} onClick={onClick}>{children}</Tag>
        },
    }
  ),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Landing Page', () => {
  it('renders the Job Orbiter brand name', () => {
    render(<Page />)
    const brandElement = screen.getByText('Job Orbiter')
    expect(brandElement).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    render(<Page />)
    const heading = screen.getByText(/Find your next role on/i)
    expect(heading).toBeInTheDocument()
  })
})
