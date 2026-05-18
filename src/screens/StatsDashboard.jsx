import { useStats } from '../hooks/useStats'
import AccuracyBar from '../components/AccuracyBar'
import SpeedTrendChart from '../components/SpeedTrendChart'
import { CATEGORIES } from '../data/questionBank'

export default function StatsDashboard() {
  const { stats, streak, loading } = useStats()

  if (loading) {
    return <div className="flex items-center justify-center pt-20 text-gray-400">Loading…</div>
  }

  return (
    <div className="flex flex-col px-6 pt-10 gap-6 pb-8">
      <h2 className="text-2xl font-bold">Stats</h2>

      <div className="bg-brand-800 rounded-2xl p-4 text-center">
        <p className="text-4xl font-black text-indigo-400">{streak}</p>
        <p className="text-sm text-gray-400 mt-1">day streak 🔥</p>
      </div>

      <div className="bg-brand-800 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-400 mb-3">Speed Trend (avg s/question)</p>
        <SpeedTrendChart sessionSpeeds={stats?.sessionSpeeds || []} />
      </div>

      <div className="bg-brand-800 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-400">Accuracy by Topic</p>
        {CATEGORIES.map(cat => (
          <AccuracyBar key={cat} category={cat} accuracy={stats?.categoryAccuracy[cat] || 0} />
        ))}
      </div>

      {stats?.weakestQuestions?.length > 0 && (
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-3">Weakest Questions (3+ attempts)</p>
          <ul className="flex flex-col gap-2">
            {stats.weakestQuestions.map(q => (
              <li key={q.questionId} className="flex justify-between text-sm">
                <span className="font-mono text-red-300">{q.questionId}</span>
                <span className="text-gray-400">{Math.round(q.accuracy * 100)}% ({q.attempts} tries)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
