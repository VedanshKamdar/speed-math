import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStats } from '../hooks/useStats'
import SpeedTrendChart from '../components/SpeedTrendChart'
import { CATEGORIES, QUESTION_BANK } from '../data/questionBank'
import { buildSession } from '../engine/session'
import { IconArrowRight, IconMoon, IconSun } from '../components/Icons'
import { useTheme } from '../hooks/useTheme'
import { downloadBackup, restoreFromFile } from '../lib/backup'

const Q_MAP = Object.fromEntries(QUESTION_BANK.map(q => [q.id, q]))

const CAT_LABEL = {
  tables: 'Tables',
  squares: 'Squares',
  cubes: 'Cubes',
  fractions: 'Fractions',
  'powers-base2': 'Powers · 2',
  'powers-base3': 'Powers · 3',
  'powers-base4': 'Powers · 4',
  'powers-base5': 'Powers · 5',
  'powers-base6': 'Powers · 6',
  'powers-base7': 'Powers · 7',
  'powers-base8': 'Powers · 8',
  'powers-base9': 'Powers · 9',
  'square-roots': 'Square roots',
  'cube-roots': 'Cube roots',
  'log-base2': 'Log · base 2',
  'log-base3': 'Log · base 3',
  'log-base4': 'Log · base 4',
  'log-base5': 'Log · base 5',
  'log-base6': 'Log · base 6',
  'log-base7': 'Log · base 7',
  'log-base8': 'Log · base 8',
  'log-base9': 'Log · base 9',
  'pct-to-frac': '% → fraction',
  'approximation': 'Approximation',
}

export default function StatsDashboard() {
  const navigate = useNavigate()
  const { stats, streak, loading } = useStats()
  const { isDark, toggleTheme } = useTheme()
  const fileRef = useRef(null)

  async function handleExport() {
    try {
      const { sessions, attempts } = await downloadBackup()
      alert(`Backup downloaded · ${sessions} sessions, ${attempts} attempts.`)
    } catch (e) {
      alert(`Export failed: ${e.message}`)
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('Importing will replace all current sessions, attempts, and streak. Continue?')) return
    try {
      const { sessions, attempts } = await restoreFromFile(file)
      alert(`Restored ${sessions} sessions and ${attempts} attempts. Reloading…`)
      window.location.reload()
    } catch (err) {
      alert(`Import failed: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '80px 0', color: 'var(--color-fg-muted)' }}>
        Loading…
      </div>
    )
  }

  // ─── Derived values ───────────────────────────────────────────────────────

  const overallMastery = stats?.overallMastery ?? null
  const masteryDelta   = stats?.masteryDelta   ?? null

  const masteryTier =
    overallMastery == null ? null :
    overallMastery >= 90  ? 'Mastery level'     :
    overallMastery >= 75  ? 'Sharp'              :
    overallMastery >= 60  ? 'Building strength'  :
    overallMastery >= 40  ? 'Developing'         :
                            'Early stage'

  // Session-level speed delta (overall avg speed this week vs last)
  const speeds  = stats?.sessionSpeeds || []
  const last7   = speeds.slice(-7).map(s => s.avgMs)
  const prev7   = speeds.slice(-14, -7).map(s => s.avgMs)
  const avgLast = last7.length  ? last7.reduce((a, b) => a + b, 0)  / last7.length  / 1000 : null
  const avgPrev = prev7.length  ? prev7.reduce((a, b) => a + b, 0)  / prev7.length  / 1000 : null
  const speedDelta = avgLast != null && avgPrev != null ? avgLast - avgPrev : null

  // Practiced categories, worst mastery first
  const practicedCats = CATEGORIES
    .filter(cat => stats?.categoryMastery?.[cat] != null)
    .sort((a, b) => (stats.categoryMastery[a] || 0) - (stats.categoryMastery[b] || 0))

  const drillTargets = (stats?.drillTargets || []).slice(0, 5)

  // ─── Drill action ─────────────────────────────────────────────────────────

  function handleDrill(target) {
    const q = Q_MAP[target.questionId]
    if (!q) return
    const session = buildSession({
      mode: 'topic',
      categories: [q.category],
      subcategory: q.subcategory || null,
    })
    session.questions = session.questions.slice(0, 20)
    navigate('/session/active', { state: { session } })
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function masteryColor(score) {
    if (score >= 80) return 'var(--color-correct)'
    if (score >= 60) return 'var(--color-warn)'
    return 'var(--color-wrong)'
  }

  function masteryBadge(score) {
    return (
      <span
        className="mono"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: masteryColor(score),
          minWidth: 28,
          textAlign: 'right',
        }}
      >
        {score}
      </span>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ padding: '12px 20px 88px', gap: 10 }}>

      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="eyebrow" style={{ letterSpacing: '0.08em' }}>Statistics</div>
        <button className="icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>
          {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>
      </header>

      {/* ── Mastery hero ────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '20px 20px 18px' }}>
        <div className="eyebrow">Overall mastery</div>
        {overallMastery != null ? (
          <>
            <div className="flex items-baseline" style={{ gap: 4, marginTop: 8 }}>
              <span
                className="num"
                style={{ fontSize: 64, lineHeight: 1, color: masteryColor(overallMastery) }}
              >
                {overallMastery}
              </span>
              <span className="mono" style={{ fontSize: 14, color: 'var(--color-fg-muted)', marginBottom: 6 }}>
                / 100
              </span>
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
              <span className="serif" style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--color-fg-muted)' }}>
                {masteryTier}
              </span>
              {masteryDelta != null && (
                <span
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: masteryDelta >= 0 ? 'var(--color-correct)' : 'var(--color-wrong)',
                  }}
                >
                  {masteryDelta >= 0 ? '↑' : '↓'} {Math.abs(masteryDelta)} pts this week
                </span>
              )}
            </div>
            {/* Mastery bar */}
            <div style={{ height: 3, background: 'var(--color-line)', borderRadius: 2, marginTop: 12 }}>
              <div
                style={{
                  width: `${overallMastery}%`,
                  height: '100%',
                  background: masteryColor(overallMastery),
                  borderRadius: 2,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </>
        ) : (
          <p style={{ marginTop: 10, fontSize: 13, color: 'var(--color-fg-muted)' }}>
            Complete a session to see your mastery score.
          </p>
        )}
      </div>

      {/* ── Streak + Speed ──────────────────────────────────────────────── */}
      <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr', gap: 10 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div className="eyebrow">Streak</div>
          <div className="flex items-baseline" style={{ gap: 4, marginTop: 6 }}>
            <span className="num" style={{ fontSize: 48, lineHeight: 1 }}>{streak}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>days</span>
          </div>
          <div className="flex" style={{ gap: 3, marginTop: 8 }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                style={{
                  flex: 1, height: 3, borderRadius: 1.5,
                  background: i < Math.min(streak, 14) ? 'var(--color-accent)' : 'var(--color-line-2)',
                  opacity: i < Math.min(streak, 14) ? (0.4 + i * 0.04) : 1,
                }}
              />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <div className="eyebrow">Avg speed</div>
          <div className="flex items-baseline" style={{ gap: 4, marginTop: 6 }}>
            <span className="num" style={{ fontSize: 48, lineHeight: 1 }}>
              {avgLast != null ? avgLast.toFixed(1) : '—'}
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>s / q</span>
          </div>
          {speedDelta != null && (
            <div className="flex items-center" style={{ gap: 4, marginTop: 8 }}>
              <IconArrowRight size={11} sw={2} />
              <span style={{
                fontSize: 11,
                color: speedDelta < 0
                  ? 'var(--color-correct)'
                  : speedDelta > 0 ? 'var(--color-wrong)' : 'var(--color-fg-muted)',
              }}>
                {speedDelta < 0 ? '−' : '+'}{Math.abs(speedDelta).toFixed(1)}s vs last wk
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Speed trend ─────────────────────────────────────────────────── */}
      {speeds.length > 1 && (
        <div className="card" style={{ padding: '14px 16px' }}>
          <div className="flex justify-between items-baseline">
            <span style={{ fontSize: 13, fontWeight: 600 }}>Speed trend</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>
              last {Math.min(speeds.length, 7)} sessions
            </span>
          </div>
          <div style={{ marginTop: 10 }}>
            <SpeedTrendChart sessionSpeeds={speeds.slice(-7)} />
          </div>
        </div>
      )}

      {/* ── By topic ─────────────────────────────────────────────────────── */}
      {practicedCats.length > 0 && (
        <div className="card" style={{ padding: '14px 16px' }}>
          <div className="flex justify-between items-baseline" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>By topic</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>mastery</span>
          </div>
          <div className="flex flex-col" style={{ gap: 14 }}>
            {practicedCats.map(cat => {
              const m   = stats.categoryMastery[cat]
              const acc = stats.categoryAccuracy[cat]
              const spd = stats.categorySpeed[cat]
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{CAT_LABEL[cat] || cat}</span>
                    {masteryBadge(m)}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: 'var(--color-fg-muted)', marginBottom: 5 }}
                  >
                    {Math.round(acc * 100)}% correct · {(spd / 1000).toFixed(1)}s avg
                  </div>
                  <div style={{ height: 3, background: 'var(--color-line)', borderRadius: 2 }}>
                    <div
                      style={{
                        width: `${m}%`,
                        height: '100%',
                        background: masteryColor(m),
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Drill targets ────────────────────────────────────────────────── */}
      {drillTargets.length > 0 && (
        <div className="card" style={{ padding: '14px 16px' }}>
          <div className="flex justify-between items-baseline" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Drill next</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>3+ reps</span>
          </div>
          <ul className="flex flex-col" style={{ gap: 0 }}>
            {drillTargets.map((target, i) => {
              const q = Q_MAP[target.questionId]
              return (
                <li
                  key={target.questionId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < drillTargets.length - 1
                      ? '1px solid var(--color-line)'
                      : 'none',
                  }}
                >
                  <span className="num" style={{ fontSize: 17, flex: 1 }}>
                    {q?.prompt ?? prettifyQid(target.questionId)}
                  </span>
                  {masteryBadge(target.mastery)}
                  <button
                    onClick={() => handleDrill(target)}
                    className="flex items-center"
                    style={{
                      gap: 4,
                      background: 'var(--color-accent-soft)',
                      border: '1px solid var(--color-accent)',
                      borderRadius: 8,
                      padding: '5px 10px',
                      color: 'var(--color-accent)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Drill <IconArrowRight size={11} sw={2.2} />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {practicedCats.length === 0 && drillTargets.length === 0 && (
        <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <p className="serif" style={{ fontSize: 18, fontStyle: 'italic', marginBottom: 6 }}>
            Nothing here yet.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-fg-muted)' }}>
            Complete a session to see your speed and mastery breakdown.
          </p>
        </div>
      )}

      {/* ── Your data ────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="flex justify-between items-baseline" style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Your data</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>JSON backup</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-fg-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          Export saves every session to a file. Import replaces local data with a backup — useful when switching devices or before clearing browser storage.
        </p>
        <div className="flex" style={{ gap: 8 }}>
          <button onClick={handleExport} className="btn-ghost" style={{ flex: 1, fontSize: 13 }}>
            Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost" style={{ flex: 1, fontSize: 13 }}>
            Import
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>

    </div>
  )
}

function prettifyQid(qid) {
  const s = String(qid)
  if (s.startsWith('tbl-'))  return s.slice(4).replace('x', ' × ')
  if (s.startsWith('sq-'))   return `${s.slice(3)}²`
  if (s.startsWith('cb-'))   return `${s.slice(3)}³`
  if (s.startsWith('pow-'))  { const [base, exp] = s.slice(4).split('-'); return `${base}^${exp}` }
  if (s.startsWith('frac-')) return `1 / ${s.slice(5)}`
  if (s.startsWith('sqrt-')) { const n = parseInt(s.slice(5), 10); return `√${n * n}` }
  if (s.startsWith('cbrt-')) { const n = parseInt(s.slice(5), 10); return `∛${n * n * n}` }
  if (s.startsWith('log-'))  { const [base, exp] = s.slice(4).split('-'); return `${base}^? = ${Math.pow(+base, +exp)}` }
  if (s.startsWith('pct-'))  return `% = 1/${s.slice(4)}`
  if (s.startsWith('approx-')) {
    const [kind, a, b] = s.slice(7).split('-')
    if (kind === 'pct') return `${a}% of ${b}`
    if (kind === 'mul') return `${a} × ${b}`
    if (kind === 'div') return `${a} ÷ ${b}`
  }
  return qid
}
