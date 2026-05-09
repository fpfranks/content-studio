'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, ExternalLink, Copy, ClipboardList } from 'lucide-react'
import HUDPanel from './HUDPanel'
import toast from 'react-hot-toast'

interface VideoFile { name: string; size: string; resolution?: string }
interface Props { video: VideoFile | null }

const YOUTUBE_STEPS = [
  { id: 'title', label: 'Copy title from AI Studio' },
  { id: 'thumbnail', label: 'Create thumbnail (Canva / CapCut)' },
  { id: 'upload', label: 'Upload video to YouTube Studio' },
  { id: 'description', label: 'Paste description from AI Studio' },
  { id: 'tags', label: 'Add tags + hashtags' },
  { id: 'chapters', label: 'Add chapter markers from Script Writer' },
  { id: 'cards', label: 'Add end screen cards' },
  { id: 'publish-yt', label: 'Set visibility + publish' },
]

const TIKTOK_STEPS = [
  { id: 'caption', label: 'Copy TikTok caption from AI Studio' },
  { id: 'crop', label: 'Crop to 9:16 vertical if needed' },
  { id: 'upload-tt', label: 'Upload to TikTok app' },
  { id: 'audio', label: 'Add trending audio (optional)' },
  { id: 'hashtags-tt', label: 'Add hashtags from AI Studio' },
  { id: 'cover', label: 'Set cover frame' },
  { id: 'post-tt', label: 'Post' },
]

const SHORTS_STEPS = [
  { id: 'crop-s', label: 'Confirm 9:16 vertical crop' },
  { id: 'title-s', label: 'Add short punchy title (< 60 chars)' },
  { id: 'upload-s', label: 'Upload to YouTube Shorts' },
  { id: 'hashtag-shorts', label: 'Add #Shorts hashtag' },
  { id: 'post-s', label: 'Publish' },
]

const PLATFORM_LINKS = [
  { name: 'YouTube Studio', url: 'https://studio.youtube.com', icon: '▶' },
  { name: 'TikTok Upload', url: 'https://www.tiktok.com/upload', icon: '♪' },
  { name: 'Canva Thumbnail', url: 'https://canva.com', icon: '🎨' },
  { name: 'CapCut Edit', url: 'https://www.capcut.com', icon: '✂' },
]

export default function PublishPanel({ video }: Props) {
  const [ytChecked, setYtChecked] = useState<Record<string, boolean>>({})
  const [ttChecked, setTtChecked] = useState<Record<string, boolean>>({})
  const [shortsChecked, setShortsChecked] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  const [activeList, setActiveList] = useState<'youtube' | 'tiktok' | 'shorts'>('youtube')

  const toggle = (id: string, setter: any, state: any) => setter({ ...state, [id]: !state[id] })

  const lists = {
    youtube: { steps: YOUTUBE_STEPS, checked: ytChecked, setter: setYtChecked, label: 'YouTube', icon: '▶', color: 'text-red-400' },
    tiktok: { steps: TIKTOK_STEPS, checked: ttChecked, setter: setTtChecked, label: 'TikTok', icon: '♪', color: 'text-neon-pink' },
    shorts: { steps: SHORTS_STEPS, checked: shortsChecked, setter: setShortsChecked, label: 'Shorts', icon: '⚡', color: 'text-yellow-400' },
  }

  const active = lists[activeList]
  const doneCount = active.steps.filter(s => active.checked[s.id]).length
  const progress = Math.round((doneCount / active.steps.length) * 100)

  function resetAll() {
    setYtChecked({}); setTtChecked({}); setShortsChecked({})
    toast.success('Checklist reset')
  }

  return (
    <div className="space-y-4">
      {/* Video loaded indicator */}
      {video ? (
        <HUDPanel>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
            <div>
              <p className="text-xs text-neon-cyan/80 font-mono">{video.name}</p>
              <p className="text-xs text-neon-cyan/40">{video.size} · {video.resolution}</p>
            </div>
          </div>
        </HUDPanel>
      ) : (
        <HUDPanel>
          <p className="text-xs text-neon-cyan/40 text-center py-1">Upload a video in Studio tab first</p>
        </HUDPanel>
      )}

      {/* Platform tabs */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(lists) as typeof activeList[]).map(p => {
          const l = lists[p]
          const done = l.steps.filter(s => l.checked[s.id]).length
          return (
            <button
              key={p}
              onClick={() => setActiveList(p)}
              className={`hud-panel p-3 text-center transition-all ${activeList === p ? 'border-neon-cyan/30 bg-neon-cyan/5' : ''}`}
            >
              <div className={`text-lg ${l.color}`}>{l.icon}</div>
              <div className="text-xs text-neon-cyan/60 mt-0.5">{l.label}</div>
              <div className="text-xs text-neon-cyan/30">{done}/{l.steps.length}</div>
            </button>
          )
        })}
      </div>

      {/* Progress */}
      <HUDPanel title={`${active.label} Checklist`} tag={`${progress}% DONE`}>
        <div className="neon-progress h-1.5 w-full mb-4">
          <motion.div
            className="neon-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="space-y-2">
          {active.steps.map((step, i) => {
            const done = !!active.checked[step.id]
            return (
              <motion.button
                key={step.id}
                onClick={() => toggle(step.id, active.setter, active.checked)}
                className={`w-full flex items-center gap-3 p-3 hud-panel text-left transition-all ${done ? 'border-neon-green/20 bg-neon-green/3' : 'hover:border-neon-cyan/20'}`}
                whileTap={{ scale: 0.98 }}
              >
                {done
                  ? <CheckCircle className="w-4 h-4 text-neon-green shrink-0" />
                  : <Circle className="w-4 h-4 text-neon-cyan/30 shrink-0" />
                }
                <span className={`text-sm ${done ? 'line-through text-neon-cyan/30' : 'text-neon-cyan/70'}`}>
                  {step.label}
                </span>
              </motion.button>
            )
          })}
        </div>
        {progress === 100 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 border border-neon-green/30 bg-neon-green/5 rounded-sm text-center">
            <p className="text-neon-green text-sm font-mono">✓ ALL DONE — VIDEO POSTED</p>
          </motion.div>
        )}
      </HUDPanel>

      {/* Quick links */}
      <HUDPanel title="Quick Links" tag="OPEN">
        <div className="grid grid-cols-2 gap-2">
          {PLATFORM_LINKS.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hud-panel p-3 flex items-center gap-2 hover:border-neon-cyan/30 transition-all group"
            >
              <span className="text-base">{link.icon}</span>
              <span className="text-xs text-neon-cyan/60 group-hover:text-neon-cyan/90 transition-colors flex-1">{link.name}</span>
              <ExternalLink className="w-3 h-3 text-neon-cyan/20 group-hover:text-neon-cyan/60" />
            </a>
          ))}
        </div>
      </HUDPanel>

      {/* Post notes */}
      <HUDPanel title="Post Notes">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes for this upload — post time, collab tags, pinned comment…"
          rows={3}
          className="neon-input w-full p-2.5 text-sm rounded-sm resize-none"
        />
        <div className="flex gap-2 mt-2">
          <button onClick={() => { navigator.clipboard.writeText(notes); toast.success('Notes copied') }}
            className="glow-btn flex-1 py-2 text-xs flex items-center justify-center gap-1">
            <Copy className="w-3 h-3" /> Copy Notes
          </button>
          <button onClick={resetAll} className="glow-btn glow-btn-purple px-4 py-2 text-xs">Reset All</button>
        </div>
      </HUDPanel>
    </div>
  )
}
