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
      className={clsx('hud-panel rounded-sm', className)}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-neon-cyan/10">
          <div className="flex items-center gap-2">
            <span className="status-dot online" />
            <span className="text-xs text-neon-cyan/60 tracking-widest uppercase font-mono">{title}</span>
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
