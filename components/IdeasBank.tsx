'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Lightbulb, Trash2, CheckCircle, Circle, Sparkles, Tag } from 'lucide-react'
import HUDPanel from './HUDPanel'
import toast from 'react-hot-toast'

type IdeaStatus = 'idea' | 'scripted' | 'filmed' | 'done'

interface Idea {
  id: string
  title: string
  notes: string
  status: IdeaStatus
  platform: string
  tags: string
  createdAt: string
}

const STATUS_CONFIG: Record<IdeaStatus, { label: string; color: string; dot: string }> = {
  idea: { label: 'Idea', color: 'text-neon-cyan/60', dot: 'bg-neon-cyan/40' },
  scripted: { label: 'Scripted', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  filmed: { label: 'Filmed', color: 'text-neon-purple', dot: 'bg-neon-purple' },
  done: { label: 'Posted', color: 'text-neon-green', dot: 'bg-neon-green' },
}

function uid() { return Math.random().toString(36).slice(2) }

const SUGGESTED_IDEAS = [
  'Day in my life as a UK AI entrepreneur',
  'I automated my morning routine — here\'s what happened',
  'How I landed my first client with no portfolio',
  'Every AI tool I actually use (honest review)',
  'Building an automation agency from £0 — week 1',
  'I cold-emailed 50 UK businesses — the results',
  'My home office setup that cost under £500',
  'How AI saved me 20 hours this week',
]

export default function IdeasBank() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<IdeaStatus | 'all'>('all')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [platform, setPlatform] = useState('youtube')
  const [tags, setTags] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('content-ideas')
    if (saved) setIdeas(JSON.parse(saved))
  }, [])

  function save(updated: Idea[]) {
    setIdeas(updated)
    localStorage.setItem('content-ideas', JSON.stringify(updated))
  }

  function addIdea() {
    if (!title.trim()) { toast.error('Add a title'); return }
    const idea: Idea = { id: uid(), title, notes, status: 'idea', platform, tags, createdAt: new Date().toISOString() }
    save([idea, ...ideas])
    setTitle(''); setNotes(''); setTags(''); setShowForm(false)
    toast.success('Idea saved')
  }

  function addSuggested(t: string) {
    const idea: Idea = { id: uid(), title: t, notes: '', status: 'idea', platform: 'youtube', tags: '', createdAt: new Date().toISOString() }
    save([idea, ...ideas])
    toast.success('Added to ideas')
  }

  function updateStatus(id: string, status: IdeaStatus) {
    save(ideas.map(i => i.id === id ? { ...i, status } : i))
  }

  function deleteIdea(id: string) {
    save(ideas.filter(i => i.id !== id))
    toast.success('Deleted')
  }

  async function generateIdeas() {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'UK AI automation entrepreneur day-in-life content creator', vibe: 'authentic', platform: 'both', videoName: '' }),
      })
      const data = await res.json()
      if (data.titles) {
        const newIdeas = data.titles.map((t: string) => ({
          id: uid(), title: t, notes: '', status: 'idea' as IdeaStatus,
          platform: 'both', tags: '', createdAt: new Date().toISOString(),
        }))
        save([...newIdeas, ...ideas])
        toast.success(`${newIdeas.length} ideas added`)
      }
    } catch {
      toast.error('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const filtered = filter === 'all' ? ideas : ideas.filter(i => i.status === filter)
  const statusCounts = (Object.keys(STATUS_CONFIG) as IdeaStatus[]).reduce((acc, s) => {
    acc[s] = ideas.filter(i => i.status === s).length
    return acc
  }, {} as Record<IdeaStatus, number>)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(STATUS_CONFIG) as IdeaStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? 'all' : s)}
            className={`hud-panel p-3 text-center transition-all ${filter === s ? 'border-neon-cyan/30 bg-neon-cyan/5' : ''}`}
          >
            <div className={`text-xl font-mono ${STATUS_CONFIG[s].color}`}>{statusCounts[s]}</div>
            <div className="text-xs text-neon-cyan/30 mt-0.5">{STATUS_CONFIG[s].label}</div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowForm(!showForm)} className="glow-btn glow-btn-solid flex-1 py-2.5 text-xs tracking-widest flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> ADD IDEA
        </button>
        <button onClick={generateIdeas} disabled={generating} className="glow-btn glow-btn-purple px-4 py-2.5 text-xs flex items-center gap-2">
          {generating
            ? <div className="w-3.5 h-3.5 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
            : <Sparkles className="w-3.5 h-3.5" />
          }
          AI IDEAS
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <HUDPanel title="New Idea">
              <div className="space-y-3">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Video title / idea…" className="neon-input w-full p-2.5 text-sm rounded-sm" />
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes, angle, inspiration… (optional)" rows={2} className="neon-input w-full p-2.5 text-sm rounded-sm resize-none" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={platform} onChange={e => setPlatform(e.target.value)} className="neon-select p-2 text-sm rounded-sm">
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="both">Both</option>
                    <option value="shorts">Shorts</option>
                  </select>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags e.g. ai, vlog" className="neon-input p-2 text-sm rounded-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addIdea} className="glow-btn glow-btn-solid flex-1 py-2 text-xs tracking-widest">SAVE IDEA</button>
                  <button onClick={() => setShowForm(false)} className="glow-btn px-4 py-2 text-xs">CANCEL</button>
                </div>
              </div>
            </HUDPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested */}
      {ideas.length === 0 && (
        <HUDPanel title="Suggested Ideas" tag="STARTER">
          <div className="space-y-2">
            {SUGGESTED_IDEAS.map((idea, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-2 hud-panel group">
                <p className="text-xs text-neon-cyan/60 flex-1">{idea}</p>
                <button onClick={() => addSuggested(idea)} className="glow-btn px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </HUDPanel>
      )}

      {/* Ideas list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map(idea => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="hud-panel p-3"
            >
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_CONFIG[idea.status].dot}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-mono leading-tight ${idea.status === 'done' ? 'line-through text-neon-cyan/30' : 'text-neon-cyan/80'}`}>
                    {idea.title}
                  </p>
                  {idea.notes && <p className="text-xs text-neon-cyan/40 mt-1">{idea.notes}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="neon-tag text-xs">{idea.platform}</span>
                    {idea.tags && idea.tags.split(',').map(t => (
                      <span key={t} className="neon-tag text-xs border-neon-purple/20 text-neon-purple/60">{t.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <select
                    value={idea.status}
                    onChange={e => updateStatus(idea.id, e.target.value as IdeaStatus)}
                    className="neon-select text-xs p-1 rounded-sm"
                  >
                    {(Object.keys(STATUS_CONFIG) as IdeaStatus[]).map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                  <button onClick={() => deleteIdea(idea.id)} className="flex justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && ideas.length > 0 && (
          <p className="text-center text-xs text-neon-cyan/30 py-6">No ideas with this status</p>
        )}
      </div>
    </div>
  )
}
