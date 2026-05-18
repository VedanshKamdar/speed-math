import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StreakBadge from '../components/StreakBadge'
import { getMeta } from '../db/index'
import { IconArrowRight, IconMoon, IconSun, IconChevron } from '../components/Icons'
import { useTheme } from '../hooks/useTheme'

const MODES = [
  { mode: 'sprint', eyebrow: 'Mode 01', title: 'Sprint',      sub: 'Answer as many as you can before the clock runs out.' },
  { mode: 'fixed',  eyebrow: 'Mode 02', title: 'Fixed count', sub: 'A defined set. Track accuracy + average time.' },
  { mode: 'topic',  eyebrow: 'Mode 03', title: 'Topic drill', sub: 'Pick one category. Drill until exhausted.' },
]

function dayString() {
  const d = new Date()
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Late night.'
  if (h < 12) return 'Good morning.'
  if (h < 17) return 'Good afternoon.'
  if (h < 21) return 'Good evening.'
  return 'Good night.'
}

export default function Home() {
  const [streak, setStreak] = useState(0)
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    getMeta('streak').then((s) => setStreak(s?.count || 0))
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ padding: '8px 20px 0' }}>
      {/* Top row */}
      <header className="flex justify-between items-center" style={{ paddingTop: 6 }}>
        <div>
          <div className="eyebrow">{dayString()}</div>
          <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, marginTop: 2 }}>
            {greeting()}
          </div>
        </div>
        <button className="icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>
          {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>
      </header>

      {/* Streak hero */}
      <section style={{ marginTop: 28 }}>
        <StreakBadge count={streak} />
      </section>

      {/* Mode list */}
      <section style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MODES.map(({ mode, eyebrow, title, sub }) => (
          <button
            key={mode}
            onClick={() => navigate('/session/setup', { state: { mode } })}
            className="card fade-up text-left"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onPointerDown={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
            onPointerUp={(e)   => { e.currentTarget.style.borderColor = 'var(--color-line)' }}
            onPointerLeave={(e)=> { e.currentTarget.style.borderColor = 'var(--color-line)' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ fontSize: 9.5 }}>{eyebrow}</div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.05, marginTop: 2 }}>
                {title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginTop: 4, lineHeight: 1.35 }}>
                {sub}
              </div>
            </div>
            <div
              style={{
                width: 36, height: 36, borderRadius: 18,
                border: '1px solid var(--color-line-2)',
                display: 'grid', placeItems: 'center',
                flex: '0 0 36px',
              }}
            >
              <IconArrowRight size={16} />
            </div>
          </button>
        ))}
      </section>

      <div style={{ flex: 1 }} />

      {/* Footer / reference */}
      <footer
        className="flex justify-between items-center"
        style={{ padding: '12px 0 16px' }}
      >
        <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>
          617 questions · stored offline
        </span>
        <button
          onClick={() => navigate('/reference')}
          className="icon-btn"
          style={{ width: 'auto', padding: '0 10px', gap: 6, display: 'flex', alignItems: 'center' }}
        >
          <span style={{ fontSize: 12, fontWeight: 500 }}>Reference</span>
          <IconChevron size={14} />
        </button>
      </footer>
    </div>
  )
}
