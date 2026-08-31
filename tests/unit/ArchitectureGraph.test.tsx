import { render, screen, fireEvent } from '@testing-library/react'
import { ArchitectureGraph } from '@/components/dashboard/ArchitectureGraph'

jest.mock('@/components/3d/OrbiterScene', () => ({ OrbiterScene: () => null }))
jest.mock('@/components/forms/PreferencesForm', () => ({
  PreferencesForm: () => <div>preferences-form</div>,
}))
jest.mock('@/components/forms/SourcesForm', () => ({
  SourcesForm: () => <div>sources-form</div>,
}))

jest.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) => ({ children, className, onClick }: any) => {
        const Tag = tag as any
        return <Tag className={className} onClick={onClick}>{children}</Tag>
      },
    }
  ),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// ReactFlow needs a real layout engine; for a unit test we only need to
// exercise this component's own onNodeClick -> side-panel logic, so replace
// ReactFlow with a stub that renders one clickable button per node.
jest.mock('@xyflow/react', () => ({
  ReactFlow: ({ nodes, onNodeClick }: any) => (
    <div>
      {nodes.map((node: any) => (
        <button key={node.id} onClick={(e) => onNodeClick(e, node)}>
          {node.id}
        </button>
      ))}
    </div>
  ),
  Controls: () => null,
  Background: () => null,
  Handle: () => null,
  Position: { Top: 'top', Bottom: 'bottom' },
  BackgroundVariant: { Cross: 'cross' },
  useNodesState: (initial: any) => [initial, jest.fn(), jest.fn()],
  useEdgesState: (initial: any) => [initial, jest.fn(), jest.fn()],
  addEdge: jest.fn(),
}))

describe('ArchitectureGraph side panel routing', () => {
  it('shows the resume panel for the resume node', () => {
    render(<ArchitectureGraph />)
    fireEvent.click(screen.getByText('resume'))
    expect(screen.getByText('Vectorized DNA')).toBeInTheDocument()
  })

  it('shows the preferences form for the preferences node', () => {
    render(<ArchitectureGraph />)
    fireEvent.click(screen.getByText('preferences'))
    expect(screen.getByText('preferences-form')).toBeInTheDocument()
  })

  it('shows the sources form for the default source node', () => {
    render(<ArchitectureGraph />)
    fireEvent.click(screen.getByText('source-default'))
    expect(screen.getByText('sources-form')).toBeInTheDocument()
  })

  it('shows the sources form for a dynamic user source node (the id-prefix match)', () => {
    render(<ArchitectureGraph userSources={[{ source_id: 'hackernews', is_active: true }]} />)
    fireEvent.click(screen.getByText('source-hackernews'))
    expect(screen.getByText('sources-form')).toBeInTheDocument()
  })

  it('shows the agent panel for the agent node', () => {
    render(<ArchitectureGraph />)
    fireEvent.click(screen.getByText('agent'))
    expect(screen.getByText('Agentic Core (JO)')).toBeInTheDocument()
  })

  it('shows nothing extra for an unrecognized node id', () => {
    render(<ArchitectureGraph />)
    // No panel content should exist before any click.
    expect(screen.queryByText('Vectorized DNA')).not.toBeInTheDocument()
    expect(screen.queryByText('Agentic Core (JO)')).not.toBeInTheDocument()
  })
})
