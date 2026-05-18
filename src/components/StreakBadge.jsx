export default function StreakBadge({ count }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-5xl font-black text-indigo-400">{count}</span>
      <span className="text-sm text-gray-400 mt-1">day streak 🔥</span>
    </div>
  )
}
