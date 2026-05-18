import { NavLink } from 'react-router-dom'
import { IconHome, IconChart, IconBook } from './Icons'

const tabs = [
  { to: '/',          end: true,  label: 'Practice', Icon: IconHome },
  { to: '/stats',     end: false, label: 'Stats',    Icon: IconChart },
  { to: '/reference', end: false, label: 'Sheet',    Icon: IconBook },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center pb-1.5 pt-1"
      style={{
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-line)',
        // safe-area for notch phones
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
        height: 'calc(56px + env(safe-area-inset-bottom))',
      }}
    >
      {tabs.map(({ to, end, label, Icon }) => (
        <NavLink key={to} to={to} end={end}>
          {({ isActive }) => (
            <span
              className="flex flex-col items-center gap-[3px] px-4"
              style={{
                color: isActive ? 'var(--color-fg)' : 'var(--color-fg-dim)',
                fontSize: 10,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              <Icon size={20} sw={isActive ? 1.8 : 1.4} />
              <span>{label}</span>
              <span
                style={{
                  width: 4, height: 4, borderRadius: 2,
                  background: 'var(--color-accent)',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.2s',
                }}
              />
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
