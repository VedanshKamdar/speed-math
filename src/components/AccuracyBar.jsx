const LABELS = {
  tables: 'Tables', squares: 'Squares', cubes: 'Cubes',
  'powers-base2': 'Base 2', 'powers-base3': 'Base 3',
  'powers-base4': 'Base 4', 'powers-base5': 'Base 5',
  'powers-base6': 'Base 6', 'powers-base7': 'Base 7',
  'powers-base8': 'Base 8', 'powers-base9': 'Base 9',
  fractions: 'Fractions',
}

export default function AccuracyBar({ category, accuracy }) {
  const pct = Math.round((accuracy || 0) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20 shrink-0">{LABELS[category] || category}</span>
      <div className="flex-1 h-3 bg-brand-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444',
          }}
        />
      </div>
      <span className="text-xs text-gray-300 w-10 text-right">{pct}%</span>
    </div>
  )
}
