'use client'
import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    type Ember = { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; bright: boolean }

    const embers: Ember[] = []

    function spawn(): Ember {
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.4 + Math.random() * 0.8),
        size: 0.8 + Math.random() * 2.2,
        life: 0,
        maxLife: 120 + Math.random() * 180,
        bright: Math.random() > 0.8,
      }
    }

    for (let i = 0; i < 50; i++) {
      const e = spawn()
      e.y = Math.random() * canvas.height
      e.life = Math.random() * e.maxLife
      embers.push(e)
    }

    let animId: number

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (Math.random() > 0.7 && embers.length < 80) embers.push(spawn())

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]
        e.x += e.vx + Math.sin(e.life * 0.03) * 0.3
        e.y += e.vy
        e.life++

        if (e.life > e.maxLife || e.y < -20) {
          embers.splice(i, 1)
          continue
        }

        const progress = e.life / e.maxLife
        const alpha = Math.sin(progress * Math.PI) * (e.bright ? 0.9 : 0.45)
        const flicker = e.bright ? 0.7 + Math.sin(e.life * 0.3) * 0.3 : 1

        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3)
        if (e.bright) {
          grad.addColorStop(0, `rgba(255, 220, 80, ${alpha * flicker})`)
          grad.addColorStop(0.4, `rgba(255, 130, 20, ${alpha * 0.6 * flicker})`)
          grad.addColorStop(1, 'rgba(180, 60, 0, 0)')
        } else {
          grad.addColorStop(0, `rgba(220, 140, 30, ${alpha})`)
          grad.addColorStop(0.5, `rgba(180, 80, 10, ${alpha * 0.5})`)
          grad.addColorStop(1, 'rgba(140, 40, 0, 0)')
        }

        ctx.beginPath()
        ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(e.x, e.y, e.size * flicker, 0, Math.PI * 2)
        ctx.fillStyle = e.bright
          ? `rgba(255, 240, 120, ${alpha * flicker})`
          : `rgba(220, 160, 40, ${alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.65 }} />
  )
}
