// Hairline speed-trend line with an accented endpoint and a subtle area fill.
export default function SpeedTrendChart({ sessionSpeeds }) {
  if (!sessionSpeeds || sessionSpeeds.length < 2) {
    return (
      <p
        style={{
          fontSize: 12,
          color: 'var(--color-fg-dim)',
          textAlign: 'center',
          padding: '20px 0',
        }}
      >
        Complete 2+ sessions to see trend
      </p>
    )
  }

  const W = 280, H = 70, pad = 6
  const values = sessionSpeeds.map(s => s.avgMs / 1000) // seconds
  const max = Math.max(...values) * 1.05
  const min = Math.min(...values) * 0.95
  const range = max - min || 1

  const x = (i) => pad + (i / (values.length - 1)) * (W - pad * 2)
  const y = (v) => pad + (1 - (v - min) / range) * (H - pad * 2)

  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${d} L ${x(values.length - 1).toFixed(1)} ${H - pad} L ${x(0).toFixed(1)} ${H - pad} Z`
  const lastI = values.length - 1

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="speed-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--color-accent)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#speed-area)" />
      <path
        d={d}
        fill="none"
        stroke="var(--color-fg)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={x(i)} cy={y(v)}
          r={i === lastI ? 3 : 1.2}
          fill={i === lastI ? 'var(--color-bg)' : 'var(--color-fg)'}
          stroke={i === lastI ? 'var(--color-fg)' : 'none'}
          strokeWidth="1.4"
        />
      ))}
    </svg>
  )
}
