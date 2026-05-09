'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy, Target, TrendingUp, Copy, RefreshCw } from 'lucide-react'
import HUDPanel from './HUDPanel'
import toast from 'react-hot-toast'
import {
  getState, getLevel, xpToNextLevel, getTodayMissions, isMissionDone,
  completeMission, unlockAchievement, ACHIEVEMENTS, LEVELS, addXP, GameState
} from '@/lib/game'

interface ViralResult {
  score: number; verdict: string; strengths: string[]; improvements: string[]
  rewrite: string; retentionPrediction: string
  platformFit: { shorts: number; tiktok: number; youtube: number }
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 28, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width="72" height="72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(0,255,200,0.08)" strokeWidth="6" />
      <motion.circle
        cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  )
}

export default function HQ() {
  const [state, setState] = useState<GameState | null>(null)
  const [hookText, setHookText] = useState('')
  const [hookType, setHookType] = useState<'hook' | 'title'>('hook')
  const [scoring, setScoring] = useState(false)
  const [result, setResult] = useState<ViralResult | null>(null)
  const [missions] = useState(() => typeof window !== 'undefined' ? getTodayMissions() : [])
  const [missionDone, setMissionDone] = useState<Record<string, boolean>>({})
  const [showAchievements, setShowAchievements] = useState(false)
  const [xpFlash, setXpFlash] = useState<{ amount: number; key: number } | null>(null)
  const flashKey = useRef(0)

  const refresh = useCallback(() => {
    const s = getState()
    setState(s)
    const done: Record<string, boolean> = {}
    missions.forEach(m => { done[m.id] = isMissionDone(m.id) })
    setMissionDone(done)
  }, [missions])

  useEffect(() => {
    refresh()
    const onXP = (e: Event) => {
      const { amount } = (e as CustomEvent).detail
      flashKey.current++
      setXpFlash({ amount, key: flashKey.current })
      setTimeout(() => setXpFlash(null), 1800)
      refresh()
    }
    const onAch = (e: Event) => {
      const { label } = (e as CustomEvent).detail
      toast.success(`🏆 Achievement: ${label}`)
      refresh()
    }
    window.addEventListener('xp-gained', onXP)
    window.addEventListener('achievement-unlocked', onAch)
    return () => { window.removeEventListener('xp-gained', onXP); window.removeEventListener('achievement-unlocked', onAch) }
  }, [refresh])

  async function scoreViral() {
    if (!hookText.trim()) { toast.error('Enter a hook or title first'); return }
    setScoring(true); setResult(null)
    try {
      const res = await fetch('/api/viral-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: hookText, type: hookType }),
      })
      const data: ViralResult = await res.json()
      setResult(data)
      addXP(10, 'Hook tested', { totalHookTests: (state?.totalHookTests ?? 0) + 1 })
      if ((state?.totalHookTests ?? 0) + 1 >= 20) unlockAchievement('viral-machine')
      if (data.score >= 90) unlockAchievement('hook-master')
      completeMission('test-hook')
      refresh()
    } catch { toast.error('Score failed') }
    finally { setScoring(false) }
  }

  function tickMission(id: string) {
    const { xp, alreadyDone } = completeMission(id)
    if (alreadyDone) { toast('Already done today', { icon: '✓' }); return }
    toast.success(`+${xp} XP`)
    refresh()
  }

  if (!state) return null

  const level = getLevel(state.xp)
  const prog = xpToNextLevel(state.xp)
  const unlockedAch = ACHIEVEMENTS.filter(a => state.achievements.includes(a.id))
  const scoreColor = result
    ? result.score >= 80 ? '#00ffc8' : result.score >= 60 ? '#ffaa00' : '#ff4466'
    : '#00ffc8'

  return (
    <div className="space-y-4">
      {/* XP float notification */}
      <AnimatePresence>
        {xpFlash && (
          <motion.div
            key={xpFlash.key}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="fixed top-24 right-6 z-[9999] pointer-events-none"
          >
            <span className="neon-text font-mono text-xl font-bold">+{xpFlash.amount} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Player Card ───────────────────────────── */}
      <div className="hud-panel p-5 relative overflow-hidden">
        {/* Animated bg stripes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,255,200,0.05) 20px, rgba(0,255,200,0.05) 40px)' }} />

        <div className="relative flex items-center gap-4">
          {/* Level badge */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-sm flex items-center justify-center border-2 relative"
              style={{ borderColor: level.color, boxShadow: `0 0 20px ${level.color}40, inset 0 0 20px ${level.color}10` }}>
              <span className="text-2xl font-mono font-bold" style={{ color: level.color, textShadow: `0 0 12px ${level.color}` }}>
                {LEVELS.indexOf(level) + 1}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: level.color }}>
              <Zap className="w-2.5 h-2.5 text-black" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-neon-cyan/40 tracking-widest uppercase font-mono">RANK</span>
              <span className="font-mono text-sm font-bold" style={{ color: level.color, textShadow: `0 0 8px ${level.color}80` }}>
                {level.title}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono neon-text">{state.xp.toLocaleString()}</span>
              <span className="text-xs text-neon-cyan/40">XP</span>
            </div>

            {/* XP progress bar */}
            <div className="mt-2">
              <div className="neon-progress h-2 w-full">
                <motion.div
                  className="h-full rounded-sm"
                  style={{ background: `linear-gradient(90deg, ${level.color}, ${LEVELS[Math.min(LEVELS.indexOf(level) + 1, LEVELS.length - 1)].color})`, boxShadow: `0 0 8px ${level.color}60` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${prog.pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-xs text-neon-cyan/30 font-mono">{prog.current} / {prog.needed} XP</span>
                <span className="text-xs text-neon-cyan/30 font-mono">{prog.pct}%</span>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="shrink-0 text-center">
            <div className="text-3xl">🔥</div>
            <div className="text-xl font-mono neon-text">{state.streak}</div>
            <div className="text-xs text-neon-cyan/40">streak</div>
          </div>
        </div>
      </div>

      {/* ── Daily Missions ────────────────────────── */}
      <HUDPanel title="Daily Missions" tag="RESETS MIDNIGHT">
        <div className="space-y-2">
          {missions.map(m => {
            const done = missionDone[m.id]
            return (
              <motion.button
                key={m.id}
                onClick={() => tickMission(m.id)}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 p-3 rounded-sm border text-left transition-all ${done ? 'border-neon-green/30 bg-neon-green/5' : 'border-neon-cyan/10 hover:border-neon-cyan/25 hover:bg-neon-cyan/3'}`}
              >
                <span className="text-lg shrink-0">{done ? '✅' : m.icon}</span>
                <span className={`flex-1 text-sm font-mono ${done ? 'line-through text-neon-cyan/30' : 'text-neon-cyan/70'}`}>{m.label}</span>
                <span className={`text-xs font-mono shrink-0 ${done ? 'text-neon-green' : 'text-neon-cyan/40'}`}>+{m.xp} XP</span>
              </motion.button>
            )
          })}
        </div>
        <p className="text-xs text-neon-cyan/25 text-center mt-3">Tap a mission to mark it done</p>
      </HUDPanel>

      {/* ── Viral Scorer ──────────────────────────── */}
      <HUDPanel title="Viral Scorer" tag="AI POWERED">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['hook', 'title'] as const).map(t => (
              <button key={t} onClick={() => setHookType(t)}
                className={`flex-1 py-2 text-xs font-mono tracking-widest uppercase glow-btn ${hookType === t ? 'glow-btn-solid' : ''}`}>
                {t === 'hook' ? '⚡ Hook' : '📌 Title'}
              </button>
            ))}
          </div>
          <textarea
            value={hookText}
            onChange={e => setHookText(e.target.value)}
            placeholder={hookType === 'hook'
              ? 'e.g. "I made £3,000 in 7 days with this one AI tool…"'
              : 'e.g. "I Quit My Job to Build an AI Agency (This Happened)"'}
            rows={2}
            className="neon-input w-full p-3 text-sm rounded-sm resize-none"
          />
          <button onClick={scoreViral} disabled={scoring}
            className="glow-btn glow-btn-solid w-full py-3 text-sm tracking-widest flex items-center justify-center gap-2">
            {scoring
              ? <><div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />ANALYSING…</>
              : <><TrendingUp className="w-4 h-4" />SCORE IT</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
              {/* Score display */}
              <div className="flex items-center gap-5 p-4 rounded-sm border" style={{ borderColor: `${scoreColor}30`, background: `${scoreColor}08` }}>
                <div className="relative shrink-0">
                  <ScoreRing score={result.score} color={scoreColor} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-mono font-bold" style={{ color: scoreColor }}>{result.score}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xl font-mono font-bold mb-1" style={{ color: scoreColor, textShadow: `0 0 12px ${scoreColor}60` }}>
                    {result.verdict}
                  </div>
                  <p className="text-xs text-neon-cyan/60 leading-relaxed">{result.retentionPrediction}</p>
                  <div className="flex gap-3 mt-2">
                    {Object.entries(result.platformFit).map(([p, s]) => (
                      <div key={p} className="text-center">
                        <div className="text-xs text-neon-cyan/40">{p.slice(0,2).toUpperCase()}</div>
                        <div className="text-sm font-mono" style={{ color: s >= 70 ? '#00ffc8' : s >= 50 ? '#ffaa00' : '#ff4466' }}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div>
                  <div className="text-xs text-neon-cyan/40 tracking-widest mb-2">WHAT WORKS</div>
                  {result.strengths.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <span className="text-neon-green text-xs shrink-0">✓</span>
                      <p className="text-xs text-neon-cyan/70">{s}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <div>
                  <div className="text-xs text-neon-cyan/40 tracking-widest mb-2">MAKE IT STRONGER</div>
                  {result.improvements.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <span className="text-yellow-400 text-xs shrink-0">▸</span>
                      <p className="text-xs text-neon-cyan/70">{s}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Rewrite */}
              <div className="hud-panel p-3 border-neon-cyan/20">
                <div className="text-xs text-neon-cyan/40 tracking-widest mb-2">AI REWRITE</div>
                <p className="text-sm text-neon-cyan/90 italic leading-relaxed">"{result.rewrite}"</p>
                <button onClick={() => { navigator.clipboard.writeText(result.rewrite); toast.success('Copied') }}
                  className="glow-btn px-3 py-1.5 text-xs mt-2 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy Rewrite
                </button>
              </div>

              <button onClick={() => { setResult(null); setHookText(result.rewrite) }}
                className="glow-btn glow-btn-purple w-full py-2 text-xs flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3" /> Score the Rewrite
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </HUDPanel>

      {/* ── Shorts Strategy ───────────────────────── */}
      <HUDPanel title="Shorts → Subscribers Funnel" tag="STRATEGY">
        <div className="space-y-3">
          {[
            { step: '01', label: 'Post 3–5 Shorts per week', detail: 'Short, punchy, 30–58 seconds. Hook in first 2s. Loop ending.', color: '#00ffc8' },
            { step: '02', label: 'End every Short with a CTA', detail: '"Subscribe for the full story" or "Watch the long video for the full breakdown."', color: '#7b2fff' },
            { step: '03', label: 'Drop long-form every 1–2 weeks', detail: 'Pin a long video to your channel. Shorts viewers convert here.', color: '#ff2fff' },
            { step: '04', label: 'Batch film, batch edit', detail: 'Film 5 Shorts in one session. Repurpose long-form into Shorts clips.', color: '#ffaa00' },
          ].map(s => (
            <div key={s.step} className="flex gap-3 p-3 hud-panel" style={{ borderColor: `${s.color}20` }}>
              <span className="text-2xl font-mono font-bold shrink-0" style={{ color: s.color, textShadow: `0 0 10px ${s.color}60` }}>{s.step}</span>
              <div>
                <p className="text-xs font-mono text-neon-cyan/80 mb-0.5">{s.label}</p>
                <p className="text-xs text-neon-cyan/40 leading-relaxed">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </HUDPanel>

      {/* ── Achievements ──────────────────────────── */}
      <HUDPanel
        title="Achievements"
        tag={`${unlockedAch.length}/${ACHIEVEMENTS.length}`}
      >
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {ACHIEVEMENTS.map(a => {
            const unlocked = state.achievements.includes(a.id)
            return (
              <div key={a.id} title={`${a.label}: ${a.desc}`}
                className={`hud-panel p-2 flex flex-col items-center gap-1 transition-all ${unlocked ? 'border-neon-cyan/30' : 'opacity-30 grayscale'}`}>
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[9px] text-center text-neon-cyan/60 leading-tight">{a.label}</span>
                {a.xp > 0 && <span className="text-[9px] text-neon-cyan/30">+{a.xp}</span>}
              </div>
            )
          })}
        </div>
      </HUDPanel>

      {/* ── Best Post Times ───────────────────────── */}
      <HUDPanel title="Best Times to Post" tag="UK GMT">
        <div className="grid grid-cols-1 gap-2">
          {[
            { p: 'YouTube Shorts', times: ['Tue & Thu 07:00–09:00', 'Sat 10:00–13:00'], icon: '⚡', tip: 'Shorts can go viral any time — consistency beats timing' },
            { p: 'YouTube Long', times: ['Thu–Sat 17:00–20:00'], icon: '▶', tip: 'Long-form needs at least 4 hours of prime watch time' },
            { p: 'TikTok', times: ['Tue 07:00–09:00', 'Fri 17:00–19:00'], icon: '♪', tip: 'Cross-post Shorts to TikTok same day' },
          ].map(r => (
            <div key={r.p} className="hud-panel p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>{r.icon}</span>
                <span className="text-xs font-mono text-neon-cyan/70">{r.p}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {r.times.map(t => <span key={t} className="neon-tag">{t}</span>)}
              </div>
              <p className="text-xs text-neon-cyan/35 italic">{r.tip}</p>
            </div>
          ))}
        </div>
      </HUDPanel>
    </div>
  )
}
