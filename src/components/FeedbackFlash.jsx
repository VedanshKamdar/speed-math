import { useEffect, useState } from 'react'

export default function FeedbackFlash({ result, correctAnswer, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => { setVisible(false); onDone() }, 1200)
    return () => clearTimeout(t)
  }, [result])

  if (!visible) return null

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 pointer-events-none ${result ? 'bg-green-900/60' : 'bg-red-900/60'}`}>
      <span className="text-6xl">{result ? '✓' : '✗'}</span>
      {!result && (
        <span className="text-2xl font-bold mt-3 text-white">{correctAnswer}</span>
      )}
    </div>
  )
}
