// Streak badge — big serif numeral + label, with a 14-day strip below.
// Pass an optional `history` array of booleans (true = practiced) for the strip.
export default function StreakBadge({ count, history }) {
  const days = history && history.length >= 14
    ? history.slice(-14)
    : Array.from({ length: 14 }, (_, i) => i < count)

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div className="flex items-baseline gap-3">
        <span className="num" style={{ fontSize: 88, lineHeight: 0.9 }}>{count}</span>
        <div className="flex flex-col" style={{ paddingBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>day streak</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>
            keep it going
          </span>
        </div>
      </div>
      <div className="flex w-full" style={{ gap: 4, marginTop: 4 }}>
        {days.map((on, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 1,
              background: on ? 'var(--color-accent)' : 'var(--color-line-2)',
              opacity: on ? (0.45 + i * 0.04) : 1,
            }}
          />
        ))}
      </div>
    </div>
  )
}
