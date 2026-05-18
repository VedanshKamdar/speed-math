import { useEffect, useState } from 'react'
import { IconCheck, IconX } from './Icons'

// Soft, edge-only flash + a tight badge near center.
// Triggers a haptic pulse where supported. Same prop signature as before.
export default function FeedbackFlash({ result, correctAnswer, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    // Light haptic — correct = single tap, wrong = double pulse
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(result ? 18 : [12, 60, 12])
    }
    const t = setTimeout(() => { setVisible(false); onDone() }, result ? 700 : 1300)
    return () => clearTimeout(t)
  }, [result, onDone])

  if (!visible) return null

  const accent = result ? 'var(--color-correct)' : 'var(--color-wrong)'

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
      style={{
        // edge-only glow — no harsh full-screen tint
        background: `radial-gradient(120% 70% at 50% 50%, transparent 40%, color-mix(in oklab, ${accent} 18%, transparent) 100%)`,
        animation: `${result ? 'flash-correct' : 'flash-wrong'} ${result ? 0.7 : 1.3}s ease-out forwards`,
      }}
    >
      <div
        className="fade-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: '50%',
            border: `1.5px solid ${accent}`,
            background: `color-mix(in oklab, ${accent} 18%, transparent)`,
            color: accent,
            display: 'grid', placeItems: 'center',
          }}
        >
          {result ? <IconCheck size={28} sw={2.2} /> : <IconX size={26} sw={2.2} />}
        </div>
        {!result && (
          <span
            className="num"
            style={{
              fontSize: 36,
              color: 'var(--color-fg)',
              letterSpacing: '-0.02em',
            }}
          >
            {correctAnswer}
          </span>
        )}
        {!result && (
          <span
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-fg-muted)',
            }}
          >
            answer
          </span>
        )}
      </div>
    </div>
  )
}
