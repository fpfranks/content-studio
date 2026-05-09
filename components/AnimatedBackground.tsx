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

    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = []

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: Math.random() * 200,
        maxLife: 150 + Math.random() * 100,
      })
    }

    let frame = 0
    let animId: number

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.life++

        if (p.life > p.maxLife || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          particles[i] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            life: 0,
            maxLife: 150 + Math.random() * 100,
          }
          return
        }

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.5
        const size = 1 + Math.sin((p.life / p.maxLife) * Math.PI) * 1.5

        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 255, 200, ${alpha})`
        ctx.fill()

        ctx.shadowBlur = 6
        ctx.shadowColor = 'rgba(0, 255, 200, 0.5)'
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.08
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 255, 200, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Horizontal data lines
      if (frame % 120 === 0) {
        const y = Math.random() * canvas.height
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width * Math.random(), y)
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.15)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
    />
  )
}
