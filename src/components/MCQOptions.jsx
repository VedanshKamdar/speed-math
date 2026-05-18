// 2×2 grid of large MCQ cards. Each card shows letter (A/B/C/D) + the answer
// in display-serif. Disabled state dims everything.
export default function MCQOptions({ options, onSelect, disabled }) {
  return (
    <div
      className="grid grid-cols-2"
      style={{ gap: 10, padding: '0 20px', width: '100%' }}
    >
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => !disabled && onSelect(opt)}
          disabled={disabled}
          style={{
            padding: '16px 18px',
            borderRadius: 14,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            color: 'var(--color-fg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'border-color 0.12s, background 0.12s, transform 0.05s',
          }}
          onPointerDown={(e) => {
            if (disabled) return
            e.currentTarget.style.borderColor = 'var(--color-accent)'
            e.currentTarget.style.background = 'var(--color-accent-soft)'
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-line)'
            e.currentTarget.style.background = 'var(--color-surface)'
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-line)'
            e.currentTarget.style.background = 'var(--color-surface)'
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'var(--color-fg-dim)',
              textTransform: 'uppercase',
            }}
          >
            {'ABCD'[i]}
          </span>
          <span className="num" style={{ fontSize: 26 }}>{opt.answerDisplay}</span>
        </button>
      ))}
    </div>
  )
}
