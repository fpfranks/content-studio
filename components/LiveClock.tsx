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
      <span className="neon-text text-xs font-mono tracking-widest">
        {format(time, 'HH:mm:ss')}
      </span>
      <span className="text-xs text-neon-cyan/40 tracking-wider">
        {format(time, 'EEE dd MMM yyyy').toUpperCase()}
      </span>
    </div>
  )
}
