import { render, screen } from '@testing-library/react'
import Page from './page'

// Mock the 3D scene since it requires a Canvas environment not supported by jsdom
jest.mock('@/components/3d/ConstellationScene', () => ({
  ConstellationScene: () => <div data-testid="mock-scene" />
}))

// Mock Framer Motion to prevent animation issues in JSDOM
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    h1: ({ children, className }: any) => <h1 className={className}>{children}</h1>,
    p: ({ children, className }: any) => <p className={className}>{children}</p>,
  }
}))

describe('Landing Page', () => {
  it('renders the Orbit brand name', () => {
    render(<Page />)
    const brandElement = screen.getByText('Orbit')
    expect(brandElement).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    render(<Page />)
    const heading = screen.getByText(/Find your next role on/i)
    expect(heading).toBeInTheDocument()
  })
})
