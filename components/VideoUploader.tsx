'use client'
import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Film, X, CheckCircle, AlertCircle } from 'lucide-react'
import HUDPanel from './HUDPanel'

interface VideoFile {
  file: File
  url: string
  name: string
  size: string
  duration?: number
  resolution?: string
  fps?: string
}

interface Props {
  onVideoReady: (v: VideoFile) => void
  video: VideoFile | null
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default function VideoUploader({ onVideoReady, video }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    setLoading(true)
    setError('')
    const url = URL.createObjectURL(file)
    const vid = document.createElement('video')
    vid.src = url
    vid.onloadedmetadata = () => {
      const mins = Math.floor(vid.duration / 60)
      const secs = Math.floor(vid.duration % 60)
      onVideoReady({
        file,
        url,
        name: file.name,
        size: formatBytes(file.size),
        duration: vid.duration,
        resolution: `${vid.videoWidth}×${vid.videoHeight}`,
        fps: '–',
      })
      setLoading(false)
    }
    vid.onerror = () => {
      setError('Could not read video. Try a different format.')
      setLoading(false)
    }
  }, [onVideoReady])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'] },
    maxFiles: 1,
  })

  return (
    <div className="space-y-4">
      <HUDPanel title="Video Import" tag="UPLOAD">
        <AnimatePresence mode="wait">
          {!video ? (
            <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-sm cursor-pointer
                flex flex-col items-center justify-center gap-3 p-12
                transition-all duration-300
                ${isDragActive
                  ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_30px_rgba(0,255,200,0.2)]'
                  : 'border-neon-cyan/20 hover:border-neon-cyan/40 hover:bg-neon-cyan/5'
                }
              `}
            >
              <input {...getInputProps()} />
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                  <span className="text-xs text-neon-cyan/60">Analysing video…</span>
                </div>
              ) : (
                <>
                  <div className={`p-4 rounded-sm border ${isDragActive ? 'border-neon-cyan bg-neon-cyan/20' : 'border-neon-cyan/20'}`}>
                    <Upload className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <div className="text-center">
                    <p className="text-neon-cyan text-sm font-mono">
                      {isDragActive ? 'DROP TO IMPORT' : 'DRAG & DROP VIDEO'}
                    </p>
                    <p className="text-neon-cyan/40 text-xs mt-1">MP4 · MOV · MKV · WEBM — up to 4K</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['MP4', 'MOV', 'MKV', 'WEBM', 'AVI'].map(f => (
                      <span key={f} className="neon-tag">{f}</span>
                    ))}
                  </div>
                </>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative rounded-sm overflow-hidden bg-black border border-neon-cyan/10">
                <video
                  ref={videoRef}
                  src={video.url}
                  controls
                  className="w-full max-h-[360px] object-contain"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="neon-tag">{video.resolution}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'FILE', value: video.name.split('.').pop()?.toUpperCase() },
                  { label: 'SIZE', value: video.size },
                  { label: 'RESOLUTION', value: video.resolution },
                  { label: 'DURATION', value: video.duration ? `${Math.floor(video.duration / 60)}m ${Math.floor(video.duration % 60)}s` : '–' },
                ].map(stat => (
                  <div key={stat.label} className="hud-panel p-3 text-center">
                    <div className="text-neon-cyan/40 text-xs mb-1">{stat.label}</div>
                    <div className="text-neon-cyan text-sm font-mono">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onVideoReady(video)}
                  className="glow-btn glow-btn-solid flex-1 py-2 text-xs tracking-widest"
                >
                  ✓ USE THIS VIDEO
                </button>
                <button
                  onClick={() => { onVideoReady(null as any); }}
                  className="glow-btn glow-btn-purple px-4 py-2 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </HUDPanel>

      {video && (
        <HUDPanel title="Quick Tools" delay={0.1}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '✂', label: 'Trim / Cut', desc: 'Set in/out points' },
              { icon: '↕', label: 'Crop to Shorts', desc: '9:16 vertical for TikTok & Shorts' },
              { icon: '⬆', label: 'Upscale', desc: 'AI enhance to 4K' },
              { icon: '🎞', label: 'Add Captions', desc: 'Burn subtitles to video' },
              { icon: '🎵', label: 'Replace Audio', desc: 'Swap background music' },
              { icon: '🎨', label: 'Colour Grade', desc: 'Cinematic LUT apply' },
            ].map(tool => (
              <button
                key={tool.label}
                className="hud-panel p-3 text-left hover:border-neon-cyan/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{tool.icon}</span>
                  <span className="text-neon-cyan/80 text-xs font-mono group-hover:text-neon-cyan transition-colors">{tool.label}</span>
                </div>
                <p className="text-neon-cyan/30 text-xs">{tool.desc}</p>
              </button>
            ))}
          </div>
          <p className="text-neon-cyan/25 text-xs mt-3 text-center">Advanced editing — powered by FFmpeg (requires setup)</p>
        </HUDPanel>
      )}
    </div>
  )
}
