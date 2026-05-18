import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StreakBadge from '../components/StreakBadge'
import { getMeta } from '../db/index'

export default function Home() {
  const [streak, setStreak] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    getMeta('streak').then(s => setStreak(s?.count || 0))
  }, [])

  return (
    <div className="flex flex-col items-center px-6 pt-12 gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Speed Math</h1>

      <StreakBadge count={streak} />

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={() => navigate('/session/setup', { state: { mode: 'sprint' } })}
          className="w-full py-4 rounded-2xl bg-indigo-600 active:bg-indigo-700 font-semibold text-lg"
        >
          ⚡ Sprint
        </button>
        <button
          onClick={() => navigate('/session/setup', { state: { mode: 'fixed' } })}
          className="w-full py-4 rounded-2xl bg-violet-700 active:bg-violet-800 font-semibold text-lg"
        >
          📝 Fixed Count
        </button>
        <button
          onClick={() => navigate('/session/setup', { state: { mode: 'topic' } })}
          className="w-full py-4 rounded-2xl bg-purple-800 active:bg-purple-900 font-semibold text-lg"
        >
          🎯 Topic Drill
        </button>
      </div>

      <button
        onClick={() => navigate('/reference')}
        className="text-indigo-400 underline underline-offset-2 text-sm"
      >
        View Reference Sheet
      </button>
    </div>
  )
}
