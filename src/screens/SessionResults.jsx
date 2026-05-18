import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QUESTION_BANK } from '../data/questionBank'
import { IconClose, IconArrowRight, IconChevronDown } from '../components/Icons'

const MODE_NAME = { sprint: 'Sprint', fixed: 'Fixed count', topic: 'Topic drill' }
const Q_MAP = Object.fromEntries(QUESTION_BANK.map(q => [q.id, q]))

export default function SessionResults() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { attempts = [], session } = state || {}
  const [timingOpen, setTimingOpen] = useState(false)

  const correct = attempts.filter(a => a.correct).length
  const total = attempts.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const avgSpeedSec = total > 0
    ? Math.round(attempts.reduce((s, a) => s + a.timeTakenMs, 0) / total / 100) / 10
    : 0

  // headline message tier
  const headline =
    accuracy === 100 ? 'Flawless.' :
    accuracy >= 90  ? 'Sharp.' :
    accuracy >= 75  ? 'Solid run.' :
    accuracy >= 50  ? 'Keep going.' :
                      'Practice makes recall.'

  // accuracy by topic
  const byCat = {}
  for (const a of attempts) {
    const cat = a.category || 'other'
    if (!byCat[cat]) byCat[cat] = { c: 0, t: 0 }
    byCat[cat].t++
    if (a.correct) byCat[cat].c++
  }
  const byCatSorted = Object.entries(byCat)
    .map(([cat, d]) => ({ cat, pct: Math.round((d.c / d.t) * 100), n: d.t }))
    .sort((a, b) => a.pct - b.pct)

  const byQ = {}
  for (const a of attempts) {
    if (!byQ[a.questionId]) byQ[a.questionId] = { c: 0, t: 0, wrongAnswer: null }
    byQ[a.questionId].t++
    if (a.correct) byQ[a.questionId].c++
    else byQ[a.questionId].wrongAnswer = a.userAnswer
  }
  const weakSpots = Object.entries(byQ)
    .map(([qid, d]) => ({ qid, acc: d.c / d.t, wrongAnswer: d.wrongAnswer }))
    .sort((a, b) => a.acc - b.acc)
    .filter(w => w.acc < 1)
    .slice(0, 3)

  return (
    <div className="flex flex-col h-full" style={{ padding: '12px 20px 0', overflow: 'hidden' }}>
      <header className="flex justify-between items-center">
        <button onClick={() => navigate('/')} className="icon-btn" aria-label="Close">
          <IconClose size={16} />
        </button>
        <span className="eyebrow">
          {MODE_NAME[session?.mode] || 'Session'}
          {session?.durationSec ? ` · ${session.durationSec / 60} min` : ''}
        </span>
        <div style={{ width: 36 }} />
      </header>

      <div style={{ marginTop: 24 }}>
        <div className="eyebrow">Session complete</div>
        <h2 className="serif" style={{ fontSize: 32, lineHeight: 1.05, margin: '4px 0 0' }}>
          {headline}
        </h2>
      </div>

      {/* Hero stats */}
      <div
        style={{
          marginTop: 22,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          border: '1px solid var(--color-line)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <StatCell big={`${correct}`} meta={`of ${total}`} sub="correct" />
        <StatCell big={`${accuracy}`} meta="%"           sub="accuracy" border />
        <StatCell big={`${avgSpeedSec}`} meta="sec/q"    sub="avg" border />
      </div>

      {/* Weak spots */}
      {weakSpots.length > 0 && (
        <div className="card fade-up" style={{ padding: '14px 16px', marginTop: 14 }}>
          <div className="flex justify-between items-baseline">
            <span style={{ fontSize: 13, fontWeight: 600 }}>Weak spots</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>this session</span>
          </div>
          <ul className="flex flex-col" style={{ marginTop: 10, gap: 10 }}>
            {weakSpots.map((w) => {
              const q = Q_MAP[w.qid]
              return (
                <li key={w.qid}>
                  <div className="flex justify-between items-center">
                    <span className="num" style={{ fontSize: 17 }}>{prettifyQid(w.qid)}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--color-wrong)' }}>
                      {Math.round(w.acc * 100)}%
                    </span>
                  </div>
                  {w.wrongAnswer != null && q && (
                    <div className="flex items-center" style={{ gap: 6, marginTop: 3 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--color-wrong)' }}>
                        You: {String(w.wrongAnswer)}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-fg-dim)' }}>→</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--color-correct)' }}>
                        {q.answerDisplay}
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* By topic */}
      {byCatSorted.length > 1 && (
        <div className="card" style={{ padding: '14px 16px', marginTop: 10 }}>
          <div className="flex justify-between items-baseline">
            <span style={{ fontSize: 13, fontWeight: 600 }}>By topic</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>accuracy</span>
          </div>
          <div className="flex flex-col" style={{ marginTop: 10, gap: 8 }}>
            {byCatSorted.slice(0, 4).map(({ cat, pct, n }) => (
              <div key={cat}>
                <div className="flex justify-between items-baseline" style={{ marginBottom: 3 }}>
                  <span style={{ fontSize: 12 }}>{prettifyCat(cat)} <span style={{ color: 'var(--color-fg-dim)' }}>· {n}</span></span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--color-fg-muted)' }}>{pct}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--color-line)', borderRadius: 2 }}>
                  <div style={{
                    width: pct + '%', height: '100%',
                    background: pct < 50 ? 'var(--color-wrong)' : 'var(--color-fg)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible per-question timing */}
      <div className="card" style={{ marginTop: 10 }}>
        <button
          onClick={() => setTimingOpen(o => !o)}
          className="flex justify-between items-center w-full"
          style={{
            padding: '13px 16px', background: 'none', border: 'none',
            color: 'var(--color-fg)', cursor: 'pointer', width: '100%',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Question breakdown
          </span>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>
              {attempts.length} q
            </span>
            <span style={{
              display: 'flex', transition: 'transform 0.2s',
              transform: timingOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'var(--color-fg-muted)',
            }}>
              <IconChevronDown size={14} />
            </span>
          </div>
        </button>

        {timingOpen && (
          <ul style={{ borderTop: '1px solid var(--color-line)', padding: '6px 16px 10px' }}>
            {attempts.map((a, i) => {
              const q = Q_MAP[a.questionId]
              return (
                <li
                  key={a.id}
                  className="flex items-center"
                  style={{
                    padding: '7px 0',
                    borderBottom: i < attempts.length - 1 ? '1px solid var(--color-line)' : 'none',
                    gap: 10,
                  }}
                >
                  {/* Correct indicator */}
                  <span style={{
                    width: 6, height: 6, borderRadius: 3, flexShrink: 0,
                    background: a.correct ? 'var(--color-correct)' : 'var(--color-wrong)',
                  }} />

                  {/* Prompt */}
                  <span className="num" style={{ fontSize: 15, flex: 1 }}>
                    {q?.prompt ?? prettifyQid(a.questionId)}
                  </span>

                  {/* Wrong: you answered → correct */}
                  {!a.correct && (
                    <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>
                      <span style={{ color: 'var(--color-wrong)' }}>{String(a.userAnswer ?? '?')}</span>
                      {' → '}
                      <span style={{ color: 'var(--color-correct)' }}>{q?.answerDisplay}</span>
                    </span>
                  )}

                  {/* Time */}
                  <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-dim)', flexShrink: 0 }}>
                    {(a.timeTakenMs / 1000).toFixed(1)}s
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 16 }} />

      <div className="flex" style={{ gap: 12, padding: '8px 0 24px' }}>
        <button
          onClick={() => navigate('/session/setup', { state: { mode: session?.mode || 'sprint' } })}
          className="btn-ghost"
        >
          Retry
        </button>
        <button onClick={() => navigate('/')} className="btn-primary">
          Done <IconArrowRight size={16} sw={1.8} />
        </button>
      </div>
    </div>
  )
}

function StatCell({ big, meta, sub, border }) {
  return (
    <div
      style={{
        padding: '18px 12px',
        borderLeft: border ? '1px solid var(--color-line)' : 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}
    >
      <div className="flex items-baseline" style={{ gap: 3 }}>
        <span className="num" style={{ fontSize: 42, lineHeight: 1 }}>{big}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>{meta}</span>
      </div>
      <span
        className="mono"
        style={{
          fontSize: 10.5,
          color: 'var(--color-fg-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {sub}
      </span>
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
  return qid
}

function prettifyCat(cat) {
  if (cat === 'tables') return 'Tables'
  if (cat === 'squares') return 'Squares'
  if (cat === 'cubes') return 'Cubes'
  if (cat === 'fractions') return 'Fractions'
  if (cat === 'square-roots') return 'Square roots'
  if (cat === 'cube-roots')   return 'Cube roots'
  if (cat === 'pct-to-frac')  return '% → fraction'
  if (cat?.startsWith('powers-base')) return 'Powers · ' + cat.replace('powers-base', '')
  if (cat?.startsWith('log-base'))    return 'Log · base ' + cat.replace('log-base', '')
  return cat
}
