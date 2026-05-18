import { useNavigate } from 'react-router-dom'
import { QUESTION_BANK, CATEGORIES } from '../data/questionBank'

const CATEGORY_LABELS = {
  tables: 'Tables (1–25 × 1–20)',
  squares: 'Perfect Squares (1²–25²)',
  cubes: 'Perfect Cubes (1³–12³)',
  'powers-base2': 'Powers of 2 (2¹–2¹⁵)',
  'powers-base3': 'Powers of 3 (3¹–3⁸)',
  'powers-base4': 'Powers of 4 (4¹–4⁶)',
  'powers-base5': 'Powers of 5 (5¹–5⁵)',
  'powers-base6': 'Powers of 6 (6¹–6⁴)',
  'powers-base7': 'Powers of 7 (7¹–7⁴)',
  'powers-base8': 'Powers of 8 (8¹–8⁴)',
  'powers-base9': 'Powers of 9 (9¹–9⁴)',
  fractions: 'Fractions → % (1/1–1/30)',
}

export default function ReferenceSheet() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col px-4 pt-8 pb-8 gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-indigo-400 text-lg">← Back</button>
        <h2 className="text-xl font-bold">Reference Sheet</h2>
      </div>

      {CATEGORIES.map(cat => {
        const questions = QUESTION_BANK.filter(q => q.category === cat)
        return (
          <div key={cat} className="bg-brand-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-indigo-300 mb-3">{CATEGORY_LABELS[cat]}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {questions.map(q => (
                <div key={q.id} className="flex justify-between text-sm font-mono">
                  <span className="text-gray-300">{q.prompt}</span>
                  <span className="text-indigo-400 font-bold">{q.answerDisplay}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
