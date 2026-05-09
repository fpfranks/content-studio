'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ExternalLink, TrendingUp, Edit3, Check, X, BarChart2 } from 'lucide-react'
import HUDPanel from './HUDPanel'
import toast from 'react-hot-toast'
import { format, parseISO, differenceInDays, subDays } from 'date-fns'

interface VideoStat {
  id: string
  title: string
  platform: 'youtube' | 'tiktok' | 'shorts'
  postedAt: string
  views: number
  likes: number
  comments: number
  watchTime: string
  ctr?: number
  notes: string
}

function uid() { return Math.random().toString(36).slice(2) }

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 1000
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(value * e))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <span>{display.toLocaleString()}{suffix}</span>
}

const PLATFORM_CFG = {
  youtube: { label: 'YouTube', icon: '▶', color: 'text-red-400', border: 'border-red-400/20', bg: 'bg-red-400/5', url: 'https://studio.youtube.com/channel/analytics' },
  tiktok:  { label: 'TikTok',  icon: '♪', color: 'text-neon-pink', border: 'border-neon-pink/20', bg: 'bg-neon-pink/5', url: 'https://www.tiktok.com/tiktokstudio/analytics' },
  shorts:  { label: 'Shorts',  icon: '⚡', color: 'text-yellow-400', border: 'border-yellow-400/20', bg: 'bg-yellow-400/5', url: 'https://studio.youtube.com/channel/analytics' },
}

const EMPTY: Omit<VideoStat, 'id'> = {
  title: '', platform: 'youtube', postedAt: format(new Date(), 'yyyy-MM-dd'),
  views: 0, likes: 0, comments: 0, watchTime: '', ctr: undefined, notes: '',
}

export default function AnalyticsDashboard() {
  const [videos, setVideos] = useState<VideoStat[]>([])
  const [view, setView] = useState<'overview' | 'videos' | 'add' | 'edit'>('overview')
  const [form, setForm] = useState<Omit<VideoStat, 'id'>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('analytics-videos')
    if (saved) setVideos(JSON.parse(saved))
  }, [])

  function persist(updated: VideoStat[]) {
    setVideos(updated)
    localStorage.setItem('analytics-videos', JSON.stringify(updated))
  }

  function saveVideo() {
    if (!form.title.trim()) { toast.error('Add a title'); return }
    if (editingId) {
      persist(videos.map(v => v.id === editingId ? { ...form, id: editingId } : v))
      toast.success('Updated')
    } else {
      persist([{ ...form, id: uid() }, ...videos])
      toast.success('Video logged')
    }
    setForm(EMPTY); setEditingId(null); setView('videos')
  }

  function startEdit(v: VideoStat) {
    setForm({ title: v.title, platform: v.platform, postedAt: v.postedAt, views: v.views, likes: v.likes, comments: v.comments, watchTime: v.watchTime, ctr: v.ctr, notes: v.notes })
    setEditingId(v.id); setView('add')
  }

  function deleteVideo(id: string) {
    persist(videos.filter(v => v.id !== id))
    toast.success('Deleted')
  }

  // Computed overview stats
  const totalViews = videos.reduce((s, v) => s + v.views, 0)
  const totalLikes = videos.reduce((s, v) => s + v.likes, 0)
  const totalComments = videos.reduce((s, v) => s + v.comments, 0)
  const avgViews = videos.length ? Math.round(totalViews / videos.length) : 0
  const topVideo = videos.length ? [...videos].sort((a, b) => b.views - a.views)[0] : null
  const sorted = [...videos].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
  const ytVideos = videos.filter(v => v.platform === 'youtube' || v.platform === 'shorts')
  const ttVideos = videos.filter(v => v.platform === 'tiktok')

  // Posting streak — consecutive days with at least one post
  function calcStreak() {
    if (!videos.length) return 0
    const dates = new Set(videos.map(v => v.postedAt))
    let streak = 0; let d = new Date()
    while (true) {
      const key = format(d, 'yyyy-MM-dd')
      if (dates.has(key)) { streak++; d = subDays(d, 1) }
      else if (streak === 0) { d = subDays(d, 1); if (differenceInDays(new Date(), d) > 7) break }
      else break
    }
    return streak
  }
  const streak = calcStreak()

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i)
    const key = format(day, 'yyyy-MM-dd')
    const dayViews = videos.filter(v => v.postedAt === key).reduce((s, v) => s + v.views, 0)
    return { day: format(day, 'EEE'), views: dayViews, posted: videos.some(v => v.postedAt === key) }
  })
  const maxViews = Math.max(...last7.map(d => d.views), 1)

  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex gap-2">
        {(['overview', 'videos'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 text-xs font-mono tracking-widest uppercase glow-btn ${view === v ? 'glow-btn-solid' : ''}`}>
            {v}
          </button>
        ))}
        <button onClick={() => { setForm(EMPTY); setEditingId(null); setView('add') }}
          className="glow-btn glow-btn-purple px-4 py-2 text-xs flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> LOG VIDEO
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW ─────────────────────────────── */}
        {view === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {videos.length === 0 ? (
              <HUDPanel>
                <div className="text-center py-8 space-y-3">
                  <BarChart2 className="w-10 h-10 text-neon-cyan/20 mx-auto" />
                  <p className="text-neon-cyan/40 text-sm">No videos logged yet</p>
                  <p className="text-neon-cyan/25 text-xs">Hit LOG VIDEO to start tracking your real stats</p>
                  <button onClick={() => { setForm(EMPTY); setView('add') }} className="glow-btn glow-btn-solid px-6 py-2 text-xs mx-auto block">
                    + LOG YOUR FIRST VIDEO
                  </button>
                </div>
              </HUDPanel>
            ) : (
              <>
                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'TOTAL VIEWS', value: totalViews },
                    { label: 'TOTAL LIKES', value: totalLikes },
                    { label: 'VIDEOS POSTED', value: videos.length },
                    { label: 'AVG VIEWS', value: avgViews },
                  ].map(s => (
                    <div key={s.label} className="hud-panel p-4 text-center">
                      <div className="text-xs text-neon-cyan/40 mb-1 tracking-widest">{s.label}</div>
                      <div className="text-2xl font-mono neon-text"><AnimatedNumber value={s.value} /></div>
                    </div>
                  ))}
                </div>

                {/* Streak */}
                <HUDPanel>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-neon-cyan/40 tracking-widest mb-1">POSTING STREAK</div>
                      <div className="text-3xl font-mono neon-text">{streak} <span className="text-sm text-neon-cyan/50">days</span></div>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {last7.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div className={`w-5 h-5 rounded-sm ${d.posted ? 'bg-neon-cyan/70 shadow-[0_0_6px_rgba(0,255,200,0.5)]' : 'bg-neon-cyan/8'}`} />
                          <span className="text-[9px] text-neon-cyan/25">{d.day.slice(0, 1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </HUDPanel>

                {/* 7-day chart */}
                <HUDPanel title="Views by Post Date" tag="7 DAYS">
                  <div className="flex items-end gap-1 h-20">
                    {last7.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: '64px' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: d.views > 0 ? `${Math.max((d.views / maxViews) * 100, 8)}%` : '4px' }}
                            transition={{ delay: i * 0.06, duration: 0.4 }}
                            className={`w-full rounded-t-sm ${d.views > 0 ? 'bg-gradient-to-t from-neon-cyan/70 to-neon-cyan/30' : 'bg-neon-cyan/8'}`}
                          />
                        </div>
                        <span className="text-[9px] text-neon-cyan/30">{d.day.slice(0,1)}</span>
                      </div>
                    ))}
                  </div>
                  {last7.every(d => d.views === 0) && (
                    <p className="text-xs text-neon-cyan/25 text-center mt-2">Post dates with views will appear here</p>
                  )}
                </HUDPanel>

                {/* Top video */}
                {topVideo && (
                  <HUDPanel title="Best Performing Video" tag="ALL TIME">
                    <div className={`p-3 rounded-sm ${PLATFORM_CFG[topVideo.platform].bg} border ${PLATFORM_CFG[topVideo.platform].border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={PLATFORM_CFG[topVideo.platform].color}>{PLATFORM_CFG[topVideo.platform].icon}</span>
                        <span className="text-xs text-neon-cyan/50">{PLATFORM_CFG[topVideo.platform].label}</span>
                        <span className="text-xs text-neon-cyan/30 ml-auto">{topVideo.postedAt}</span>
                      </div>
                      <p className="text-sm text-neon-cyan/90 mb-3">{topVideo.title}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { l: 'VIEWS', v: topVideo.views.toLocaleString() },
                          { l: 'LIKES', v: topVideo.likes.toLocaleString() },
                          { l: 'COMMENTS', v: topVideo.comments.toLocaleString() },
                        ].map(s => (
                          <div key={s.l}>
                            <div className="text-xs text-neon-cyan/40">{s.l}</div>
                            <div className="text-sm font-mono neon-text">{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </HUDPanel>
                )}

                {/* Platform split */}
                <HUDPanel title="Platform Split">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="hud-panel p-3 text-center border-red-400/20">
                      <div className="text-red-400 text-lg mb-1">▶</div>
                      <div className="text-xs text-neon-cyan/40 mb-1">YouTube</div>
                      <div className="text-xl font-mono neon-text">{ytVideos.length}</div>
                      <div className="text-xs text-neon-cyan/40">{ytVideos.reduce((s, v) => s + v.views, 0).toLocaleString()} views</div>
                    </div>
                    <div className="hud-panel p-3 text-center border-neon-pink/20">
                      <div className="text-neon-pink text-lg mb-1">♪</div>
                      <div className="text-xs text-neon-cyan/40 mb-1">TikTok</div>
                      <div className="text-xl font-mono neon-text-pink">{ttVideos.length}</div>
                      <div className="text-xs text-neon-cyan/40">{ttVideos.reduce((s, v) => s + v.views, 0).toLocaleString()} views</div>
                    </div>
                  </div>
                </HUDPanel>

                {/* Real analytics links */}
                <HUDPanel title="Open Real Analytics">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'YouTube Studio Analytics', url: 'https://studio.youtube.com/channel/analytics', icon: '▶', desc: 'Views, watch time, subscribers' },
                      { label: 'TikTok Creator Analytics', url: 'https://www.tiktok.com/tiktokstudio/analytics', icon: '♪', desc: 'Views, followers, engagement' },
                    ].map(link => (
                      <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="hud-panel p-3 flex items-center gap-3 hover:border-neon-cyan/30 transition-all group">
                        <span className="text-xl">{link.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs text-neon-cyan/70 group-hover:text-neon-cyan transition-colors">{link.label}</p>
                          <p className="text-xs text-neon-cyan/30">{link.desc}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-neon-cyan/20 group-hover:text-neon-cyan/60" />
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-neon-cyan/25 mt-3 text-center">Check your real numbers there, then log them here</p>
                </HUDPanel>
              </>
            )}
          </motion.div>
        )}

        {/* ── VIDEOS LIST ───────────────────────────── */}
        {view === 'videos' && (
          <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {sorted.length === 0 ? (
              <HUDPanel>
                <div className="text-center py-8 space-y-2">
                  <p className="text-neon-cyan/40 text-sm">No videos logged yet</p>
                  <button onClick={() => { setForm(EMPTY); setView('add') }} className="glow-btn glow-btn-solid px-6 py-2 text-xs mx-auto block">
                    + LOG YOUR FIRST VIDEO
                  </button>
                </div>
              </HUDPanel>
            ) : sorted.map(v => {
              const cfg = PLATFORM_CFG[v.platform]
              const engagementRate = v.views > 0 ? ((v.likes + v.comments) / v.views * 100).toFixed(1) : '0'
              return (
                <div key={v.id} className={`hud-panel p-4 border ${cfg.border}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={cfg.color}>{cfg.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-neon-cyan/90 leading-tight">{v.title}</p>
                        <p className="text-xs text-neon-cyan/35 mt-0.5">{v.postedAt}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEdit(v)} className="glow-btn p-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteVideo(v.id)} className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { l: 'VIEWS', v: v.views.toLocaleString() },
                      { l: 'LIKES', v: v.likes.toLocaleString() },
                      { l: 'COMMENTS', v: v.comments.toLocaleString() },
                      { l: 'ENG %', v: `${engagementRate}%` },
                    ].map(s => (
                      <div key={s.l} className="hud-panel py-2">
                        <div className="text-[10px] text-neon-cyan/35">{s.l}</div>
                        <div className={`text-sm font-mono ${cfg.color}`}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {v.watchTime && <p className="text-xs text-neon-cyan/35 mt-2">⏱ Avg watch time: {v.watchTime}</p>}
                  {v.notes && <p className="text-xs text-neon-cyan/40 mt-1 italic">{v.notes}</p>}
                </div>
              )
            })}
          </motion.div>
        )}

        {/* ── ADD / EDIT FORM ───────────────────────── */}
        {view === 'add' && (
          <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HUDPanel title={editingId ? 'Edit Video Stats' : 'Log Video'} tag={editingId ? 'EDITING' : 'NEW'}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Video Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Paste your video title…" className="neon-input w-full p-2.5 text-sm rounded-sm" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Platform</label>
                    <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as any }))}
                      className="neon-select w-full p-2.5 text-sm rounded-sm">
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="shorts">Shorts</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Post Date</label>
                    <input type="date" value={form.postedAt} onChange={e => setForm(f => ({ ...f, postedAt: e.target.value }))}
                      className="neon-input w-full p-2.5 text-sm rounded-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Views', key: 'views' },
                    { label: 'Likes', key: 'likes' },
                    { label: 'Comments', key: 'comments' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">{label}</label>
                      <input type="number" min={0} value={(form as any)[key] || ''}
                        onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))}
                        placeholder="0" className="neon-input w-full p-2.5 text-sm rounded-sm" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Avg Watch Time</label>
                    <input value={form.watchTime} onChange={e => setForm(f => ({ ...f, watchTime: e.target.value }))}
                      placeholder="e.g. 4:22 or 14s" className="neon-input w-full p-2.5 text-sm rounded-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">CTR % (YouTube)</label>
                    <input type="number" step="0.1" min={0} max={100} value={form.ctr ?? ''}
                      onChange={e => setForm(f => ({ ...f, ctr: parseFloat(e.target.value) || undefined }))}
                      placeholder="e.g. 6.5" className="neon-input w-full p-2.5 text-sm rounded-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="What worked, what didn't, ideas to try next time…"
                    rows={2} className="neon-input w-full p-2.5 text-sm rounded-sm resize-none" />
                </div>

                <div className="flex gap-2">
                  <button onClick={saveVideo} className="glow-btn glow-btn-solid flex-1 py-2.5 text-xs tracking-widest flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> {editingId ? 'SAVE CHANGES' : 'LOG VIDEO'}
                  </button>
                  <button onClick={() => { setView('videos'); setForm(EMPTY); setEditingId(null) }}
                    className="glow-btn px-4 py-2.5 text-xs flex items-center gap-1">
                    <X className="w-4 h-4" /> CANCEL
                  </button>
                </div>

                {/* Reminder to get stats from real analytics */}
                <div className="neon-divider" />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'YouTube Studio', url: 'https://studio.youtube.com/channel/analytics' },
                    { label: 'TikTok Analytics', url: 'https://www.tiktok.com/tiktokstudio/analytics' },
                  ].map(l => (
                    <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="hud-panel p-2 flex items-center justify-center gap-1 hover:border-neon-cyan/30 transition-all group">
                      <ExternalLink className="w-3 h-3 text-neon-cyan/30 group-hover:text-neon-cyan/60" />
                      <span className="text-xs text-neon-cyan/40 group-hover:text-neon-cyan/70">{l.label}</span>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-neon-cyan/25 text-center">Get your real numbers from the links above</p>
              </div>
            </HUDPanel>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
