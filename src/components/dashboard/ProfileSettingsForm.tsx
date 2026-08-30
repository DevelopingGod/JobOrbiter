'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, X, Plus, ChevronDown, Check } from 'lucide-react'
import { updateProfileSettings } from '@/app/dashboard/profile/actions'

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'SGD', label: 'SGD (S$)' },
]

interface Preferences {
  desired_roles: string[]
  min_salary: number
  remote_only: boolean
  currency?: string
}

export function ProfileSettingsForm({ initialPreferences }: { initialPreferences: Preferences }) {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<string[]>(initialPreferences?.desired_roles || [])
  const [newRole, setNewRole] = useState('')
  const [minSalary, setMinSalary] = useState(initialPreferences?.min_salary || 0)
  const [currency, setCurrency] = useState(initialPreferences?.currency || 'USD')
  const [remoteOnly, setRemoteOnly] = useState(initialPreferences?.remote_only || false)
  const [success, setSuccess] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)

  const handleAddRole = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    if (newRole.trim() && !roles.includes(newRole.trim())) {
      setRoles([...roles, newRole.trim()])
      setNewRole('')
    }
  }

  const removeRole = (roleToRemove: string) => {
    setRoles(roles.filter(r => r !== roleToRemove))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    
    await updateProfileSettings({
      desired_roles: roles,
      min_salary: minSalary,
      currency,
      remote_only: remoteOnly
    })
    
    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Desired Roles</label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          <AnimatePresence>
            {roles.map(role => (
              <motion.div
                key={role}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-orange-500/10 text-orange-500 border border-orange-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium"
              >
                {role}
                <button type="button" onClick={() => removeRole(role)} className="hover:text-red-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyDown={handleAddRole}
            placeholder="e.g. AI Engineer (Press Enter)"
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
          <button
            type="button"
            onClick={handleAddRole}
            className="bg-muted text-foreground px-4 rounded-xl hover:bg-orange-500 hover:text-white transition-colors border border-border"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="space-y-3 flex-1">
          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Min Salary</label>
          <input
            type="number"
            value={minSalary}
            onChange={(e) => setMinSalary(parseInt(e.target.value))}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
          />
        </div>
        <div className="space-y-3 flex-1 relative">
          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Currency</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono flex justify-between items-center"
            >
              <span>{CURRENCIES.find(c => c.value === currency)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {currencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-50 py-2"
                >
                  {CURRENCIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => { setCurrency(c.value); setCurrencyOpen(false) }}
                      className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors flex items-center justify-between font-mono text-sm"
                    >
                      {c.label}
                      {c.value === currency && <Check className="w-4 h-4 text-orange-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => setRemoteOnly(!remoteOnly)}>
        <input
          type="checkbox"
          checked={remoteOnly}
          onChange={() => {}}
          className="w-5 h-5 rounded border-border bg-background text-orange-500 focus:ring-orange-500 cursor-pointer pointer-events-none"
        />
        <label className="text-sm font-bold text-foreground cursor-pointer">
          Strictly Remote Only
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] active:scale-95 flex items-center justify-center gap-2 ${
          success 
            ? 'bg-green-500 text-white hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
        }`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? 'Updated Successfully!' : 'Update Constraints'}
      </button>
    </form>
  )
}
