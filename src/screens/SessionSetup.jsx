import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CATEGORIES, TABLE_SUBCATEGORIES } from '../data/questionBank'
import { buildSession } from '../engine/session'
import { saveSession } from '../db/index'

const CATEGORY_LABELS = {
  tables: 'Tables',
  squares: 'Squares',
  cubes: 'Cubes',
  'powers-base2': 'Powers (Base 2)',
  'powers-base3': 'Powers (Base 3)',
  'powers-base4': 'Powers (Base 4)',
  'powers-base5': 'Powers (Base 5)',
  'powers-base6': 'Powers (Base 6)',
  'powers-base7': 'Powers (Base 7)',
  'powers-base8': 'Powers (Base 8)',
  'powers-base9': 'Powers (Base 9)',
  fractions: 'Fractions → %',
}

export default function SessionSetup() {
  const { state } = useLocation()
  const mode = state?.mode || 'sprint'
  const navigate = useNavigate()

  const [selectedCats, setSelectedCats] = useState(CATEGORIES)
  const [duration, setDuration] = useState(300)
  const [count, setCount] = useState(20)
  const [subcategory, setSubcategory] = useState(null)

  function toggleCat(cat) {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function startSession() {
    if (selectedCats.length === 0) return
    const session = buildSession({
      mode,
      categories: selectedCats,
      durationSec: mode === 'sprint' ? duration : null,
      count: mode === 'fixed' ? count : null,
      subcategory: mode === 'topic' ? subcategory : null,
    })
    await saveSession({ id: session.id, mode: session.mode, categories: session.categories, date: session.date, startTime: session.startTime, durationSec: session.durationSec, completed: false })
    navigate('/session/active', { state: { session } })
  }

  return (
    <div className="flex flex-col px-6 pt-10 gap-6 pb-8">
      <button onClick={() => navigate(-1)} className="text-indigo-400 text-sm self-start">← Back</button>
      <h2 className="text-xl font-bold capitalize">{mode} Setup</h2>

      {mode === 'sprint' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Duration</label>
          <div className="flex gap-2">
            {[300, 600, 900].map(s => (
              <button key={s} onClick={() => setDuration(s)}
                className={`flex-1 py-3 rounded-xl font-semibold ${duration === s ? 'bg-indigo-600' : 'bg-brand-800'}`}>
                {s / 60} min
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'fixed' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Questions</label>
          <div className="flex gap-2">
            {[10, 20, 30, 50].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`flex-1 py-3 rounded-xl font-semibold ${count === n ? 'bg-indigo-600' : 'bg-brand-800'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'topic' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Table range (optional)</label>
          <div className="flex gap-2 flex-wrap">
            {[null, ...TABLE_SUBCATEGORIES].map(s => (
              <button key={String(s)} onClick={() => setSubcategory(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${subcategory === s ? 'bg-indigo-600' : 'bg-brand-800'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Topics</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => toggleCat(cat)}
              className={`py-3 rounded-xl text-sm font-medium text-left px-3 ${selectedCats.includes(cat) ? 'bg-indigo-700 text-white' : 'bg-brand-800 text-gray-400'}`}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <button onClick={startSession} disabled={selectedCats.length === 0}
        className="w-full py-4 rounded-2xl bg-indigo-600 disabled:opacity-40 font-bold text-lg mt-2">
        Start →
      </button>
    </div>
  )
}
