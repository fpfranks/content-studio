'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Copy, RefreshCw, Hash, FileText, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import HUDPanel from './HUDPanel'
import toast from 'react-hot-toast'

interface Props {
  videoName?: string
}

interface GeneratedContent {
  titles: string[]
  descriptions: { youtube: string; tiktok: string }
  hashtags: { youtube: string[]; tiktok: string[] }
  hooks: string[]
  captions: string[]
  thumbnailIdeas: string[]
  bestPostTimes: string
}

export default function AIStudio({ videoName }: Props) {
  const [topic, setTopic] = useState('')
  const [vibe, setVibe] = useState('authentic')
  const [platform, setPlatform] = useState('both')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>('titles')

  async function generate() {
    if (!topic.trim()) {
      toast.error('Tell me what this video is about')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, vibe, platform, videoName }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setContent(data)
      setExpandedSection('titles')
      toast.success('Content generated')
    } catch (e: any) {
      toast.error(e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copied')
  }

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s)

  return (
    <div className="space-y-4">
      <HUDPanel title="AI Content Generator" tag="CLAUDE AI">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-2">
              What is this video about?
            </label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. My morning routine as a UK entrepreneur, walking through my AI tools setup…"
              rows={3}
              className="neon-input w-full p-3 text-sm rounded-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-2">Vibe</label>
              <select
                value={vibe}
                onChange={e => setVibe(e.target.value)}
                className="neon-select w-full p-2 text-sm rounded-sm"
              >
                <option value="authentic">Authentic / Day-in-life</option>
                <option value="viral">Viral / High energy</option>
                <option value="educational">Educational / Value</option>
                <option value="motivational">Motivational</option>
                <option value="behind-scenes">Behind the scenes</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neon-cyan/50 tracking-widest uppercase block mb-2">Platform</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="neon-select w-full p-2 text-sm rounded-sm"
              >
                <option value="both">YouTube + TikTok</option>
                <option value="youtube">YouTube only</option>
                <option value="tiktok">TikTok only</option>
                <option value="shorts">YouTube Shorts</option>
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="glow-btn glow-btn-solid w-full py-3 text-sm tracking-widest flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                GENERATING WITH CLAUDE AI…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                GENERATE ALL CONTENT
              </>
            )}
          </button>
        </div>
      </HUDPanel>

      <AnimatePresence>
        {content && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Copy everything button */}
            <button
              onClick={() => {
                const all = [
                  '=== TITLES ===',
                  content.titles.join('\n'),
                  '\n=== HOOKS ===',
                  content.hooks.join('\n'),
                  '\n=== YOUTUBE DESCRIPTION ===',
                  content.descriptions.youtube,
                  '\n=== TIKTOK CAPTION ===',
                  content.descriptions.tiktok,
                  '\n=== YOUTUBE HASHTAGS ===',
                  content.hashtags.youtube.join(' '),
                  '\n=== TIKTOK HASHTAGS ===',
                  content.hashtags.tiktok.join(' '),
                  '\n=== CAPTIONS ===',
                  content.captions.join('\n'),
                ].join('\n')
                navigator.clipboard.writeText(all)
                toast.success('All content copied')
              }}
              className="glow-btn glow-btn-solid w-full py-2.5 text-xs tracking-widest flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> COPY EVERYTHING
            </button>

            {/* Titles */}
            <CollapsibleSection
              id="titles"
              title="Video Titles"
              icon={<FileText className="w-4 h-4" />}
              expanded={expandedSection === 'titles'}
              onToggle={() => toggleSection('titles')}
            >
              <div className="space-y-2">
                {content.titles.map((title, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 hud-panel hover:border-neon-cyan/25 group">
                    <span className="neon-tag mt-0.5 text-xs shrink-0">T{i + 1}</span>
                    <p className="text-sm text-neon-cyan/80 flex-1 leading-relaxed">{title}</p>
                    <button onClick={() => copyText(title)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Copy className="w-3.5 h-3.5 text-neon-cyan/50 hover:text-neon-cyan" />
                    </button>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Hooks */}
            <CollapsibleSection
              id="hooks"
              title="Opening Hooks (First 3 seconds)"
              icon={<Zap className="w-4 h-4" />}
              expanded={expandedSection === 'hooks'}
              onToggle={() => toggleSection('hooks')}
            >
              <div className="space-y-2">
                {content.hooks.map((hook, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 hud-panel hover:border-neon-cyan/25 group">
                    <span className="neon-tag mt-0.5 shrink-0">H{i + 1}</span>
                    <p className="text-sm text-neon-cyan/80 flex-1 italic">&ldquo;{hook}&rdquo;</p>
                    <button onClick={() => copyText(hook)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Copy className="w-3.5 h-3.5 text-neon-cyan/50 hover:text-neon-cyan" />
                    </button>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Descriptions */}
            {(platform === 'both' || platform === 'youtube' || platform === 'shorts') && (
              <CollapsibleSection
                id="yt-desc"
                title="YouTube Description"
                icon={<FileText className="w-4 h-4" />}
                expanded={expandedSection === 'yt-desc'}
                onToggle={() => toggleSection('yt-desc')}
              >
                <div className="relative">
                  <pre className="text-xs text-neon-cyan/70 whitespace-pre-wrap leading-relaxed font-mono p-2 bg-neon-cyan/5 rounded-sm border border-neon-cyan/10">
                    {content.descriptions.youtube}
                  </pre>
                  <button
                    onClick={() => copyText(content.descriptions.youtube)}
                    className="absolute top-2 right-2 glow-btn px-2 py-1 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </CollapsibleSection>
            )}

            {(platform === 'both' || platform === 'tiktok') && (
              <CollapsibleSection
                id="tt-desc"
                title="TikTok Caption"
                icon={<FileText className="w-4 h-4" />}
                expanded={expandedSection === 'tt-desc'}
                onToggle={() => toggleSection('tt-desc')}
              >
                <div className="relative">
                  <pre className="text-xs text-neon-cyan/70 whitespace-pre-wrap leading-relaxed font-mono p-2 bg-neon-cyan/5 rounded-sm border border-neon-cyan/10">
                    {content.descriptions.tiktok}
                  </pre>
                  <button
                    onClick={() => copyText(content.descriptions.tiktok)}
                    className="absolute top-2 right-2 glow-btn px-2 py-1 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </CollapsibleSection>
            )}

            {/* Hashtags */}
            <CollapsibleSection
              id="hashtags"
              title="Hashtags"
              icon={<Hash className="w-4 h-4" />}
              expanded={expandedSection === 'hashtags'}
              onToggle={() => toggleSection('hashtags')}
            >
              <div className="space-y-4">
                {content.hashtags.youtube.length > 0 && (
                  <div>
                    <div className="text-xs text-neon-cyan/40 mb-2 tracking-widest">YOUTUBE</div>
                    <div className="flex flex-wrap gap-1.5">
                      {content.hashtags.youtube.map((h, i) => (
                        <button key={i} onClick={() => copyText(h)} className="neon-tag hover:bg-neon-cyan/15 transition-colors cursor-pointer">
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {content.hashtags.tiktok.length > 0 && (
                  <div>
                    <div className="text-xs text-neon-cyan/40 mb-2 tracking-widest">TIKTOK</div>
                    <div className="flex flex-wrap gap-1.5">
                      {content.hashtags.tiktok.map((h, i) => (
                        <button key={i} onClick={() => copyText(h)} className="neon-tag hover:bg-neon-purple/20 border-neon-purple/30 text-neon-purple/80 transition-colors cursor-pointer">
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => copyText([...content.hashtags.youtube, ...content.hashtags.tiktok].join(' '))}
                  className="glow-btn px-3 py-1.5 text-xs w-full"
                >
                  COPY ALL HASHTAGS
                </button>
              </div>
            </CollapsibleSection>

            {/* Captions / Subtitles */}
            <CollapsibleSection
              id="captions"
              title="On-Screen Caption Lines"
              icon={<FileText className="w-4 h-4" />}
              expanded={expandedSection === 'captions'}
              onToggle={() => toggleSection('captions')}
            >
              <div className="space-y-2">
                {content.captions.map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 hud-panel group">
                    <span className="w-5 h-5 flex items-center justify-center text-xs text-neon-cyan/40 shrink-0">{i + 1}</span>
                    <p className="text-sm text-neon-cyan/80 flex-1">{cap}</p>
                    <button onClick={() => copyText(cap)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-3.5 h-3.5 text-neon-cyan/50 hover:text-neon-cyan" />
                    </button>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Thumbnail Ideas */}
            <CollapsibleSection
              id="thumbnails"
              title="Thumbnail Concepts"
              icon={<Sparkles className="w-4 h-4" />}
              expanded={expandedSection === 'thumbnails'}
              onToggle={() => toggleSection('thumbnails')}
            >
              <div className="space-y-2">
                {content.thumbnailIdeas.map((idea, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 hud-panel">
                    <span className="neon-tag shrink-0">#{i + 1}</span>
                    <p className="text-xs text-neon-cyan/70 leading-relaxed">{idea}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Post Times */}
            <HUDPanel title="Best Time to Post" tag="ANALYTICS">
              <p className="text-xs text-neon-cyan/70 leading-relaxed">{content.bestPostTimes}</p>
            </HUDPanel>

            <button
              onClick={generate}
              className="glow-btn glow-btn-purple w-full py-2.5 text-xs tracking-widest flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              REGENERATE VARIATIONS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CollapsibleSection({ id, title, icon, children, expanded, onToggle }: {
  id: string; title: string; icon: React.ReactNode;
  children: React.ReactNode; expanded: boolean; onToggle: () => void;
}) {
  return (
    <div className="hud-panel">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-neon-cyan/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-neon-cyan/60">{icon}</span>
          <span className="text-xs text-neon-cyan/70 tracking-widest uppercase font-mono">{title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-neon-cyan/40" /> : <ChevronDown className="w-4 h-4 text-neon-cyan/40" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neon-cyan/10 p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
