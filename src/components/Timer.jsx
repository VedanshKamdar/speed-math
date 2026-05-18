import { useEffect, useState, useRef } from 'react'

export default function Timer({ mode, durationSec, onExpire }) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (mode === 'sprint' && elapsed >= durationSec) {
      clearInterval(intervalRef.current)
      onExpire()
    }
  }, [elapsed, mode, durationSec, onExpire])

  const display = mode === 'sprint' ? Math.max(0, durationSec - elapsed) : elapsed
  const mm = String(Math.floor(display / 60)).padStart(2, '0')
  const ss = String(display % 60).padStart(2, '0')
  const warning = mode === 'sprint' && display <= 30

  return (
    <span className={`font-mono font-bold text-lg ${warning ? 'text-red-400' : 'text-indigo-300'}`}>
      {mm}:{ss}
    </span>
  )
}
