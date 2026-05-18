import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CATEGORIES, TABLE_SUBCATEGORIES } from '../data/questionBank'
import { buildSession } from '../engine/session'
import { saveSession } from '../db/index'
import { IconArrowLeft, IconArrowRight } from '../components/Icons'

const CATEGORY_LABELS = {
  tables: 'Tables',
  squares: 'Squares',
  cubes: 'Cubes',
  'powers-base2': 'Powers · 2',
  'powers-base3': 'Powers · 3',
  'powers-base4': 'Powers · 4',
  'powers-base5': 'Powers · 5',
  'powers-base6': 'Powers · 6',
  'powers-base7': 'Powers · 7',
  'powers-base8': 'Powers · 8',
  'powers-base9': 'Powers · 9',
  fractions: 'Fractions → %',
}

const MODE_TITLES = {
  sprint: 'How long today?',
  fixed:  'How many questions?',
  topic:  'Which topic?',
}

const MODE_EYEBROWS = {
  sprint: 'Setup · Sprint',
  fixed:  'Setup · Fixed count',
  topic:  'Setup · Topic drill',
}

export default function SessionSetup() {
  const { state } = useLocation()
  const mode = state?.mode || 'sprint'
  const navigate = useNavigate()

  const [selectedCats, setSelectedCats] = useState(CATEGORIES)
  const [duration, setDuration] = useState(600)
  const [count, setCount] = useState(20)
  const [subcategory, setSubcategory] = useState(null)

  function toggleCat(cat) {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function startSession() {
    if (selectedCats.length === 0) return
    const session = buildSession({
      mode,
      categories: selectedCats,
      durationSec: mode === 'sprint' ? duration : null,
      count: mode === 'fixed' ? count : null,
      subcategory: mode === 'topic' ? subcategory : null,
    })
    await saveSession({
      id: session.id, mode: session.mode, categories: session.categories,
      date: session.date, startTime: session.startTime,
      durationSec: session.durationSec, completed: false,
    })
    navigate('/session/active', { state: { session } })
  }

  return (
    <div className="flex flex-col h-full" style={{ padding: '12px 20px 0' }}>
      {/* Header bar */}
      <header className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="icon-btn" aria-label="Back">
          <IconArrowLeft size={16} />
        </button>
        <span className="eyebrow">{MODE_EYEBROWS[mode]}</span>
        <div style={{ width: 36 }} />
      </header>

      {/* Title */}
      <h2 className="serif" style={{ fontSize: 36, lineHeight: 1.05, margin: '24px 0 4px' }}>
        {MODE_TITLES[mode]}
      </h2>
      <p className="mono" style={{ fontSize: 12, color: 'var(--color-fg-muted)', margin: 0 }}>
        {mode === 'sprint' && 'Pick a duration · target window'}
        {mode === 'fixed'  && 'Pick a question count'}
        {mode === 'topic'  && 'Narrow to a category and range'}
      </p>

      {/* Mode-specific picker */}
      {mode === 'sprint' && (
        <div className="grid grid-cols-3" style={{ gap: 8, marginTop: 18 }}>
          {[300, 600, 900].map((s) => {
            const on = duration === s
            return (
              <button
                key={s}
                onClick={() => setDuration(s)}
                style={pickerStyle(on)}
              >
                <span className="num" style={{ fontSize: 40, lineHeight: 1 }}>{s / 60}</span>
                <span className="mono" style={pickerLabelStyle}>min</span>
              </button>
            )
          })}
        </div>
      )}

      {mode === 'fixed' && (
        <div className="grid grid-cols-4" style={{ gap: 8, marginTop: 18 }}>
          {[10, 20, 30, 50].map((n) => {
            const on = count === n
            return (
              <button key={n} onClick={() => setCount(n)} style={pickerStyle(on)}>
                <span className="num" style={{ fontSize: 32, lineHeight: 1 }}>{n}</span>
                <span className="mono" style={pickerLabelStyle}>q</span>
              </button>
            )
          })}
        </div>
      )}

      {mode === 'topic' && (
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Table range</div>
          <div className="flex flex-wrap" style={{ gap: 6 }}>
            {[null, ...TABLE_SUBCATEGORIES].map((s) => (
              <button
                key={String(s)}
                onClick={() => setSubcategory(s)}
                className={`chip ${subcategory === s ? 'is-on' : ''}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      <div className="flex items-baseline justify-between" style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600 }}>Topics</h3>
        <span className="mono" style={{ fontSize: 12, color: 'var(--color-fg-muted)' }}>
          {selectedCats.length} / {CATEGORIES.length}
        </span>
      </div>
      <div className="flex flex-wrap" style={{ gap: 6, marginTop: 12 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCat(cat)}
            className={`chip ${selectedCats.includes(cat) ? 'is-on' : ''}`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div className="divider" style={{ margin: '20px 0 14px' }} />

      <button
        onClick={startSession}
        disabled={selectedCats.length === 0}
        className="btn-primary"
        style={{ marginBottom: 16 }}
      >
        Begin {mode === 'sprint' ? 'sprint' : mode === 'fixed' ? 'session' : 'drill'}
        <IconArrowRight size={16} sw={1.8} />
      </button>
    </div>
  )
}

function pickerStyle(on) {
  return {
    padding: '16px 8px',
    borderRadius: 14,
    border: '1px solid ' + (on ? 'var(--color-fg)' : 'var(--color-line)'),
    background: on ? 'var(--color-fg)' : 'transparent',
    color: on ? 'var(--color-bg)' : 'var(--color-fg)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    cursor: 'pointer',
    transition: 'all 0.12s',
  }
}
const pickerLabelStyle = {
  fontSize: 11,
  opacity: 0.7,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}
