import { useState, useEffect } from 'react'
import { IconCheck, IconX } from './Icons'

export default function Flashcard({ question, onRate }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => { setRevealed(false) }, [question.id])

  return (
    <div className="flex flex-col gap-3 w-full" style={{ padding: '0 20px' }}>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="btn-ghost" style={{ height: 70 }}>
          Tap to reveal
        </button>
      ) : (
        <>
          <div
            className="num fade-up"
            style={{
              width: '100%',
              padding: '22px 12px',
              textAlign: 'center',
              fontSize: 56,
              lineHeight: 1.1,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-line)',
              color: 'var(--color-accent)',
              borderRadius: 16,
            }}
          >
            {question.answerDisplay}
          </div>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onRate(false)}
              className="btn-ghost"
              style={{
                color: 'var(--color-wrong)',
                borderColor: 'color-mix(in oklab, var(--color-wrong) 40%, transparent)',
              }}
            >
              <IconX size={16} sw={2} /> Missed
            </button>
            <button
              onClick={() => onRate(true)}
              className="btn-primary"
              style={{ background: 'var(--color-correct)', color: '#0d0f1a' }}
            >
              <IconCheck size={16} sw={2} /> Got it
            </button>
          </div>
        </>
      )}
    </div>
  )
}
