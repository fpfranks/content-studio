'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import HUDPanel from './HUDPanel'

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = 0
    const end = value
    const duration = 1500
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return <span>{display.toLocaleString()}{suffix}</span>
}

const mockStats = {
  youtube: {
    views: 14280,
    subscribers: 342,
    watchTime: '1,842 hrs',
    avgViewDuration: '4:22',
    topVideo: 'Day in my life as a UK AI entrepreneur',
    ctr: 7.2,
  },
  tiktok: {
    views: 48900,
    followers: 1204,
    likes: 3820,
    shares: 412,
    topVideo: 'I built this app in 2 hours with AI',
    avgWatchTime: '14.8s',
  },
}

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-4">
      <HUDPanel title="YouTube Analytics" tag="7 DAYS">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'VIEWS', value: mockStats.youtube.views, suffix: '' },
            { label: 'SUBSCRIBERS', value: mockStats.youtube.subscribers, suffix: '' },
            { label: 'CTR', value: mockStats.youtube.ctr, suffix: '%' },
          ].map(stat => (
            <div key={stat.label} className="hud-panel p-4 text-center">
              <div className="text-neon-cyan/40 text-xs mb-2 tracking-widest">{stat.label}</div>
              <div className="text-neon-cyan text-2xl font-mono neon-text">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
            </div>
          ))}
          <div className="hud-panel p-4 text-center">
            <div className="text-neon-cyan/40 text-xs mb-2 tracking-widest">AVG VIEW TIME</div>
            <div className="text-neon-cyan text-2xl font-mono neon-text">{mockStats.youtube.avgViewDuration}</div>
          </div>
        </div>
        <div className="hud-panel p-3">
          <div className="text-xs text-neon-cyan/40 mb-1 tracking-widest">TOP VIDEO (7d)</div>
          <p className="text-sm text-neon-cyan/80">{mockStats.youtube.topVideo}</p>
        </div>

        <div className="mt-4">
          <div className="text-xs text-neon-cyan/40 mb-2 tracking-widest">VIEWS BY DAY</div>
          <div className="flex items-end gap-1 h-16">
            {[40, 65, 55, 80, 70, 90, 100].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-neon-cyan/60 to-neon-cyan/20 rounded-t-sm relative group"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-neon-cyan/0 group-hover:text-neon-cyan/70 transition-colors whitespace-nowrap">
                  {Math.round(h * 145)}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="flex-1 text-center text-xs text-neon-cyan/25">{d}</div>
            ))}
          </div>
        </div>
      </HUDPanel>

      <HUDPanel title="TikTok Analytics" tag="7 DAYS" delay={0.1}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'VIEWS', value: mockStats.tiktok.views },
            { label: 'FOLLOWERS', value: mockStats.tiktok.followers },
            { label: 'LIKES', value: mockStats.tiktok.likes },
            { label: 'SHARES', value: mockStats.tiktok.shares },
          ].map(stat => (
            <div key={stat.label} className="hud-panel p-4 text-center">
              <div className="text-neon-pink/40 text-xs mb-2 tracking-widest">{stat.label}</div>
              <div className="text-neon-pink text-2xl font-mono" style={{ textShadow: '0 0 10px rgba(255,47,255,0.5)' }}>
                <AnimatedNumber value={stat.value} />
              </div>
            </div>
          ))}
        </div>
        <div className="hud-panel p-3">
          <div className="text-xs text-neon-pink/40 mb-1 tracking-widest">TOP VIDEO (7d)</div>
          <p className="text-sm text-neon-cyan/80">{mockStats.tiktok.topVideo}</p>
        </div>
        <div className="hud-panel p-3 mt-3">
          <div className="text-xs text-neon-pink/40 mb-1 tracking-widest">AVG WATCH TIME</div>
          <p className="text-lg neon-text-pink font-mono">{mockStats.tiktok.avgWatchTime}</p>
        </div>
      </HUDPanel>

      <HUDPanel title="Best Times to Post" tag="UK TIMEZONE" delay={0.2}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { platform: 'YouTube', times: ['Sat 10:00–12:00', 'Sun 14:00–16:00', 'Thu 18:00–20:00'] },
            { platform: 'TikTok', times: ['Tue 07:00–09:00', 'Thu 12:00–14:00', 'Fri 17:00–19:00'] },
          ].map(p => (
            <div key={p.platform} className="hud-panel p-3">
              <div className="text-xs text-neon-cyan/40 mb-2 tracking-widest">{p.platform.toUpperCase()}</div>
              {p.times.map((t, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60 shrink-0" />
                  <span className="text-xs text-neon-cyan/70 font-mono">{t}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </HUDPanel>

      <HUDPanel title="Content Ideas Queue" tag="AI SUGGESTIONS" delay={0.3}>
        <div className="space-y-2">
          {[
            { title: 'A day automating a client\'s business with AI', type: 'VLOG', score: 94 },
            { title: '5 AI tools I actually use every day in 2025', type: 'LIST', score: 91 },
            { title: 'I cold-emailed 100 UK businesses — here\'s what happened', type: 'STORY', score: 88 },
            { title: 'Building my automation agency from scratch (week 1)', type: 'SERIES', score: 86 },
            { title: 'This AI just replaced 40 hours of my work', type: 'HOOK', score: 93 },
          ].map((idea, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hud-panel hover:border-neon-cyan/25 group">
              <span className="neon-tag text-xs shrink-0">{idea.type}</span>
              <p className="text-xs text-neon-cyan/70 flex-1 group-hover:text-neon-cyan/90 transition-colors">{idea.title}</p>
              <div className="flex items-center gap-1 shrink-0">
                <div className="h-1 w-12 bg-neon-cyan/10 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-cyan/70 rounded-full" style={{ width: `${idea.score}%` }} />
                </div>
                <span className="text-xs text-neon-cyan/50 font-mono w-6">{idea.score}</span>
              </div>
            </div>
          ))}
        </div>
      </HUDPanel>
    </div>
  )
}
