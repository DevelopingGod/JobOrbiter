'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { motion } from 'framer-motion'

export function DashboardMetrics({ matches }: { matches: any[] }) {
  if (matches.length === 0) return null

  // Process data for charts
  const sourceCount: Record<string, number> = {}
  matches.forEach(m => {
    const src = m.source || 'remotive'
    sourceCount[src] = (sourceCount[src] || 0) + 1
  })

  const sourceData = Object.entries(sourceCount).map(([name, value]) => ({ name, value }))
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899']

  // Average score
  const avgScore = Math.round(matches.reduce((acc, m) => acc + (m.match_score || 0), 0) / matches.length)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
    >
      <div className="glass p-6 rounded-[2rem] border border-border">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Source Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 flex-wrap mt-4">
          {sourceData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6 rounded-[2rem] border border-border flex flex-col justify-center items-center text-center">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Average Match Quality</h3>
        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-2">
          {avgScore}%
        </div>
        <p className="text-muted-foreground text-sm max-w-[200px]">
          Based on {matches.length} curated jobs scored against your profile constraints.
        </p>
      </div>
    </motion.div>
  )
}
