import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  const base = 'flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors'
  const active = 'text-indigo-400'
  const inactive = 'text-gray-500'

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-brand-800 border-t border-indigo-900">
      <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl mb-1">⚡</span>
        Practice
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl mb-1">📊</span>
        Stats
      </NavLink>
    </nav>
  )
}
