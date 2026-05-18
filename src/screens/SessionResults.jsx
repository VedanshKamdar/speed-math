import { useLocation, useNavigate } from 'react-router-dom'

export default function SessionResults() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { attempts = [], session } = state || {}

  const correct = attempts.filter(a => a.correct).length
  const total = attempts.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const avgSpeed = total > 0
    ? Math.round(attempts.reduce((s, a) => s + a.timeTakenMs, 0) / total / 100) / 10
    : 0

  const byQ = {}
  for (const a of attempts) {
    if (!byQ[a.questionId]) byQ[a.questionId] = { correct: 0, total: 0 }
    byQ[a.questionId].total++
    if (a.correct) byQ[a.questionId].correct++
  }
  const weakSpots = Object.entries(byQ)
    .map(([qid, d]) => ({ qid, accuracy: d.correct / d.total }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map(w => w.qid)

  return (
    <div className="flex flex-col px-6 pt-10 gap-6">
      <h2 className="text-2xl font-bold text-center">Session Done 🎉</h2>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-2xl font-black text-indigo-400">{correct}/{total}</p>
          <p className="text-xs text-gray-400 mt-1">Correct</p>
        </div>
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-2xl font-black text-indigo-400">{accuracy}%</p>
          <p className="text-xs text-gray-400 mt-1">Accuracy</p>
        </div>
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-2xl font-black text-indigo-400">{avgSpeed}s</p>
          <p className="text-xs text-gray-400 mt-1">Avg Speed</p>
        </div>
      </div>

      {weakSpots.length > 0 && (
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-2">Weak Spots This Session</p>
          <ul className="flex flex-col gap-1">
            {weakSpots.map(qid => (
              <li key={qid} className="text-sm text-red-300 font-mono">{qid}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button
          onClick={() => navigate('/session/setup', { state: { mode: session?.mode || 'sprint' } })}
          className="flex-1 py-4 rounded-2xl bg-brand-800 font-semibold"
        >
          Retry
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-4 rounded-2xl bg-indigo-600 font-semibold"
        >
          Home
        </button>
      </div>
    </div>
  )
}
