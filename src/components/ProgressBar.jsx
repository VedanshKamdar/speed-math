// Hairline dotted progress strip — one segment per question, filled left-to-right.
// Falls back to ~24 segments if total is huge.
export default function ProgressBar({ current, total }) {
  const segments = Math.min(total, 28)
  const filled = total > 0 ? Math.round((current / total) * segments) : 0
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 flex" style={{ gap: 3 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 2,
              borderRadius: 1,
              background: i < filled ? 'var(--color-fg)' : 'var(--color-line)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <span
        className="mono"
        style={{
          color: 'var(--color-fg-muted)',
          fontSize: 11,
          whiteSpace: 'nowrap',
        }}
      >
        {current}/{total}
      </span>
    </div>
  )
}
