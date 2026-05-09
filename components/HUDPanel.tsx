'use client'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface HUDPanelProps {
  title?: string
  children: React.ReactNode
  className?: string
  tag?: string
  noPad?: boolean
  delay?: number
}

export default function HUDPanel({ title, children, className, tag, noPad, delay = 0 }: HUDPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={clsx('hud-panel', className)}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'rgba(201,162,39,0.12)' }}>
          <div className="flex items-center gap-2">
            <span className="status-dot online" />
            <span className="text-xs font-heading tracking-widest uppercase" style={{ color: 'rgba(201,162,39,0.55)' }}>{title}</span>
          </div>
          {tag && <span className="neon-tag">{tag}</span>}
        </div>
      )}
      <div className={noPad ? '' : 'p-4'}>
        {children}
      </div>
    </motion.div>
  )
}
