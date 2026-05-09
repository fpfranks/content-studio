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
import { getState, getLevel } from '@/lib/game'

interface VideoFile {
  file: File; url: string; name: string; size: string; duration?: number; resolution?: string
}

type Tab = 'upload' | 'script' | 'ai' | 'ideas' | 'publish' | 'hq'

const TABS: { id: Tab; label: string; short: string; rune: string }[] = [
  { id: 'upload',  label: 'The Forge',      short: 'Forge',   rune: '⚒' },
  { id: 'script',  label: 'The Scrolls',    short: 'Scrolls', rune: '📜' },
  { id: 'ai',      label: 'The Palantír',   short: 'Palantír',rune: '🔮' },
  { id: 'ideas',   label: 'The Map Room',   short: 'Maps',    rune: '🗺' },
  { id: 'publish', label: 'The Road',       short: 'Road',    rune: '🛤' },
  { id: 'hq',      label: 'The Great Hall', short: 'Hall',    rune: '🏰' },
]

const LORE_TICKER = [
  '"Not all those who wander are lost."',
  '✦',
  'Post three Shorts this week — the Fellowship grows stronger',
  '✦',
  'Hook in the first two seconds — like the eye of Sauron',
  '✦',
  '"Even the smallest person can change the course of the future."',
  '✦',
  'The algorithm favours the consistent creator',
  '✦',
  '"All we have to decide is what to do with the time that is given us."',
  '✦',
  'YouTube Shorts: your Shire. Long-form: Rivendell. Build the journey.',
  '✦',
]

export default function Home() {
  const [tab, setTab] = useState<Tab>('hq')
  const [video, setVideo] = useState<VideoFile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [renown, setRenown] = useState(0)
  const [rankTitle, setRankTitle] = useState('')

  useEffect(() => {
    const s = getState()
    setRenown(s.xp)
    setRankTitle(getLevel(s.xp).title)

    const onXP = (e: Event) => {
      const { levelUp, newLevel } = (e as CustomEvent).detail
      const s2 = getState()
      setRenown(s2.xp)
      setRankTitle(getLevel(s2.xp).title)
      if (levelUp) toast.success(`⬆ New rank: ${newLevel}`, { duration: 4000 })
    }
    window.addEventListener('xp-gained', onXP)
    return () => window.removeEventListener('xp-gained', onXP)
  }, [])

  const currentTab = TABS.find(t => t.id === tab)!

  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <AnimatedBackground />

      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#130e06',
          border: '1px solid rgba(201,162,39,0.3)',
          color: '#ede0b8',
          fontFamily: 'Lora, Georgia, serif',
          fontSize: '13px',
          maxWidth: '90vw',
        },
      }} />

      {/* ── Header ─────────────────────────────────── */}
      <header className="border-b sticky top-0 z-50 backdrop-blur-md"
        style={{ borderColor: 'rgba(201,162,39,0.15)', background: 'rgba(10,8,5,0.92)' }}>
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg" style={{ animation: 'candle-flicker 2.5s ease-in-out infinite' }}>🕯</span>
              <span className="title-glimmer font-heading font-bold tracking-wider text-sm" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, Cinzel, serif' }}>
                The Content Forge
              </span>
            </div>
            <span className="hidden sm:block text-xs font-heading" style={{ color: 'rgba(201,162,39,0.3)' }}>
              / {currentTab.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Renown badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 hud-panel">
              <span className="text-xs">⭐</span>
              <span className="text-xs font-heading neon-text">{renown.toLocaleString()} Renown</span>
            </div>
            {video && (
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 hud-panel">
                <span className="status-dot online" />
                <span className="text-xs font-body truncate max-w-[100px]" style={{ color: 'var(--parchment-mid)' }}>{video.name}</span>
              </div>
            )}
            <div className="hidden lg:block"><LiveClock /></div>

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden glow-btn p-2 text-sm">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Lore ticker */}
        <div className="hidden sm:flex border-t overflow-hidden h-6 items-center"
          style={{ borderColor: 'rgba(201,162,39,0.08)', background: 'rgba(201,162,39,0.02)' }}>
          <div className="ticker-track">
            {[...LORE_TICKER, ...LORE_TICKER].map((item, i) => (
              <span key={i} className={`text-xs px-4 font-body italic ${item === '✦' ? '' : ''}`}
                style={{ color: item === '✦' ? 'rgba(201,162,39,0.2)' : 'rgba(201,162,39,0.4)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t" style={{ borderColor: 'rgba(201,162,39,0.1)', background: 'rgba(10,8,5,0.97)' }}>
              <div className="p-3 grid grid-cols-3 gap-2">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false) }}
                    className={`hud-panel p-3 flex flex-col items-center gap-1 transition-all ${tab === t.id ? 'border-gold/40 bg-gold/8' : ''}`}
                    style={tab === t.id ? { borderColor: 'rgba(201,162,39,0.4)', background: 'rgba(201,162,39,0.08)' } : {}}>
                    <span className="text-xl">{t.rune}</span>
                    <span className="text-xs font-heading" style={{ color: tab === t.id ? 'var(--gold)' : 'rgba(201,162,39,0.4)' }}>{t.short}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Desktop Sidebar ─────────────────────── */}
        <nav className="hidden lg:flex w-56 shrink-0 flex-col sticky top-[69px] h-[calc(100vh-69px)]"
          style={{ borderRight: '1px solid rgba(201,162,39,0.12)', background: 'rgba(8,6,3,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'rgba(201,162,39,0.08)' }}>
            {video ? (
              <div className="hud-panel p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="status-dot online" />
                  <span className="text-xs font-heading" style={{ color: 'var(--parchment-dim)', letterSpacing: '0.08em' }}>SCROLL LOADED</span>
                </div>
                <p className="text-xs font-body truncate" style={{ color: 'var(--parchment-mid)' }}>{video.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--parchment-dark)' }}>{video.size} · {video.resolution}</p>
              </div>
            ) : (
              <div className="text-center py-3">
                <span className="text-3xl block mb-1" style={{ opacity: 0.2 }}>⚒</span>
                <p className="text-xs font-heading" style={{ color: 'rgba(201,162,39,0.2)' }}>No scroll loaded</p>
              </div>
            )}
          </div>

          <div className="flex flex-col py-2 flex-1">
            {TABS.map((t, i) => (
              <motion.button key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} onClick={() => setTab(t.id)}
                className={`nav-tab flex items-center gap-3 ${tab === t.id ? 'active' : ''}`}>
                <span className="text-base shrink-0">{t.rune}</span>
                <span>{t.label}</span>
                {t.id === 'hq' && <span className="ml-auto neon-tag text-xs">⭐</span>}
              </motion.button>
            ))}
          </div>

          <div className="p-3 border-t" style={{ borderColor: 'rgba(201,162,39,0.08)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">⭐</span>
              <span className="text-xs font-heading neon-text">{renown.toLocaleString()} Renown</span>
            </div>
            {rankTitle && <p className="text-xs font-body italic mb-2" style={{ color: 'var(--parchment-dark)' }}>{rankTitle}</p>}
            <LiveClock />
          </div>
        </nav>

        {/* ── Main ──────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }} className="max-w-2xl mx-auto">
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
        <aside className="hidden xl:flex w-52 shrink-0 flex-col p-4 gap-5 sticky top-[69px] h-[calc(100vh-69px)] overflow-y-auto"
          style={{ borderLeft: '1px solid rgba(201,162,39,0.1)', background: 'rgba(8,6,3,0.6)', backdropFilter: 'blur(6px)' }}>
          <div>
            <p className="text-xs font-heading mb-3" style={{ color: 'rgba(201,162,39,0.4)', letterSpacing: '0.1em' }}>THE FELLOWSHIP</p>
            {[{ l: 'Palantír (AI)', ok: true }, { l: 'Viral Oracle', ok: true }, { l: 'Daily Quests', ok: true }, { l: 'YouTube Forge', ok: false }, { l: 'TikTok Road', ok: false }].map(s => (
              <div key={s.l} className="flex items-center justify-between mb-2">
                <span className="text-xs font-body" style={{ color: 'var(--parchment-dark)' }}>{s.l}</span>
                <span className="text-xs font-heading" style={{ color: s.ok ? 'var(--shire)' : 'rgba(201,162,39,0.4)' }}>{s.ok ? 'Ready' : 'Manual'}</span>
              </div>
            ))}
          </div>

          <div className="neon-divider" />

          <div>
            <p className="text-xs font-heading mb-3" style={{ color: 'rgba(201,162,39,0.4)', letterSpacing: '0.1em' }}>WISDOM OF THE SHIRE</p>
            {['Hook in the first 2 seconds', 'Shorts under 58 seconds', 'End with "Subscribe"', 'Post 3–5 Shorts per week', 'Cross-post to TikTok', 'Long-form every 1–2 weeks'].map((tip, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <span className="text-xs shrink-0" style={{ color: 'rgba(201,162,39,0.25)' }}>✦</span>
                <p className="text-xs font-body leading-snug" style={{ color: 'var(--parchment-dark)' }}>{tip}</p>
              </div>
            ))}
          </div>

          <div className="neon-divider" />

          <div>
            <p className="text-xs font-heading mb-2" style={{ color: 'rgba(201,162,39,0.4)', letterSpacing: '0.1em' }}>RENOWN SOURCES</p>
            {[['Add idea', '+10'], ['Use Palantír', '+20'], ['Write scroll', '+30'], ['Test oracle', '+10'], ['Post a Short', '+75'], ['Post long-form', '+100']].map(([a, x]) => (
              <div key={a} className="flex justify-between mb-1.5">
                <span className="text-xs font-body" style={{ color: 'var(--parchment-dark)' }}>{a}</span>
                <span className="text-xs font-heading" style={{ color: 'var(--gold-dim)' }}>{x}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Mobile Bottom Bar ─────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md"
        style={{ borderColor: 'rgba(201,162,39,0.2)', background: 'rgba(8,6,3,0.95)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false) }}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-all"
              style={{ color: tab === t.id ? 'var(--gold)' : 'rgba(201,162,39,0.25)' }}>
              <span className={`text-lg transition-all ${tab === t.id ? 'scale-110' : ''}`}
                style={tab === t.id ? { filter: 'drop-shadow(0 0 6px rgba(201,162,39,0.8))' } : {}}>
                {t.rune}
              </span>
              <span className="text-[9px] font-heading">{t.short}</span>
              {tab === t.id && (
                <motion.div layoutId="lore-tab"
                  className="absolute bottom-0 w-6 h-0.5 rounded-t-full"
                  style={{ background: 'var(--gold)', boxShadow: '0 0 8px rgba(201,162,39,0.8)' }} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
