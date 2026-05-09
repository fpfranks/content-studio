'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { Scene, Project, StepId, Category, Tone } from '@/lib/types'
import { Copy, Download, RefreshCw, ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react'

const STEPS: { id: StepId; label: string; icon: string }[] = [
  { id: 'topic',   label: 'Topic',   icon: '💡' },
  { id: 'script',  label: 'Script',  icon: '📜' },
  { id: 'images',  label: 'Images',  icon: '🎨' },
  { id: 'voice',   label: 'Voice',   icon: '🎙' },
  { id: 'assemble',label: 'Video',   icon: '🎬' },
  { id: 'upload',  label: 'Upload',  icon: '🚀' },
]

const CATEGORIES = [
  { value: 'history',  label: 'History' },
  { value: 'science',  label: 'Science' },
  { value: 'military', label: 'Military' },
  { value: 'nature',   label: 'Nature' },
  { value: 'truecrime',label: 'True Crime' },
]

const TONES = [
  { value: 'dramatic',    label: 'Dramatic' },
  { value: 'shocking',    label: 'Shocking' },
  { value: 'dark',        label: 'Dark' },
  { value: 'educational', label: 'Educational' },
]

const RANDOM_TOPICS = [
  'The last 24 hours of Julius Caesar',
  'Why the Tunguska explosion is still a mystery',
  'The soldier who kept fighting WWII until 1974',
  'How the Black Death changed human DNA forever',
  'The Soviet city that vanished from all maps',
  'Why ancient Romans used urine as mouthwash',
  'The Dyatlov Pass incident — what really happened',
  'The man who survived both atomic bombs',
  'How a single ship sank three empires',
  'The experiment that proved time travel impossible',
]

export default function StudioPipeline() {
  const [step, setStep] = useState<StepId>('topic')
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState<Category>('history')
  const [tone, setTone] = useState<Tone>('dramatic')
  const [project, setProject] = useState<Partial<Project>>({})
  const [loading, setLoading] = useState(false)
  const [imageProgress, setImageProgress] = useState(0)
  const [voiceProgress, setVoiceProgress] = useState(0)
  const [editingScene, setEditingScene] = useState<string | null>(null)

  const stepIndex = STEPS.findIndex(s => s.id === step)

  function goTo(s: StepId) {
    const targetIdx = STEPS.findIndex(x => x.id === s)
    if (targetIdx <= stepIndex) setStep(s)
  }

  // ── Step 1: Generate script ──────────────────────────────
  async function generateScript() {
    if (!topic.trim()) { toast.error('Enter a topic first'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category, tone }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProject({ ...project, topic, category, tone, title: data.title, description: data.description, hashtags: data.hashtags, scenes: data.scenes })
      setStep('script')
      toast.success('Script generated')
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  // ── Step 2: Generate images ──────────────────────────────
  async function generateImages() {
    const scenes = project.scenes!
    setLoading(true)
    setImageProgress(0)
    const updated: Scene[] = []
    try {
      for (let i = 0; i < scenes.length; i++) {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagePrompt: scenes[i].imagePrompt }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        updated.push({ ...scenes[i], imageUrl: data.imageUrl })
        setImageProgress(i + 1)
        setProject(p => ({ ...p, scenes: [...updated, ...scenes.slice(i + 1)] }))
      }
      setProject(p => ({ ...p, scenes: updated }))
      setStep('images')
      toast.success('All images generated')
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  // ── Step 3: Generate voice ───────────────────────────────
  async function generateVoice() {
    const scenes = project.scenes!
    setLoading(true)
    setVoiceProgress(0)
    const updated: Scene[] = []
    try {
      for (let i = 0; i < scenes.length; i++) {
        const res = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: scenes[i].narration, sceneId: scenes[i].id }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        updated.push({ ...scenes[i], audioUrl: data.audioUrl })
        setVoiceProgress(i + 1)
        setProject(p => ({ ...p, scenes: [...updated, ...scenes.slice(i + 1)] }))
      }
      setProject(p => ({ ...p, scenes: updated }))
      setStep('voice')
      toast.success('Voiceover generated')
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  // ── Step 4: Assemble video ───────────────────────────────
  async function assembleVideo() {
    setLoading(true)
    try {
      const res = await fetch('/api/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: project.scenes, title: project.title }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProject(p => ({ ...p, videoPath: data.videoUrl }))
      setStep('assemble')
      toast.success('Video assembled!')
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  function updateScene(id: string, field: keyof Scene, value: string) {
    setProject(p => ({
      ...p,
      scenes: p.scenes!.map(s => s.id === id ? { ...s, [field]: value } : s),
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" toastOptions={{
        style: { background: '#130e06', border: '1px solid rgba(201,162,39,0.3)', color: '#ede0b8', fontFamily: 'Lora, serif', fontSize: '13px' },
      }} />

      {/* Header */}
      <header className="border-b sticky top-0 z-50 backdrop-blur-md px-4 py-3"
        style={{ borderColor: 'rgba(201,162,39,0.15)', background: 'rgba(10,8,5,0.92)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="font-heading font-bold tracking-wider text-sm title-glimmer" style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif' }}>
              SHORTS STUDIO
            </span>
          </div>
          {project.title && (
            <span className="text-xs font-body truncate max-w-[200px]" style={{ color: 'var(--parchment-dim)' }}>
              {project.title}
            </span>
          )}
        </div>
      </header>

      {/* Step indicator */}
      <div className="border-b px-4 py-4" style={{ borderColor: 'rgba(201,162,39,0.1)', background: 'rgba(8,6,3,0.7)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const isDone = i < stepIndex
              const isActive = s.id === step
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    onClick={() => goTo(s.id)}
                    className={`flex flex-col items-center gap-1 transition-all ${isDone ? 'cursor-pointer' : isActive ? 'cursor-default' : 'cursor-not-allowed opacity-30'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm transition-all ${
                      isDone ? 'border-shire bg-shire/20' : isActive ? 'border-gold pulse-glow' : 'border-parchment-dark'
                    }`} style={{
                      borderColor: isDone ? 'var(--shire)' : isActive ? 'var(--gold)' : 'rgba(74,56,32,0.5)',
                      background: isDone ? 'rgba(74,124,89,0.2)' : isActive ? 'rgba(201,162,39,0.1)' : 'transparent',
                    }}>
                      {isDone ? <Check className="w-4 h-4" style={{ color: 'var(--shire)' }} /> : <span>{s.icon}</span>}
                    </div>
                    <span className="text-[10px] font-heading hidden sm:block" style={{ color: isDone ? 'var(--shire)' : isActive ? 'var(--gold)' : 'rgba(74,56,32,0.5)' }}>
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-1" style={{ background: i < stepIndex ? 'var(--shire)' : 'rgba(74,56,32,0.3)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

              {/* ── TOPIC STEP ──────────────────────────── */}
              {step === 'topic' && (
                <div className="space-y-4 pt-4">
                  <div className="hud-panel p-6">
                    <h2 className="font-heading text-lg mb-1" style={{ color: 'var(--gold)' }}>Choose Your Topic</h2>
                    <p className="text-xs font-body mb-4" style={{ color: 'var(--parchment-dim)' }}>
                      Enter any history, science, or fact-based topic. Claude will write the full script.
                    </p>

                    <textarea
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. The last 24 hours of Julius Caesar..."
                      rows={3}
                      className="neon-input w-full p-3 text-sm resize-none mb-3"
                    />

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-xs font-heading tracking-widest uppercase block mb-1.5" style={{ color: 'rgba(201,162,39,0.4)' }}>Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value as Category)} className="neon-select w-full p-2 text-sm">
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-heading tracking-widest uppercase block mb-1.5" style={{ color: 'rgba(201,162,39,0.4)' }}>Tone</label>
                        <select value={tone} onChange={e => setTone(e.target.value as Tone)} className="neon-select w-full p-2 text-sm">
                          {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={generateScript} disabled={loading}
                        className="glow-btn glow-btn-solid flex-1 py-3 text-sm tracking-widest flex items-center justify-center gap-2">
                        {loading
                          ? <><div className="w-4 h-4 border-2 border-t-current rounded-full animate-spin" style={{ borderColor: 'rgba(201,162,39,0.3)', borderTopColor: 'var(--gold)' }} />Writing script…</>
                          : <>📜 Generate Script</>}
                      </button>
                      <button
                        onClick={() => setTopic(RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)])}
                        className="glow-btn px-4 py-3 text-xs" title="Random topic">
                        🎲
                      </button>
                    </div>
                  </div>

                  <div className="hud-panel p-4">
                    <p className="text-xs font-heading tracking-widest mb-3" style={{ color: 'rgba(201,162,39,0.35)' }}>POPULAR TOPICS</p>
                    <div className="flex flex-wrap gap-2">
                      {RANDOM_TOPICS.slice(0, 5).map(t => (
                        <button key={t} onClick={() => setTopic(t)}
                          className="neon-tag cursor-pointer hover:bg-gold/15 transition-colors text-xs py-1">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SCRIPT STEP ─────────────────────────── */}
              {(step === 'script' || step === 'images' || step === 'voice' || step === 'assemble' || step === 'upload') && project.scenes && (
                <div className="space-y-4 pt-4">
                  {step === 'script' && (
                    <div className="hud-panel p-4">
                      <h2 className="font-heading text-base mb-0.5" style={{ color: 'var(--gold)' }}>Review Your Script</h2>
                      <p className="text-xs font-body mb-0" style={{ color: 'var(--parchment-dim)' }}>Edit any scene, then generate the cartoon images.</p>
                    </div>
                  )}

                  {/* Title */}
                  <div className="hud-panel p-4">
                    <p className="text-xs font-heading tracking-widest mb-1" style={{ color: 'rgba(201,162,39,0.35)' }}>VIDEO TITLE</p>
                    <p className="text-sm font-body" style={{ color: 'var(--parchment)' }}>{project.title}</p>
                    <p className="text-xs font-heading mt-2 mb-1" style={{ color: 'rgba(201,162,39,0.35)' }}>HASHTAGS</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.hashtags?.map(h => <span key={h} className="neon-tag">{h}</span>)}
                    </div>
                  </div>

                  {/* Scenes */}
                  <div className="space-y-3">
                    {project.scenes.map((scene, i) => (
                      <div key={scene.id} className="hud-panel p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-heading"
                            style={{ background: 'rgba(201,162,39,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.3)' }}>
                            {i + 1}
                          </span>
                          <span className="text-xs font-heading tracking-widest" style={{ color: 'rgba(201,162,39,0.4)' }}>
                            SCENE {i + 1} · {scene.duration}s
                          </span>
                          {step === 'script' && (
                            <button onClick={() => setEditingScene(editingScene === scene.id ? null : scene.id)}
                              className="ml-auto glow-btn px-2 py-1 text-xs flex items-center gap-1">
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </div>

                        {/* Image preview if available */}
                        {scene.imageUrl && (
                          <div className="mb-3 rounded overflow-hidden" style={{ maxHeight: 180 }}>
                            <img src={scene.imageUrl} alt={`Scene ${i + 1}`} className="w-full object-cover" style={{ maxHeight: 180 }} />
                          </div>
                        )}

                        {/* Audio player if available */}
                        {scene.audioUrl && (
                          <audio controls src={scene.audioUrl} className="w-full mb-2" style={{ height: 32 }} />
                        )}

                        {editingScene === scene.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={scene.narration}
                              onChange={e => updateScene(scene.id, 'narration', e.target.value)}
                              rows={3}
                              className="neon-input w-full p-2 text-sm resize-none"
                            />
                            <textarea
                              value={scene.imagePrompt}
                              onChange={e => updateScene(scene.id, 'imagePrompt', e.target.value)}
                              rows={2}
                              className="neon-input w-full p-2 text-xs resize-none"
                              placeholder="Image description…"
                            />
                            <button onClick={() => setEditingScene(null)}
                              className="glow-btn glow-btn-solid px-3 py-1.5 text-xs flex items-center gap-1">
                              <Check className="w-3 h-3" /> Done
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-body leading-relaxed mb-2" style={{ color: 'var(--parchment-mid)' }}>
                              "{scene.narration}"
                            </p>
                            <p className="text-xs font-body italic" style={{ color: 'rgba(201,162,39,0.25)' }}>
                              🎨 {scene.imagePrompt.slice(0, 80)}…
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action buttons per step */}
                  {step === 'script' && (
                    <div className="flex gap-2">
                      <button onClick={generateImages} disabled={loading}
                        className="glow-btn glow-btn-solid flex-1 py-3 text-sm tracking-widest flex items-center justify-center gap-2">
                        {loading
                          ? <><div className="w-4 h-4 border-2 border-t-current rounded-full animate-spin" style={{ borderColor: 'rgba(201,162,39,0.3)', borderTopColor: 'var(--gold)' }} />Generating images ({imageProgress}/{project.scenes.length})…</>
                          : <>🎨 Generate Images</>}
                      </button>
                      <button onClick={() => setStep('topic')} className="glow-btn px-4 py-3 text-xs">← Redo</button>
                    </div>
                  )}

                  {step === 'images' && (
                    <div className="flex gap-2">
                      <button onClick={generateVoice} disabled={loading}
                        className="glow-btn glow-btn-solid flex-1 py-3 text-sm tracking-widest flex items-center justify-center gap-2">
                        {loading
                          ? <><div className="w-4 h-4 border-2 border-t-current rounded-full animate-spin" style={{ borderColor: 'rgba(201,162,39,0.3)', borderTopColor: 'var(--gold)' }} />Generating voice ({voiceProgress}/{project.scenes.length})…</>
                          : <>🎙 Generate Voiceover</>}
                      </button>
                      <button onClick={generateImages} disabled={loading} className="glow-btn px-4 py-3 text-xs" title="Regenerate images">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {step === 'voice' && (
                    <div className="flex gap-2">
                      <button onClick={assembleVideo} disabled={loading}
                        className="glow-btn glow-btn-solid flex-1 py-3 text-sm tracking-widest flex items-center justify-center gap-2">
                        {loading
                          ? <><div className="w-4 h-4 border-2 border-t-current rounded-full animate-spin" style={{ borderColor: 'rgba(201,162,39,0.3)', borderTopColor: 'var(--gold)' }} />Assembling video…</>
                          : <>🎬 Assemble Video</>}
                      </button>
                      <button onClick={generateVoice} disabled={loading} className="glow-btn px-4 py-3 text-xs" title="Regenerate voice">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {(step === 'assemble' || step === 'upload') && project.videoPath && (
                    <div className="hud-panel p-4 space-y-4">
                      <h2 className="font-heading text-base" style={{ color: 'var(--gold)' }}>🎬 Your Video is Ready</h2>
                      <video controls src={project.videoPath} className="w-full rounded" style={{ maxHeight: 400 }} />
                      <div className="flex gap-2">
                        <a href={project.videoPath} download
                          className="glow-btn glow-btn-solid flex-1 py-2.5 text-sm text-center tracking-widest flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" /> Download MP4
                        </a>
                      </div>

                      <div className="neon-divider" />

                      <div>
                        <p className="text-xs font-heading tracking-widest mb-2" style={{ color: 'rgba(201,162,39,0.35)' }}>UPLOAD TO</p>
                        <div className="grid grid-cols-2 gap-2">
                          <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer"
                            className="glow-btn py-2.5 text-xs text-center tracking-widest flex items-center justify-center gap-1">
                            ▶ YouTube Studio
                          </a>
                          <a href="https://www.tiktok.com/upload" target="_blank" rel="noopener noreferrer"
                            className="glow-btn py-2.5 text-xs text-center tracking-widest flex items-center justify-center gap-1">
                            ♪ TikTok Upload
                          </a>
                        </div>
                      </div>

                      <div className="neon-divider" />

                      <div>
                        <p className="text-xs font-heading tracking-widest mb-2" style={{ color: 'rgba(201,162,39,0.35)' }}>COPY FOR UPLOAD</p>
                        <div className="space-y-2">
                          <div className="hud-panel p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-heading" style={{ color: 'rgba(201,162,39,0.4)' }}>TITLE</span>
                              <button onClick={() => { navigator.clipboard.writeText(project.title!); toast.success('Copied') }}
                                className="glow-btn px-2 py-0.5 text-xs flex items-center gap-1"><Copy className="w-3 h-3" /></button>
                            </div>
                            <p className="text-xs font-body" style={{ color: 'var(--parchment-mid)' }}>{project.title}</p>
                          </div>
                          <div className="hud-panel p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-heading" style={{ color: 'rgba(201,162,39,0.4)' }}>DESCRIPTION + HASHTAGS</span>
                              <button onClick={() => { navigator.clipboard.writeText(`${project.description}\n\n${project.hashtags?.join(' ')}`); toast.success('Copied') }}
                                className="glow-btn px-2 py-0.5 text-xs flex items-center gap-1"><Copy className="w-3 h-3" /></button>
                            </div>
                            <p className="text-xs font-body" style={{ color: 'var(--parchment-mid)' }}>{project.description}</p>
                            <p className="text-xs mt-1" style={{ color: 'rgba(201,162,39,0.4)' }}>{project.hashtags?.join(' ')}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setProject({})
                          setTopic('')
                          setStep('topic')
                        }}
                        className="glow-btn w-full py-2.5 text-xs tracking-widest flex items-center justify-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Make Another Video
                      </button>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
