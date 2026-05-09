'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Copy, Download, ChevronDown, ChevronUp, Mic, Clapperboard } from 'lucide-react'
import HUDPanel from './HUDPanel'
import toast from 'react-hot-toast'
import { addXP, completeMission, unlockAchievement, getState } from '@/lib/game'

interface ScriptSection {
  title: string
  text: string
  direction: string
  duration: string
}

interface Script {
  title: string
  estimatedDuration: string
  hook: { text: string; direction: string }
  intro: { text: string; direction: string }
  sections: ScriptSection[]
  outro: { text: string; direction: string }
  brollSuggestions: string[]
  chapterMarkers: string[]
  toneNotes: string
}

export default function ScriptWriter() {
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('medium')
  const [style, setStyle] = useState('vlog')
  const [platform, setPlatform] = useState('youtube')
  const [loading, setLoading] = useState(false)
  const [script, setScript] = useState<Script | null>(null)
  const [openSection, setOpenSection] = useState<string | null>('hook')
  const [showDirections, setShowDirections] = useState(false)

  async function generate() {
    if (!topic.trim()) { toast.error('Enter a topic first'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, duration, style, platform }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setScript(data)
      setOpenSection('hook')
      toast.success('Script generated')
      const s = getState()
      addXP(30, 'Script written', { totalScripts: s.totalScripts + 1 })
      completeMission('write-script')
      if (platform === 'shorts') completeMission('plan-short')
      unlockAchievement('first-script')
    } catch (e: any) {
      toast.error(e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copied')
  }

  function copyFullScript() {
    if (!script) return
    const full = [
      `# ${script.title}`,
      `Duration: ${script.estimatedDuration}`,
      `\n## HOOK\n${script.hook.text}`,
      showDirections ? `[Direction: ${script.hook.direction}]` : '',
      `\n## INTRO\n${script.intro.text}`,
      showDirections ? `[Direction: ${script.intro.direction}]` : '',
      ...script.sections.map(s => `\n## ${s.title} (~${s.duration})\n${s.text}${showDirections ? `\n[Direction: ${s.direction}]` : ''}`),
      `\n## OUTRO\n${script.outro.text}`,
      `\n## CHAPTER MARKERS\n${script.chapterMarkers.join('\n')}`,
      `\n## B-ROLL\n${script.brollSuggestions.map(b => `- ${b}`).join('\n')}`,
      `\n## TONE NOTES\n${script.toneNotes}`,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(full)
    toast.success('Full script copied')
  }

  function downloadScript() {
    if (!script) return
    const full = [
      `# ${script.title}`,
      `Duration: ${script.estimatedDuration}\n`,
      `## HOOK\n${script.hook.text}\n[${script.hook.direction}]\n`,
      `## INTRO\n${script.intro.text}\n[${script.intro.direction}]\n`,
      ...script.sections.map(s => `## ${s.title} (~${s.duration})\n${s.text}\n[${s.direction}]\n`),
      `## OUTRO\n${script.outro.text}\n`,
      `## CHAPTER MARKERS\n${script.chapterMarkers.join('\n')}\n`,
      `## B-ROLL SHOTS\n${script.brollSuggestions.map(b => `- ${b}`).join('\n')}\n`,
      `## TONE NOTES\n${script.toneNotes}`,
    ].join('\n')
    const blob = new Blob([full], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `script-${topic.slice(0, 30).replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Script downloaded')
  }

  const toggle = (id: string) => setOpenSection(openSection === id ? null : id)

  return (
    <div className="space-y-4">
      <HUDPanel title="Script Generator" tag="CLAUDE AI">
        <div className="space-y-3">
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="What's the video about? e.g. How I landed my first automation client in the UK with zero budget…"
            rows={3}
            className="neon-input w-full p-3 text-sm rounded-sm resize-none"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Length</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="neon-select w-full p-2 text-xs rounded-sm">
                <option value="short">Short (30–60s)</option>
                <option value="medium">Medium (5–10 min)</option>
                <option value="long">Long (15–20 min)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Style</label>
              <select value={style} onChange={e => setStyle(e.target.value)} className="neon-select w-full p-2 text-xs rounded-sm">
                <option value="vlog">Vlog</option>
                <option value="educational">Educational</option>
                <option value="storytelling">Storytelling</option>
                <option value="motivational">Motivational</option>
                <option value="talking-head">Talking Head</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-1.5">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="neon-select w-full p-2 text-xs rounded-sm">
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="shorts">Shorts</option>
              </select>
            </div>
          </div>
          <button onClick={generate} disabled={loading} className="glow-btn glow-btn-solid w-full py-3 text-sm tracking-widest flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />WRITING SCRIPT…</>
            ) : (
              <><FileText className="w-4 h-4" />GENERATE SCRIPT</>
            )}
          </button>
        </div>
      </HUDPanel>

      <AnimatePresence>
        {script && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Meta */}
            <HUDPanel>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-neon-cyan text-sm font-mono leading-tight">{script.title}</p>
                  <p className="text-neon-cyan/40 text-xs mt-0.5">Est. {script.estimatedDuration}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDirections(!showDirections)}
                    className={`glow-btn px-3 py-1.5 text-xs flex items-center gap-1 ${showDirections ? 'glow-btn-solid' : ''}`}
                  >
                    <Clapperboard className="w-3 h-3" />
                    {showDirections ? 'Hide' : 'Show'} Directions
                  </button>
                  <button onClick={copyFullScript} className="glow-btn px-3 py-1.5 text-xs flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy All
                  </button>
                  <button onClick={downloadScript} className="glow-btn glow-btn-purple px-3 py-1.5 text-xs flex items-center gap-1">
                    <Download className="w-3 h-3" /> .TXT
                  </button>
                </div>
              </div>
            </HUDPanel>

            {/* Tone notes */}
            <div className="hud-panel px-4 py-3 flex gap-2">
              <Mic className="w-4 h-4 text-neon-cyan/50 shrink-0 mt-0.5" />
              <p className="text-xs text-neon-cyan/60 leading-relaxed italic">{script.toneNotes}</p>
            </div>

            {/* Hook */}
            <ScriptBlock
              id="hook" label="HOOK" badge="0–10s" open={openSection === 'hook'}
              onToggle={() => toggle('hook')} text={script.hook.text}
              direction={showDirections ? script.hook.direction : undefined}
              onCopy={() => copy(script.hook.text)} color="pink"
            />

            {/* Intro */}
            <ScriptBlock
              id="intro" label="INTRO" badge="~30s" open={openSection === 'intro'}
              onToggle={() => toggle('intro')} text={script.intro.text}
              direction={showDirections ? script.intro.direction : undefined}
              onCopy={() => copy(script.intro.text)} color="cyan"
            />

            {/* Sections */}
            {script.sections.map((s, i) => (
              <ScriptBlock
                key={i} id={`section-${i}`} label={s.title} badge={s.duration}
                open={openSection === `section-${i}`} onToggle={() => toggle(`section-${i}`)}
                text={s.text} direction={showDirections ? s.direction : undefined}
                onCopy={() => copy(s.text)} color="cyan"
              />
            ))}

            {/* Outro */}
            <ScriptBlock
              id="outro" label="OUTRO + CTA" badge="~30s" open={openSection === 'outro'}
              onToggle={() => toggle('outro')} text={script.outro.text}
              direction={showDirections ? script.outro.direction : undefined}
              onCopy={() => copy(script.outro.text)} color="purple"
            />

            {/* Chapter Markers */}
            <HUDPanel title="Chapter Markers" tag="YOUTUBE">
              <div className="space-y-1">
                {script.chapterMarkers.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-neon-cyan/40 font-mono text-xs w-12 shrink-0">{c.split(' - ')[0]}</span>
                    <span className="text-xs text-neon-cyan/70">{c.split(' - ').slice(1).join(' - ')}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => copy(script.chapterMarkers.join('\n'))} className="glow-btn w-full py-1.5 text-xs mt-3 flex items-center justify-center gap-1">
                <Copy className="w-3 h-3" /> Copy Markers
              </button>
            </HUDPanel>

            {/* B-Roll */}
            <HUDPanel title="B-Roll Shot List" tag="FILMING">
              <div className="space-y-1.5">
                {script.brollSuggestions.map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-neon-cyan/30 text-xs shrink-0 mt-0.5">▸</span>
                    <p className="text-xs text-neon-cyan/60">{b}</p>
                  </div>
                ))}
              </div>
            </HUDPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScriptBlock({ id, label, badge, open, onToggle, text, direction, onCopy, color }: {
  id: string; label: string; badge: string; open: boolean; onToggle: () => void;
  text: string; direction?: string; onCopy: () => void; color: 'cyan' | 'purple' | 'pink'
}) {
  const c = color === 'pink' ? 'text-neon-pink' : color === 'purple' ? 'text-neon-purple' : 'text-neon-cyan'
  return (
    <div className="hud-panel">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono tracking-widest uppercase ${c}`}>{label}</span>
          <span className="neon-tag text-xs">{badge}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-neon-cyan/40" /> : <ChevronDown className="w-4 h-4 text-neon-cyan/40" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-neon-cyan/10 p-4 space-y-3">
              <p className="text-sm text-neon-cyan/80 leading-relaxed whitespace-pre-wrap">{text}</p>
              {direction && (
                <div className="flex items-start gap-2 p-2 bg-neon-purple/5 border border-neon-purple/15 rounded-sm">
                  <Clapperboard className="w-3.5 h-3.5 text-neon-purple/60 shrink-0 mt-0.5" />
                  <p className="text-xs text-neon-purple/60 italic">{direction}</p>
                </div>
              )}
              <button onClick={onCopy} className="glow-btn px-3 py-1.5 text-xs flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy Section
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
