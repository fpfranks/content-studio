'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'

export default function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-end">
      <span className="neon-text text-xs font-heading tracking-widest">
        {format(time, 'HH:mm:ss')}
      </span>
      <span className="text-xs font-heading tracking-wider" style={{ color: 'rgba(201,162,39,0.3)' }}>
        {format(time, 'EEE dd MMM yyyy').toUpperCase()}
      </span>
    </div>
  )
}
