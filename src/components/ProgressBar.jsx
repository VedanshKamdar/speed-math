export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 h-2 bg-brand-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{current} / {total}</span>
    </div>
  )
}
