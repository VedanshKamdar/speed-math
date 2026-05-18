import { useStats } from '../hooks/useStats'
import AccuracyBar from '../components/AccuracyBar'
import SpeedTrendChart from '../components/SpeedTrendChart'
import { CATEGORIES } from '../data/questionBank'
import { IconSettings, IconArrowRight } from '../components/Icons'

export default function StatsDashboard() {
  const { stats, streak, loading } = useStats()

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ padding: '80px 0', color: 'var(--color-fg-muted)' }}
      >
        Loading…
      </div>
    )
  }

  // recent speed delta vs prior week (rough): mean of last 7 vs prior 7
  const speeds = stats?.sessionSpeeds || []
  const last7 = speeds.slice(-7).map(s => s.avgMs)
  const prev7 = speeds.slice(-14, -7).map(s => s.avgMs)
  const avgLast = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length / 1000 : null
  const avgPrev = prev7.length ? prev7.reduce((a, b) => a + b, 0) / prev7.length / 1000 : null
  const delta = avgLast != null && avgPrev != null ? avgLast - avgPrev : null

  return (
    <div className="flex flex-col" style={{ padding: '12px 20px 88px', gap: 10 }}>
      <header className="flex justify-between items-end">
        <div>
          <div className="eyebrow">Last 30 days</div>
          <h2 className="serif" style={{ fontSize: 32, lineHeight: 1.05, margin: '4px 0 0' }}>
            Statistics
          </h2>
        </div>
        <button className="icon-btn" aria-label="Settings">
          <IconSettings size={16} />
        </button>
      </header>

      {/* Streak + Avg duo */}
      <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr', gap: 10, marginTop: 8 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div className="eyebrow">Streak</div>
          <div className="flex items-baseline" style={{ gap: 4, marginTop: 6 }}>
            <span className="num" style={{ fontSize: 48, lineHeight: 1 }}>{streak}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>days</span>
          </div>
          <div className="flex" style={{ gap: 3, marginTop: 8 }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} style={{
                flex: 1, height: 3, borderRadius: 1.5,
                background: i < Math.min(streak, 14) ? 'var(--color-accent)' : 'var(--color-line-2)',
                opacity: i < Math.min(streak, 14) ? (0.4 + i * 0.04) : 1,
              }} />
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
          {delta != null && (
            <div className="flex items-center" style={{ gap: 4, marginTop: 8 }}>
              <IconArrowRight size={11} sw={2} />
              <span style={{
                fontSize: 11,
                color: delta < 0 ? 'var(--color-correct)' : delta > 0 ? 'var(--color-wrong)' : 'var(--color-fg-muted)',
              }}>
                {delta < 0 ? '−' : '+'}{Math.abs(delta).toFixed(1)}s vs last wk
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Speed trend */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="flex justify-between items-baseline">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Speed trend</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>
            last {Math.min(speeds.length, 14)} sessions
          </span>
        </div>
        <div style={{ marginTop: 10 }}>
          <SpeedTrendChart sessionSpeeds={speeds.slice(-7)} />
        </div>
      </div>

      {/* Accuracy by topic */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="flex justify-between items-baseline">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Accuracy by topic</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>all-time</span>
        </div>
        <div className="flex flex-col" style={{ gap: 9, marginTop: 12 }}>
          {CATEGORIES.map((cat) => (
            <AccuracyBar key={cat} category={cat} accuracy={stats?.categoryAccuracy?.[cat] || 0} />
          ))}
        </div>
      </div>

      {/* Weakest questions */}
      {stats?.weakestQuestions?.length > 0 && (
        <div className="card" style={{ padding: '14px 16px' }}>
          <div className="flex justify-between items-baseline">
            <span style={{ fontSize: 13, fontWeight: 600 }}>Weakest five</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>3+ attempts</span>
          </div>
          <ul className="flex flex-col" style={{ marginTop: 10, gap: 8 }}>
            {stats.weakestQuestions.slice(0, 5).map((q, i, arr) => (
              <li
                key={q.questionId}
                className="flex justify-between items-center"
                style={{
                  paddingBottom: i < arr.length - 1 ? 8 : 0,
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-line)' : 0,
                }}
              >
                <span className="num" style={{ fontSize: 17 }}>{prettifyQid(q.questionId)}</span>
                <div className="flex items-baseline" style={{ gap: 12 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>
                    {q.attempts} tries
                  </span>
                  <span className="mono" style={{ fontSize: 13, color: 'var(--color-wrong)' }}>
                    {Math.round(q.accuracy * 100)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function prettifyQid(qid) {
  // IDs: tbl-7x14, sq-17, cb-5, pow-2-15, frac-30
  const s = String(qid)
  if (s.startsWith('tbl-')) return s.slice(4).replace('x', ' × ')
  if (s.startsWith('sq-')) return `${s.slice(3)}²`
  if (s.startsWith('cb-')) return `${s.slice(3)}³`
  if (s.startsWith('pow-')) { const [base, exp] = s.slice(4).split('-'); return `${base}^${exp}` }
  if (s.startsWith('frac-')) return `1 / ${s.slice(5)}`
  return qid
}
