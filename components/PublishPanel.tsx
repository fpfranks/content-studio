'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Youtube, Share2, CheckCircle, AlertCircle, ExternalLink, Lock } from 'lucide-react'
import HUDPanel from './HUDPanel'
import toast from 'react-hot-toast'

interface VideoFile {
  file: File
  url: string
  name: string
}

interface Props {
  video: VideoFile | null
}

type Platform = 'youtube' | 'shorts' | 'tiktok'
type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

interface PlatformState {
  selected: boolean
  status: UploadStatus
  progress: number
  url?: string
  error?: string
}

const defaultPlatforms: Record<Platform, PlatformState> = {
  youtube: { selected: true, status: 'idle', progress: 0 },
  shorts: { selected: false, status: 'idle', progress: 0 },
  tiktok: { selected: false, status: 'idle', progress: 0 },
}

export default function PublishPanel({ video }: Props) {
  const [platforms, setPlatforms] = useState(defaultPlatforms)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public')
  const [publishing, setPublishing] = useState(false)
  const [ytConnected] = useState(false)
  const [ttConnected] = useState(false)

  function togglePlatform(p: Platform) {
    setPlatforms(prev => ({
      ...prev,
      [p]: { ...prev[p], selected: !prev[p].selected },
    }))
  }

  async function publish() {
    if (!video) { toast.error('No video loaded'); return }
    if (!title.trim()) { toast.error('Add a title first'); return }
    const selected = (Object.keys(platforms) as Platform[]).filter(p => platforms[p].selected)
    if (selected.length === 0) { toast.error('Select at least one platform'); return }

    setPublishing(true)

    for (const p of selected) {
      setPlatforms(prev => ({ ...prev, [p]: { ...prev[p], status: 'uploading', progress: 0 } }))
      try {
        // Simulate upload progress
        for (let i = 10; i <= 90; i += 10) {
          await new Promise(r => setTimeout(r, 300))
          setPlatforms(prev => ({ ...prev, [p]: { ...prev[p], progress: i } }))
        }
        const form = new FormData()
        form.append('file', video.file)
        form.append('title', title)
        form.append('description', description)
        form.append('tags', tags)
        form.append('privacy', privacy)
        form.append('platform', p)

        const res = await fetch(`/api/youtube`, { method: 'POST', body: form })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Upload failed')
        setPlatforms(prev => ({ ...prev, [p]: { ...prev[p], status: 'done', progress: 100, url: data.url } }))
        toast.success(`Uploaded to ${p}`)
      } catch (e: any) {
        setPlatforms(prev => ({ ...prev, [p]: { ...prev[p], status: 'error', error: e.message } }))
        toast.error(`${p} upload failed: ${e.message}`)
      }
    }
    setPublishing(false)
  }

  const platformConfig = {
    youtube: { name: 'YouTube', icon: '▶', color: 'text-red-400', borderColor: 'border-red-400/30', connected: ytConnected },
    shorts: { name: 'YouTube Shorts', icon: '⚡', color: 'text-red-400', borderColor: 'border-red-400/30', connected: ytConnected },
    tiktok: { name: 'TikTok', icon: '♪', color: 'text-neon-pink', borderColor: 'border-neon-pink/30', connected: ttConnected },
  }

  return (
    <div className="space-y-4">
      {/* Auth Status */}
      <HUDPanel title="Platform Connections" tag="AUTH">
        <div className="space-y-2">
          {[
            { id: 'google', name: 'Google / YouTube', connected: ytConnected, authUrl: '/api/youtube/auth' },
            { id: 'tiktok', name: 'TikTok', connected: ttConnected, authUrl: '/api/tiktok/auth' },
          ].map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 hud-panel">
              <div className="flex items-center gap-2">
                <span className={`status-dot ${p.connected ? 'online' : 'offline'}`} />
                <span className="text-xs font-mono text-neon-cyan/70">{p.name}</span>
              </div>
              {p.connected ? (
                <span className="neon-tag text-neon-green/80 border-neon-green/30">CONNECTED</span>
              ) : (
                <a href={p.authUrl} className="glow-btn px-3 py-1 text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" /> CONNECT
                </a>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-neon-cyan/25 mt-3 text-center">
          Connect accounts via OAuth — see .env.local.example for setup
        </p>
      </HUDPanel>

      {/* Platform Select */}
      <HUDPanel title="Publish To" delay={0.05}>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(platforms) as Platform[]).map(p => {
            const cfg = platformConfig[p]
            const state = platforms[p]
            return (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`
                  hud-panel p-4 flex flex-col items-center gap-2 transition-all
                  ${state.selected ? `bg-neon-cyan/5 border-neon-cyan/30 shadow-[0_0_15px_rgba(0,255,200,0.08)]` : 'hover:border-neon-cyan/20'}
                `}
              >
                <span className={`text-2xl ${cfg.color}`}>{cfg.icon}</span>
                <span className="text-xs font-mono text-center leading-tight text-neon-cyan/70">{cfg.name}</span>
                {state.selected && <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_6px_rgba(0,255,200,0.8)]" />}
              </button>
            )
          })}
        </div>
      </HUDPanel>

      {/* Video Meta */}
      <HUDPanel title="Video Details" delay={0.1}>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Paste from AI Studio or type manually…"
              className="neon-input w-full p-2.5 text-sm rounded-sm"
            />
          </div>
          <div>
            <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Paste from AI Studio…"
              className="neon-input w-full p-2.5 text-sm rounded-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Tags / Hashtags</label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="#ai #uk #entrepreneur"
                className="neon-input w-full p-2.5 text-sm rounded-sm"
              />
            </div>
            <div>
              <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Privacy</label>
              <select value={privacy} onChange={e => setPrivacy(e.target.value as any)} className="neon-select w-full p-2.5 text-sm rounded-sm">
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>
      </HUDPanel>

      {/* Upload Progress */}
      <AnimatePresence>
        {publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HUDPanel title="Upload Progress">
              <div className="space-y-3">
                {(Object.keys(platforms) as Platform[])
                  .filter(p => platforms[p].selected)
                  .map(p => (
                    <div key={p}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-neon-cyan/60 font-mono">{platformConfig[p].name}</span>
                        <span className="text-xs text-neon-cyan font-mono">{platforms[p].progress}%</span>
                      </div>
                      <div className="neon-progress h-1.5 w-full">
                        <div className="neon-progress-fill" style={{ width: `${platforms[p].progress}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </HUDPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {(Object.keys(platforms) as Platform[]).some(p => platforms[p].status === 'done' || platforms[p].status === 'error') && (
        <HUDPanel title="Upload Results">
          <div className="space-y-2">
            {(Object.keys(platforms) as Platform[])
              .filter(p => platforms[p].status === 'done' || platforms[p].status === 'error')
              .map(p => (
                <div key={p} className={`flex items-center justify-between p-3 hud-panel ${platforms[p].status === 'done' ? 'border-neon-green/20' : 'border-red-400/20'}`}>
                  <div className="flex items-center gap-2">
                    {platforms[p].status === 'done'
                      ? <CheckCircle className="w-4 h-4 text-neon-green" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />
                    }
                    <span className="text-xs font-mono text-neon-cyan/70">{platformConfig[p].name}</span>
                  </div>
                  {platforms[p].url ? (
                    <a href={platforms[p].url} target="_blank" rel="noopener noreferrer" className="glow-btn px-2 py-1 text-xs flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> VIEW
                    </a>
                  ) : (
                    <span className="text-xs text-red-400">{platforms[p].error}</span>
                  )}
                </div>
              ))}
          </div>
        </HUDPanel>
      )}

      {/* Publish Button */}
      <button
        onClick={publish}
        disabled={publishing || !video}
        className={`glow-btn glow-btn-solid w-full py-3.5 text-sm tracking-widest flex items-center justify-center gap-2 ${(!video || publishing) ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {publishing ? (
          <>
            <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            UPLOADING…
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            PUBLISH NOW
          </>
        )}
      </button>
    </div>
  )
}
