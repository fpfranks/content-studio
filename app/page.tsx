'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import AnimatedBackground from '@/components/AnimatedBackground'
import LiveClock from '@/components/LiveClock'
import VideoUploader from '@/components/VideoUploader'
import AIStudio from '@/components/AIStudio'
import PublishPanel from '@/components/PublishPanel'
import ScriptWriter from '@/components/ScriptWriter'
import IdeasBank from '@/components/IdeasBank'
import HQ from '@/components/HQ'
import { Upload, Sparkles, ClipboardList, Video, FileText, Lightbulb, Zap, Menu, X } from 'lucide-react'
import { getState, getLevel } from '@/lib/game'

interface VideoFile {
  file: File; url: string; name: string; size: string; duration?: number; resolution?: string
}

type Tab = 'upload' | 'script' | 'ai' | 'ideas' | 'publish' | 'hq'

const TABS: { id: Tab; label: string; short: string; icon: React.ReactNode }[] = [
  { id: 'upload',  label: 'Studio',    short: 'Studio',  icon: <Video className="w-5 h-5" /> },
  { id: 'script',  label: 'Script',    short: 'Script',  icon: <FileText className="w-5 h-5" /> },
  { id: 'ai',      label: 'AI Studio', short: 'AI',      icon: <Sparkles className="w-5 h-5" /> },
  { id: 'ideas',   label: 'Ideas',     short: 'Ideas',   icon: <Lightbulb className="w-5 h-5" /> },
  { id: 'publish', label: 'Publish',   short: 'Post',    icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'hq',      label: 'HQ',        short: 'HQ',      icon: <Zap className="w-5 h-5" /> },
]

// Data stream characters for desktop background
const STREAM_CHARS = '01アイウエオカキクケコXYZ#$%&<>{}[]'
function DataStreams() {
  const streams = Array.from({ length: 8 }, (_, i) => ({
    left: `${8 + i * 11}%`,
    duration: `${12 + i * 3}s`,
    delay: `${-i * 2}s`,
    chars: Array.from({ length: 20 }, () => STREAM_CHARS[Math.floor(Math.random() * STREAM_CHARS.length)]).join('\n'),
  }))
  return (
    <>
      {streams.map((s, i) => (
        <div key={i} className="data-stream" style={{ left: s.left, animationDuration: s.duration, animationDelay: s.delay }}>
          {s.chars}
        </div>
      ))}
    </>
  )
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('hq')
  const [video, setVideo] = useState<VideoFile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [xp, setXp] = useState(0)
  const [levelTitle, setLevelTitle] = useState('')

  useEffect(() => {
    const s = getState()
    setXp(s.xp)
    setLevelTitle(getLevel(s.xp).title)

    const onXP = (e: Event) => {
      const { amount, levelUp, newLevel } = (e as CustomEvent).detail
      const s2 = getState()
      setXp(s2.xp)
      setLevelTitle(getLevel(s2.xp).title)
      if (levelUp) {
        toast.success(`⬆ LEVEL UP — ${newLevel}!`, { duration: 4000 })
      }
    }
    window.addEventListener('xp-gained', onXP)
    return () => window.removeEventListener('xp-gained', onXP)
  }, [])

  const currentTab = TABS.find(t => t.id === tab)!

  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <AnimatedBackground />
      <DataStreams />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0a0a12',
            border: '1px solid rgba(0,255,200,0.25)',
            color: '#e0fff8',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            maxWidth: '90vw',
          },
        }}
      />

      {/* ── Top Bar ──────────────────────────────────── */}
      <header className="border-b border-neon-cyan/15 bg-dark-bg/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,255,200,0.9)]" style={{ animation: 'neon-flicker 3s infinite' }} />
              <span className="neon-text text-sm font-mono font-bold tracking-widest glitch">CONTENT STUDIO</span>
            </div>
            <span className="hidden sm:block text-neon-cyan/25 text-xs font-mono">/ {currentTab.label}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* XP badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 hud-panel">
              <Zap className="w-3 h-3 text-neon-cyan" />
              <span className="text-xs font-mono neon-text">{xp.toLocaleString()} XP</span>
              {levelTitle && <span className="text-xs text-neon-cyan/40">· {levelTitle}</span>}
            </div>
            {video && (
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 hud-panel">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_4px_rgba(0,255,136,0.8)]" />
                <span className="text-xs text-neon-cyan/60 font-mono truncate max-w-[100px]">{video.name}</span>
              </div>
            )}
            <div className="hidden lg:block"><LiveClock /></div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden glow-btn p-2">
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Ticker */}
        <div className="hidden sm:flex border-t border-neon-cyan/8 overflow-hidden h-5 items-center">
          <div className="ticker-track">
            {[
              '// CONTENT STUDIO ONLINE', '▮', 'CLAUDE AI ACTIVE', '▮',
              'VIRAL SCORER READY', '▮', 'MISSION SYSTEM LIVE', '▮',
              'SHORTS ENGINE LOADED', '▮', 'IDEAS BANK SYNCED', '▮',
              '// CONTENT STUDIO ONLINE', '▮', 'CLAUDE AI ACTIVE', '▮',
              'VIRAL SCORER READY', '▮', 'MISSION SYSTEM LIVE', '▮',
            ].map((item, i) => (
              <span key={i} className={`text-[10px] font-mono px-3 ${item === '▮' ? 'text-neon-cyan/15' : 'text-neon-cyan/35'}`}>{item}</span>
            ))}
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-neon-cyan/10 bg-dark-bg/95">
              <div className="p-3 grid grid-cols-3 gap-2">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false) }}
                    className={`hud-panel p-3 flex flex-col items-center gap-1 transition-all ${tab === t.id ? 'border-neon-cyan/40 bg-neon-cyan/8' : ''}`}>
                    <span className={tab === t.id ? 'text-neon-cyan' : 'text-neon-cyan/40'}>{t.icon}</span>
                    <span className={`text-xs font-mono ${tab === t.id ? 'text-neon-cyan' : 'text-neon-cyan/40'}`}>{t.short}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Desktop Sidebar ───────────────────────── */}
        <nav className="hidden lg:flex w-52 shrink-0 border-r border-neon-cyan/10 bg-dark-bg/70 backdrop-blur-sm flex-col sticky top-[69px] h-[calc(100vh-69px)]">
          <div className="p-3 border-b border-neon-cyan/8">
            {video ? (
              <div className="hud-panel p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_4px_rgba(0,255,136,0.8)]" />
                  <span className="text-xs text-neon-cyan/50 tracking-widest">VIDEO LOADED</span>
                </div>
                <p className="text-xs text-neon-cyan/80 truncate">{video.name}</p>
                <p className="text-xs text-neon-cyan/35 mt-0.5">{video.size} · {video.resolution}</p>
              </div>
            ) : (
              <div className="text-center py-2">
                <Video className="w-5 h-5 text-neon-cyan/15 mx-auto mb-1" />
                <p className="text-xs text-neon-cyan/20">No video loaded</p>
              </div>
            )}
          </div>

          <div className="flex flex-col py-2 flex-1">
            {TABS.map((t, i) => (
              <motion.button key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setTab(t.id)}
                className={`nav-tab flex items-center gap-3 ${tab === t.id ? 'active' : ''}`}>
                <span className="shrink-0">{t.icon}</span>
                <span>{t.label}</span>
                {t.id === 'hq' && <span className="ml-auto text-[10px] neon-tag">XP</span>}
              </motion.button>
            ))}
          </div>

          {/* XP sidebar widget */}
          <div className="p-3 border-t border-neon-cyan/8">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-neon-cyan/60" />
              <span className="text-xs text-neon-cyan/40 font-mono">{xp.toLocaleString()} XP</span>
            </div>
            {levelTitle && <p className="text-xs text-neon-cyan/25 font-mono">{levelTitle}</p>}
            <LiveClock />
          </div>
        </nav>

        {/* ── Main Content ──────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto">
              {tab === 'upload'  && <VideoUploader video={video} onVideoReady={v => setVideo(v)} />}
              {tab === 'script'  && <ScriptWriter />}
              {tab === 'ai'      && <AIStudio videoName={video?.name} />}
              {tab === 'ideas'   && <IdeasBank />}
              {tab === 'publish' && <PublishPanel video={video} />}
              {tab === 'hq'      && <HQ />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Desktop Right Panel ───────────────────── */}
        <aside className="hidden xl:flex w-48 shrink-0 border-l border-neon-cyan/10 bg-dark-bg/60 backdrop-blur-sm p-4 flex-col gap-4 sticky top-[69px] h-[calc(100vh-69px)] overflow-y-auto">
          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-3 uppercase">System</div>
            {[{ l: 'Claude AI', ok: true }, { l: 'Viral Scorer', ok: true }, { l: 'Missions', ok: true }, { l: 'YouTube API', ok: false }, { l: 'TikTok API', ok: false }].map(s => (
              <div key={s.l} className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neon-cyan/40 font-mono">{s.l}</span>
                <span className={`text-xs font-mono ${s.ok ? 'text-neon-green' : 'text-yellow-400/70'}`}>{s.ok ? 'LIVE' : 'MANUAL'}</span>
              </div>
            ))}
          </div>

          <div className="neon-divider" />

          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-3 uppercase">Shorts Tips</div>
            {['Hook in first 2 seconds', 'Keep under 58 seconds', 'Loop the ending', 'CTA: "Subscribe for more"', 'Post 3–5x per week', 'Cross-post to TikTok'].map((tip, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <span className="text-neon-cyan/20 text-xs shrink-0">▸</span>
                <p className="text-xs text-neon-cyan/35 leading-snug">{tip}</p>
              </div>
            ))}
          </div>

          <div className="neon-divider" />

          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-2 uppercase">XP Sources</div>
            {[['Add idea', '+10'], ['Generate AI', '+20'], ['Write script', '+30'], ['Test hook', '+10'], ['Post Short', '+75'], ['Post Long', '+100']].map(([a, x]) => (
              <div key={a} className="flex justify-between mb-1">
                <span className="text-xs text-neon-cyan/30">{a}</span>
                <span className="text-xs text-neon-cyan/50 font-mono">{x}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Mobile Bottom Tab Bar ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-neon-cyan/15 bg-dark-bg/95 backdrop-blur-md pb-safe">
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false) }}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all relative ${tab === t.id ? 'text-neon-cyan' : 'text-neon-cyan/25'}`}>
              <span className={`transition-all ${tab === t.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,255,200,0.9)]' : ''}`}>{t.icon}</span>
              <span className="text-[10px] font-mono">{t.short}</span>
              {tab === t.id && (
                <motion.div layoutId="tab-bar" className="absolute bottom-0 w-6 h-0.5 bg-neon-cyan rounded-t-full shadow-[0_0_8px_rgba(0,255,200,0.9)]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
