export default function SpeedTrendChart({ sessionSpeeds }) {
  if (!sessionSpeeds || sessionSpeeds.length < 2) {
    return (
      <p style={{ fontSize: 12, color: 'var(--color-fg-dim)', textAlign: 'center', padding: '20px 0' }}>
        Complete 2+ sessions to see trend
      </p>
    )
  }

  // Layout
  const VW = 300, VH = 96
  const L = 30, R = 300, T = 6, B = 76   // chart area bounds (bottom leaves room for x labels)
  const CW = R - L, CH = B - T

  const values = sessionSpeeds.map(s => s.avgMs / 1000)
  const rawMax = Math.max(...values)
  const rawMin = Math.min(...values)
  const range  = (rawMax - rawMin) || 1
  const max    = rawMax + range * 0.08
  const min    = rawMin - range * 0.08

  const x = i => L + (i / (values.length - 1)) * CW
  const y = v => T + (1 - (v - min) / (max - min)) * CH

  const linePath  = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const areaPath  = `${linePath} L ${x(values.length - 1).toFixed(1)} ${B} L ${x(0).toFixed(1)} ${B} Z`
  const lastI     = values.length - 1
  const lastX     = x(lastI)
  const lastY     = y(values[lastI])
  const lastLabel = values[lastI].toFixed(1) + 's'

  function fmtDate(iso) {
    if (!iso) return ''
    const [, m, d] = iso.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`
  }

  const firstDate = fmtDate(sessionSpeeds[0]?.date)
  const lastDate  = fmtDate(sessionSpeeds[lastI]?.date)

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="speed-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--color-accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill="url(#speed-area)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-fg)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots */}
      {values.map((v, i) => (
        <circle
          key={i}
          cx={x(i)} cy={y(v)}
          r={i === lastI ? 3 : 1.2}
          fill={i === lastI ? 'var(--color-bg)' : 'var(--color-fg)'}
          stroke={i === lastI ? 'var(--color-accent)' : 'none'}
          strokeWidth="1.6"
        />
      ))}

      {/* Last-point value label */}
      <text
        x={lastX}
        y={lastY - 7}
        textAnchor={lastI === 0 ? 'start' : lastX > R - 28 ? 'end' : 'middle'}
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="var(--color-accent)"
        fontWeight="600"
      >
        {lastLabel}
      </text>

      {/* Y-axis: max (top) */}
      <text
        x={L - 4} y={T + 4}
        textAnchor="end"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="var(--color-fg-dim)"
      >
        {rawMax.toFixed(1)}s
      </text>

      {/* Y-axis: min (bottom) */}
      <text
        x={L - 4} y={B}
        textAnchor="end"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="var(--color-fg-dim)"
      >
        {rawMin.toFixed(1)}s
      </text>

      {/* X-axis: first date */}
      <text
        x={L} y={VH}
        textAnchor="start"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="var(--color-fg-dim)"
      >
        {firstDate}
      </text>

      {/* X-axis: last date (only if different from first) */}
      {firstDate !== lastDate && (
        <text
          x={R} y={VH}
          textAnchor="end"
          fontSize="9"
          fontFamily="var(--font-mono)"
          fill="var(--color-fg-dim)"
        >
          {lastDate}
        </text>
      )}
    </svg>
  )
}
