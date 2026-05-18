export default function SpeedTrendChart({ sessionSpeeds }) {
  if (!sessionSpeeds || sessionSpeeds.length < 2) {
    return <p className="text-xs text-gray-500 text-center py-4">Complete 2+ sessions to see trend</p>
  }

  const W = 300
  const H = 80
  const pad = 10
  const maxMs = Math.max(...sessionSpeeds.map(s => s.avgMs), 1)
  const pts = sessionSpeeds.map((s, i) => {
    const x = pad + (i / (sessionSpeeds.length - 1)) * (W - pad * 2)
    const y = H - pad - ((s.avgMs / maxMs) * (H - pad * 2))
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 80 }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {sessionSpeeds.map((s, i) => {
        const [x, y] = pts[i].split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r="3" fill="#818cf8" />
      })}
    </svg>
  )
}
