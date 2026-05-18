import { useState, useEffect } from 'react'
import { getAttempts, getSessions, getMeta } from '../db/index'
import { computeStats } from '../stats/compute'

export function useStats() {
  const [stats, setStats] = useState(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [attempts, sessions, streakMeta] = await Promise.all([
        getAttempts(),
        getSessions(),
        getMeta('streak'),
      ])
      setStats(computeStats(attempts, sessions.filter(s => s.completed)))
      setStreak(streakMeta?.count || 0)
      setLoading(false)
    }
    load()
  }, [])

  return { stats, streak, loading }
}
