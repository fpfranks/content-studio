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
import { Upload, Sparkles, Share2, BarChart2, Video, Zap } from 'lucide-react'

interface VideoFile {
  file: File
  url: string
  name: string
  size: string
  duration?: number
  resolution?: string
}

type Tab = 'upload' | 'ai' | 'publish' | 'analytics'

const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'upload', label: 'Video Studio', icon: <Upload className="w-4 h-4" />, desc: 'Import & edit' },
  { id: 'ai', label: 'AI Studio', icon: <Sparkles className="w-4 h-4" />, desc: 'Titles, captions, hooks' },
  { id: 'publish', label: 'Publish', icon: <Share2 className="w-4 h-4" />, desc: 'YouTube & TikTok' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" />, desc: 'Performance' },
]

const statusItems = [
  { label: 'API', status: 'online' },
  { label: 'YT', status: 'pending' },
  { label: 'TT', status: 'offline' },
]

export default function Home() {
  const [tab, setTab] = useState<Tab>('upload')
  const [video, setVideo] = useState<VideoFile | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a0a12',
            border: '1px solid rgba(0,255,200,0.2)',
            color: '#e0fff8',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
          },
        }}
      />

      {/* ── Top Status Bar ─────────────────────────── */}
      <header className="border-b border-neon-cyan/10 bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow shadow-[0_0_8px_rgba(0,255,200,0.8)]" />
              <span className="neon-text text-sm font-mono font-bold tracking-widest">CONTENT STUDIO</span>
              <span className="neon-tag">SYS-01</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-neon-cyan/30 text-xs font-mono">
              <span>/</span>
              <span className="text-neon-cyan/60">{tabs.find(t => t.id === tab)?.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4">
              {statusItems.map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={`status-dot ${s.status}`} />
                  <span className="text-xs text-neon-cyan/40 font-mono">{s.label}</span>
                </div>
              ))}
            </div>
            <LiveClock />
          </div>
        </div>

        {/* Ticker */}
        <div className="border-t border-neon-cyan/5 bg-neon-cyan/2 overflow-hidden h-6 flex items-center">
          <div className="ticker-track">
            {[
              'SYS ONLINE', '█', 'CLAUDE AI CONNECTED', '█',
              'YOUTUBE API READY', '█', 'TIKTOK AUTH PENDING', '█',
              'VIDEO PROCESSING ENGINE LOADED', '█', 'CONTENT STUDIO v1.0', '█',
              'SYS ONLINE', '█', 'CLAUDE AI CONNECTED', '█',
              'YOUTUBE API READY', '█', 'TIKTOK AUTH PENDING', '█',
              'VIDEO PROCESSING ENGINE LOADED', '█', 'CONTENT STUDIO v1.0', '█',
            ].map((item, i) => (
              <span key={i} className={`text-xs font-mono px-3 ${item === '█' ? 'text-neon-cyan/20' : 'text-neon-cyan/40'}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar Nav ────────────────────────────── */}
        <nav className="w-52 shrink-0 border-r border-neon-cyan/10 bg-dark-bg/60 backdrop-blur-sm flex flex-col sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="p-4 border-b border-neon-cyan/8">
            {video ? (
              <div className="hud-panel p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-3.5 h-3.5 text-neon-cyan/60" />
                  <span className="text-xs text-neon-cyan/50 tracking-widest">LOADED</span>
                </div>
                <p className="text-xs text-neon-cyan/80 truncate">{video.name}</p>
                <p className="text-xs text-neon-cyan/40 mt-0.5">{video.size} · {video.resolution}</p>
              </div>
            ) : (
              <div className="text-center p-3">
                <div className="w-8 h-8 border border-neon-cyan/20 rounded-sm mx-auto mb-2 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-neon-cyan/40" />
                </div>
                <p className="text-xs text-neon-cyan/30">No video loaded</p>
              </div>
            )}
          </div>

          <div className="flex flex-col py-2 flex-1">
            {tabs.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setTab(t.id)}
                className={`nav-tab flex items-center gap-3 ${tab === t.id ? 'active' : ''}`}
              >
                <span className="shrink-0">{t.icon}</span>
                <div className="text-left">
                  <div>{t.label}</div>
                  <div className="text-neon-cyan/25 text-xs normal-case tracking-normal font-mono font-normal">{t.desc}</div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="p-4 border-t border-neon-cyan/8">
            <div className="text-center">
              <div className="text-xs text-neon-cyan/25 font-mono">CONTENT STUDIO</div>
              <div className="text-xs text-neon-cyan/15 font-mono">v1.0.0</div>
            </div>
          </div>
        </nav>

        {/* ── Main Content ────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto"
            >
              {tab === 'upload' && (
                <VideoUploader video={video} onVideoReady={(v) => setVideo(v)} />
              )}
              {tab === 'ai' && (
                <AIStudio videoName={video?.name} />
              )}
              {tab === 'publish' && (
                <PublishPanel video={video} />
              )}
              {tab === 'analytics' && (
                <AnalyticsDashboard />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Right System Panel ──────────────────────── */}
        <aside className="w-52 shrink-0 border-l border-neon-cyan/10 bg-dark-bg/60 backdrop-blur-sm p-4 hidden xl:flex flex-col gap-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-3 uppercase font-mono">System Status</div>
            <div className="space-y-2">
              {[
                { label: 'Claude AI', status: 'ONLINE', color: 'text-neon-green' },
                { label: 'YouTube', status: 'SETUP REQ', color: 'text-yellow-400' },
                { label: 'TikTok', status: 'SETUP REQ', color: 'text-yellow-400' },
                { label: 'Video Engine', status: 'ONLINE', color: 'text-neon-green' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-neon-cyan/50 font-mono">{item.label}</span>
                  <span className={`text-xs font-mono ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="neon-divider" />

          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-3 uppercase font-mono">Quick Tips</div>
            <div className="space-y-2">
              {[
                'Use AI Studio to generate all content before publishing',
                'Crop to 9:16 for TikTok & Shorts',
                'Post YouTube long-form Thu–Sat 18:00',
                'First 3 seconds = retention',
              ].map((tip, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-neon-cyan/30 text-xs shrink-0 mt-0.5">▸</span>
                  <p className="text-xs text-neon-cyan/40 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="neon-divider" />

          <div>
            <div className="text-xs text-neon-cyan/40 tracking-widest mb-3 uppercase font-mono">Streak</div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 28 }).map((_, i) => {
                const intensity = Math.random()
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-sm"
                    style={{
                      background: i % 7 === 0 || i % 11 === 0
                        ? `rgba(0, 255, 200, ${0.3 + intensity * 0.5})`
                        : 'rgba(0, 255, 200, 0.05)'
                    }}
                  />
                )
              })}
            </div>
            <p className="text-xs text-neon-cyan/30 mt-2 font-mono">4 day posting streak</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
