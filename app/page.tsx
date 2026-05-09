'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import AnimatedBackground from '@/components/AnimatedBackground'
import LiveClock from '@/components/LiveClock'
import HUDPanel from '@/components/HUDPanel'
import VideoUploader from '@/components/VideoUploader'
import AIStudio from '@/components/AIStudio'
import PublishPanel from '@/components/PublishPanel'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import ScriptWriter from '@/components/ScriptWriter'
import IdeasBank from '@/components/IdeasBank'
import { Upload, Sparkles, ClipboardList, BarChart2, Video, FileText, Lightbulb, Menu, X } from 'lucide-react'

interface VideoFile {
  file: File; url: string; name: string; size: string; duration?: number; resolution?: string
}

type Tab = 'upload' | 'script' | 'ai' | 'ideas' | 'publish' | 'analytics'

const TABS: { id: Tab; label: string; short: string; icon: React.ReactNode }[] = [
  { id: 'upload',    label: 'Studio',    short: 'Studio',    icon: <Video className="w-5 h-5" /> },
  { id: 'script',   label: 'Script',    short: 'Script',    icon: <FileText className="w-5 h-5" /> },
  { id: 'ai',       label: 'AI Studio', short: 'AI',        icon: <Sparkles className="w-5 h-5" /> },
  { id: 'ideas',    label: 'Ideas',     short: 'Ideas',     icon: <Lightbulb className="w-5 h-5" /> },
  { id: 'publish',  label: 'Publish',   short: 'Post',      icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'analytics',label: 'Analytics', short: 'Stats',     icon: <BarChart2 className="w-5 h-5" /> },
]

export default function Home() {
  const [tab, setTab] = useState<Tab>('upload')
  const [video, setVideo] = useState<VideoFile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const currentTab = TABS.find(t => t.id === tab)!

  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <AnimatedBackground />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0a0a12',
            border: '1px solid rgba(0,255,200,0.2)',
            color: '#e0fff8',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            maxWidth: '90vw',
          },
        }}
      />

      {/* ── Top Bar ──────────────────────────────────── */}
      <header className="border-b border-neon-cyan/10 bg-dark-bg/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow shadow-[0_0_8px_rgba(0,255,200,0.8)]" />
              <span className="neon-text text-sm font-mono font-bold tracking-widest">CONTENT STUDIO</span>
            </div>
            <span className="hidden sm:block text-neon-cyan/30 text-xs font-mono">/ {currentTab.label}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Video indicator */}
            {video && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 hud-panel">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_4px_rgba(0,255,136,0.8)]" />
                <span className="text-xs text-neon-cyan/60 font-mono truncate max-w-[120px]">{video.name}</span>
              </div>
            )}
            <div className="hidden lg:block"><LiveClock /></div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden glow-btn p-2"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrolling ticker — hidden on small screens */}
        <div className="hidden sm:flex border-t border-neon-cyan/5 bg-neon-cyan/2 overflow-hidden h-6 items-center">
          <div className="ticker-track">
            {[
              'CONTENT STUDIO ONLINE', '█', 'CLAUDE AI READY', '█',
              'SCRIPT WRITER LOADED', '█', 'IDEAS BANK ACTIVE', '█',
              'PUBLISH CHECKLIST READY', '█', 'ANALYTICS LIVE', '█',
              'CONTENT STUDIO ONLINE', '█', 'CLAUDE AI READY', '█',
              'SCRIPT WRITER LOADED', '█', 'IDEAS BANK ACTIVE', '█',
            ].map((item, i) => (
              <span key={i} className={`text-xs font-mono px-3 ${item === '█' ? 'text-neon-cyan/20' : 'text-neon-cyan/40'}`}>{item}</span>
            ))}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-neon-cyan/10 bg-dark-bg/95"
            >
              <div className="p-3 grid grid-cols-3 gap-2">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setMenuOpen(false) }}
                    className={`hud-panel p-3 flex flex-col items-center gap-1 transition-all ${tab === t.id ? 'border-neon-cyan/40 bg-neon-cyan/8' : ''}`}
                  >
                    <span className={`${tab === t.id ? 'text-neon-cyan' : 'text-neon-cyan/40'}`}>{t.icon}</span>
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
        <nav className="hidden lg:flex w-52 shrink-0 border-r border-neon-cyan/10 bg-dark-bg/60 backdrop-blur-sm flex-col sticky top-[73px] h-[calc(100vh-73px)]">
          {/* Video status */}
          <div className="p-3 border-b border-neon-cyan/8">
            {video ? (
              <div className="hud-panel p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_4px_rgba(0,255,136,0.8)]" />
                  <span className="text-xs text-neon-cyan/50 tracking-widest">LOADED</span>
                </div>
                <p className="text-xs text-neon-cyan/80 truncate">{video.name}</p>
                <p className="text-xs text-neon-cyan/40 mt-0.5">{video.size} · {video.resolution}</p>
              </div>
            ) : (
              <div className="text-center py-2">
                <Video className="w-5 h-5 text-neon-cyan/20 mx-auto mb-1" />
                <p className="text-xs text-neon-cyan/25">No video loaded</p>
              </div>
            )}
          </div>

          <div className="flex flex-col py-2 flex-1">
            {TABS.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setTab(t.id)}
                className={`nav-tab flex items-center gap-3 ${tab === t.id ? 'active' : ''}`}
              >
                <span className="shrink-0">{t.icon}</span>
                <span>{t.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="p-3 border-t border-neon-cyan/8">
            <LiveClock />
          </div>
        </nav>

        {/* ── Main Content ──────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              {tab === 'upload'    && <VideoUploader video={video} onVideoReady={v => setVideo(v)} />}
              {tab === 'script'   && <ScriptWriter />}
              {tab === 'ai'       && <AIStudio videoName={video?.name} />}
              {tab === 'ideas'    && <IdeasBank />}
              {tab === 'publish'  && <PublishPanel video={video} />}
              {tab === 'analytics'&& <AnalyticsDashboard />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Desktop Right Panel ───────────────────── */}
        <aside className="hidden xl:flex w-48 shrink-0 border-l border-neon-cyan/10 bg-dark-bg/60 backdrop-blur-sm p-4 flex-col gap-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-3 uppercase">Status</div>
            <div className="space-y-2">
              {[
                { label: 'Claude AI', ok: true },
                { label: 'YouTube', ok: false },
                { label: 'TikTok', ok: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-neon-cyan/50 font-mono">{item.label}</span>
                  <span className={`text-xs font-mono ${item.ok ? 'text-neon-green' : 'text-yellow-400'}`}>
                    {item.ok ? 'LIVE' : 'MANUAL'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="neon-divider" />

          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-3 uppercase">Tips</div>
            <div className="space-y-2">
              {[
                'Script first, film second',
                'Hook = first 3 seconds',
                'Post YouTube Thu–Sat 18:00',
                'TikTok: 7–9am or 5–7pm',
                '9:16 crop for Shorts & TikTok',
              ].map((tip, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-neon-cyan/25 text-xs shrink-0">▸</span>
                  <p className="text-xs text-neon-cyan/40 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="neon-divider" />

          {/* Posting streak */}
          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-2 uppercase">Streak</div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{
                    background: [0, 3, 6, 8, 13, 20, 21, 27].includes(i)
                      ? 'rgba(0,255,200,0.5)'
                      : 'rgba(0,255,200,0.06)'
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-neon-cyan/25 mt-1.5 font-mono">4 day streak</p>
          </div>
        </aside>
      </div>

      {/* ── Mobile Bottom Tab Bar ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-neon-cyan/15 bg-dark-bg/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setMenuOpen(false) }}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${
                tab === t.id ? 'text-neon-cyan' : 'text-neon-cyan/30'
              }`}
            >
              <span className={`transition-all ${tab === t.id ? 'scale-110 drop-shadow-[0_0_6px_rgba(0,255,200,0.8)]' : ''}`}>
                {t.icon}
              </span>
              <span className="text-[10px] font-mono tracking-wide">{t.short}</span>
              {tab === t.id && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 w-8 h-0.5 bg-neon-cyan rounded-t-full shadow-[0_0_8px_rgba(0,255,200,0.8)]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
