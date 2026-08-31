import { render, screen, fireEvent } from '@testing-library/react'
import { TextEncoder, TextDecoder } from 'util'
import { ScoutButton } from '@/components/dashboard/ScoutButton'

// jsdom doesn't provide these globally, but the component (and this test's
// fake stream) both need them.
if (typeof global.TextEncoder === 'undefined') {
  ;(global as any).TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  ;(global as any).TextDecoder = TextDecoder
}

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('react-confetti', () => () => null)
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, className, onClick }: any) => (
      <button className={className} onClick={onClick}>{children}</button>
    ),
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
    p: ({ children, className }: any) => <p className={className}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

function makeSplitEventStreamResponse() {
  // Deliberately splits the "done" event's "done" keyword itself across two
  // chunks — reproduces an HTTP chunk boundary landing mid-event. Without
  // buffering across reads, this event is silently dropped and the UI never
  // leaves the "scouting" state.
  const chunks = [
    'event: status\ndata: {"message":"Hello"}\n\nevent: don',
    'e\ndata: {"processed":1,"matches":0}\n\n',
  ]
  let i = 0
  const encoder = new TextEncoder()
  return {
    body: {
      getReader: () => ({
        read: async () => {
          if (i < chunks.length) {
            const value = encoder.encode(chunks[i])
            i++
            return { value, done: false }
          }
          return { value: undefined, done: true }
        },
      }),
    },
  }
}

describe('ScoutButton SSE handling', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(makeSplitEventStreamResponse())
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn(), setItem: jest.fn() },
      writable: true,
    })
  })

  it('reassembles a "done" event split across two stream reads instead of losing it', async () => {
    render(<ScoutButton />)

    fireEvent.click(screen.getByText('Force Manual Sync'))

    // Only reachable if the split "done" event was correctly buffered and
    // reassembled across the two reads above.
    expect(await screen.findByText(/Reveal Results/i)).toBeInTheDocument()
  })
})
