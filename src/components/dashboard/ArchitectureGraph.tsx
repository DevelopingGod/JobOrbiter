'use client'

import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  BackgroundVariant
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Orbit, FileText, Settings2, Network, BrainCircuit, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PreferencesForm } from '@/components/forms/PreferencesForm'
import { SourcesForm } from '@/components/forms/SourcesForm'
import dynamic from 'next/dynamic'

const OrbiterScene = dynamic(
  () => import('@/components/3d/OrbiterScene').then((mod) => mod.OrbiterScene),
  { ssr: false }
)

// --- CUSTOM NODES ---

const SciFiNode = ({ data, selected }: any) => (
  <div className={`relative p-4 min-w-[220px] transition-all duration-300 backdrop-blur-md overflow-hidden
    ${selected 
      ? 'bg-orange-900/90 border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.8)] scale-105' 
      : 'bg-orange-950/80 border-orange-500/50 hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]'
    } border-2 rounded-xl group cursor-pointer`}
  >
    {/* Scanline effect */}
    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
    
    <Handle type="target" position={Position.Top} className="!bg-orange-500 !border-2 !border-zinc-900 w-4 h-4 shadow-[0_0_10px_#f97316]" />
    
    <div className="flex flex-col items-center justify-center gap-3 relative z-10">
      <div className={`p-4 rounded-full ${data.iconBg || 'bg-background'} border border-border group-hover:scale-110 transition-transform shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]`}>
        {data.icon}
      </div>
      <div className="text-center">
        <h3 className="font-black text-white text-sm tracking-widest uppercase mb-1">{data.label}</h3>
        {data.subtext && <p className="text-[10px] text-orange-200/60 font-mono tracking-wider">{data.subtext}</p>}
      </div>
    </div>
    
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !border-2 !border-zinc-900 w-4 h-4 shadow-[0_0_10px_#f97316]" />
  </div>
)

const nodeTypes = {
  scifi: SciFiNode,
}

// --- INITIAL DATA ---

// Base nodes that are always present
const baseNodes = [
  {
    id: 'resume',
    type: 'scifi',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Vectorized DNA', 
      subtext: 'Parsed Resume Embeddings',
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      iconBg: 'bg-blue-500/10'
    },
  },
  {
    id: 'preferences',
    type: 'scifi',
    position: { x: 550, y: 50 },
    data: { 
      label: 'Constraints', 
      subtext: 'Salary, Roles, Guardrails',
      icon: <Settings2 className="w-6 h-6 text-purple-400" />,
      iconBg: 'bg-purple-500/10'
    },
  },
  {
    id: 'agent',
    type: 'scifi',
    position: { x: 400, y: 350 },
    data: { 
      label: 'Agentic Core (JO)', 
      subtext: 'Groq Llama-3 Inferencing',
      icon: <BrainCircuit className="w-6 h-6 text-orange-500 animate-pulse" />,
      iconBg: 'bg-orange-500/10'
    },
  },
  {
    id: 'feed',
    type: 'scifi',
    position: { x: 400, y: 500 },
    data: { 
      label: 'Mission Control', 
      subtext: 'Live Intelligence Feed',
      icon: <Orbit className="w-6 h-6 text-orange-400 animate-spin-slow" />,
      iconBg: 'bg-orange-500/10'
    },
  },
]

const baseEdges = [
  { id: 'e1', source: 'resume', target: 'agent', animated: true, style: { stroke: '#f97316', strokeWidth: 2, filter: 'drop-shadow(0 0 5px #f97316)' } },
  { id: 'e2', source: 'preferences', target: 'agent', animated: true, style: { stroke: '#f97316', strokeWidth: 2, filter: 'drop-shadow(0 0 5px #f97316)' } },
  { id: 'e4', source: 'agent', target: 'feed', animated: true, style: { stroke: '#f97316', strokeWidth: 3, filter: 'drop-shadow(0 0 8px #f97316)' } },
]

export function ArchitectureGraph({ userSources = [], isLoggedIn = false }: { userSources?: any[], isLoggedIn?: boolean }) {
  // Generate dynamic nodes based on userSources
  const sourceNodes = userSources.length > 0 ? userSources.map((source, idx) => {
    // Distribute sources horizontally
    const xSpacing = 220;
    const totalWidth = (userSources.length - 1) * xSpacing;
    const startX = 400 - (totalWidth / 2);
    
    let label = source.source_id;
    if (label === 'remotive') label = 'Remotive API';
    if (label === 'hackernews') label = 'HackerNews';
    if (label.startsWith('http')) label = new URL(label).hostname;

    return {
      id: `source-${source.source_id}`,
      type: 'scifi',
      position: { x: startX + (idx * xSpacing), y: 200 },
      data: { 
        label: label, 
        subtext: source.is_active ? 'Active Scraper' : 'Inactive Scraper',
        icon: <Network className={`w-6 h-6 ${source.is_active ? 'text-emerald-400' : 'text-zinc-500'}`} />,
        iconBg: source.is_active ? 'bg-emerald-500/10' : 'bg-zinc-800'
      },
    }
  }) : [
    {
      id: 'source-default',
      type: 'scifi',
      position: { x: 400, y: 200 },
      data: { 
        label: 'Scraping Targets', 
        subtext: 'Login to add custom nodes',
        icon: <Network className="w-6 h-6 text-emerald-400" />,
        iconBg: 'bg-emerald-500/10'
      },
    }
  ]

  const sourceEdges = (userSources.length > 0 ? userSources : [{ source_id: 'default' }]).map((source, idx) => ({
    id: `e-source-${idx}`,
    source: `source-${source.source_id}`,
    target: 'agent',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2, filter: 'drop-shadow(0 0 5px #10b981)', opacity: source.is_active !== false ? 1 : 0.2 }
  }))

  const initialNodes = [...baseNodes, ...sourceNodes]
  const initialEdges = [...baseEdges, ...sourceEdges]

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#f97316', strokeWidth: 2 } }, eds)),
    [setEdges]
  )

  const onNodeClick = (event: any, node: any) => {
    setActiveNodeId(node.id)
  }

  const renderSidePanelContent = () => {
    if (activeNodeId === 'resume') {
      return (
        <>
          <h3 className="text-2xl font-black text-orange-500 mb-2 uppercase tracking-widest">Vectorized DNA</h3>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">Your uploaded resume is parsed by an LLM agent into structured data — contact details, skills, work history, and education. JO uses this data to score how well each job matches your background.</p>
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
            <Info className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-xs text-blue-200">The extracted data is stored in Supabase alongside your original resume file.</p>
          </div>
        </>
      )
    }

    if (activeNodeId === 'preferences') {
      return (
        <>
          <h3 className="text-2xl font-black text-orange-500 mb-2 uppercase tracking-widest">Constraints</h3>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">The hard limits for the scout agents. Modify them below to widen or narrow your intelligence gathering.</p>
          <PreferencesForm onComplete={() => setActiveNodeId(null)} />
        </>
      )
    }

    if (activeNodeId === 'source-default' || activeNodeId?.startsWith('source-')) {
      return (
        <>
          <h3 className="text-2xl font-black text-emerald-500 mb-2 uppercase tracking-widest">Scraping Target</h3>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">The active domains and APIs your fleet is currently authorized to crawl.</p>
          <SourcesForm onComplete={() => setActiveNodeId(null)} isLoggedIn={isLoggedIn} />
        </>
      )
    }

    if (activeNodeId === 'agent') {
      return (
        <>
          <h3 className="text-2xl font-black text-orange-500 mb-2 uppercase tracking-widest">Agentic Core (JO)</h3>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">The central brain of the operation. JO processes raw HTML from the scraping targets and mathematically scores the job against your Vectorized DNA and Constraints using Llama-3 models.</p>
          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl font-mono text-xs text-orange-300">
            [SYSTEM STATUS: ONLINE]<br/>
            [INFERENCE SPEED: 850 tokens/sec]<br/>
            [ACTIVE THREADS: 4]
          </div>
        </>
      )
    }

    if (activeNodeId === 'feed') {
      return (
        <>
          <h3 className="text-2xl font-black text-orange-500 mb-2 uppercase tracking-widest">Mission Control</h3>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">The final output node. All highly-scored matches are presented in real-time on your dashboard.</p>
        </>
      )
    }

    return null
  }

  return (
    <div className="w-full h-[600px] rounded-[2rem] border border-zinc-800 overflow-hidden relative bg-transparent shadow-2xl">
      {/* 3D Orbiter Background inside the graph container */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <OrbiterScene />
      </div>
      
      {/* Deep sci-fi ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.15)_0%,_rgba(0,0,0,0.8)_100%)] z-0 pointer-events-none" />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="z-10"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Cross} gap={30} size={1} color="rgba(249,115,22,0.15)" />
        <Controls className="!bg-zinc-900 !border-zinc-800 !text-zinc-400 [&>button]:!border-zinc-800 hover:[&>button]:!bg-zinc-800" />
      </ReactFlow>

      {/* SIDE PANEL (Anime/Sci-Fi slide in) */}
      <AnimatePresence>
        {activeNodeId && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNodeId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%", skewX: -5 }}
              animate={{ x: 0, skewX: 0 }}
              exit={{ x: "100%", skewX: 5 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-orange-500/30 z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
            >
              {/* Scanline overlay for panel */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.05)_50%)] bg-[length:100%_4px] pointer-events-none z-0" />
              
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center relative z-10 bg-zinc-900/50">
                <div className="flex items-center gap-2 text-orange-500 font-mono text-xs uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  Node Inspector
                </div>
                <button 
                  onClick={() => setActiveNodeId(null)}
                  className="p-2 rounded-full hover:bg-orange-500/20 text-zinc-400 hover:text-orange-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                {renderSidePanelContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
