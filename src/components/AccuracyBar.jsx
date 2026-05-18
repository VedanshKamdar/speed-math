const LABELS = {
  tables: 'Tables', squares: 'Squares', cubes: 'Cubes',
  'powers-base2': 'Powers · 2', 'powers-base3': 'Powers · 3',
  'powers-base4': 'Powers · 4', 'powers-base5': 'Powers · 5',
  'powers-base6': 'Powers · 6', 'powers-base7': 'Powers · 7',
  'powers-base8': 'Powers · 8', 'powers-base9': 'Powers · 9',
  fractions: 'Fractions → %',
}

// Thin horizontal accuracy bar.
// Tier colors:  ≥80 fg · 50–79 warn · <50 wrong.
export default function AccuracyBar({ category, accuracy }) {
  const pct = Math.round((accuracy || 0) * 100)
  const color =
    pct >= 80 ? 'var(--color-fg)' :
    pct >= 50 ? 'var(--color-warn)' :
                'var(--color-wrong)'
  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12 }}>{LABELS[category] || category}</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--color-fg-muted)' }}>{pct}%</span>
      </div>
      <div
        style={{
          height: 4,
          background: 'var(--color-line)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 0.6s cubic-bezier(0.2, 0.7, 0.3, 1)',
          }}
        />
      </div>
    </div>
  )
}
