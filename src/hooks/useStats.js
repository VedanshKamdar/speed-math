import { useState, useEffect, useCallback } from 'react'
import { getAttempts, getSessions, getMeta } from '../db/index'
import { computeStats } from '../stats/compute'

export function useStats() {
  const [stats, setStats] = useState(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [attempts, sessions, streakMeta] = await Promise.all([
      getAttempts(),
      getSessions(),
      getMeta('streak'),
    ])
    setStats(computeStats(attempts, sessions.filter(s => s.completed)))
    setStreak(streakMeta?.count || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    // Reload whenever the tab regains focus (e.g. returning from a session)
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  return { stats, streak, loading }
}
