import { useState, useEffect } from 'react'

export default function Flashcard({ question, onRate }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setRevealed(false)
  }, [question.id])

  if (!revealed) {
    return (
      <div className="flex flex-col items-center gap-6 px-6 w-full">
        <button onClick={() => setRevealed(true)}
          className="w-full py-5 rounded-2xl bg-brand-800 border-2 border-indigo-700 font-semibold text-indigo-300 text-lg">
          Tap to Reveal
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 px-6 w-full">
      <div className="w-full py-5 rounded-2xl bg-brand-800 text-center text-3xl font-black text-indigo-300">
        {question.answerDisplay}
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => onRate(false)}
          className="flex-1 py-4 rounded-2xl bg-red-800 active:bg-red-900 font-bold">
          ✗ Missed
        </button>
        <button onClick={() => onRate(true)}
          className="flex-1 py-4 rounded-2xl bg-green-700 active:bg-green-800 font-bold">
          ✓ Got it
        </button>
      </div>
    </div>
  )
}
