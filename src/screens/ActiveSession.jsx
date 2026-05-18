import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { saveAttempts, saveSession, getMeta, setMeta } from '../db/index'
import { computeNewStreak } from '../engine/streak'
import TypeAnswer from '../components/TypeAnswer'
import Flashcard from '../components/Flashcard'
import MCQOptions from '../components/MCQOptions'
import FeedbackFlash from '../components/FeedbackFlash'
import Timer from '../components/Timer'
import ProgressBar from '../components/ProgressBar'

const CATEGORY_LABEL = {
  tables: 'Tables', squares: 'Squares', cubes: 'Cubes',
  'powers-base2': 'Powers · 2', 'powers-base3': 'Powers · 3',
  'powers-base4': 'Powers · 4', 'powers-base5': 'Powers · 5',
  'powers-base6': 'Powers · 6', 'powers-base7': 'Powers · 7',
  'powers-base8': 'Powers · 8', 'powers-base9': 'Powers · 9',
  fractions: 'Fractions',
}

export default function ActiveSession() {
  const { state: navState } = useLocation()
  const session = navState?.session
  const navigate = useNavigate()
  const { state, view, submitAnswer, advance, forceEnd } = useSession(session)

  useEffect(() => {
    if (state.phase === 'done') finishSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  async function finishSession() {
    if (!session) return
    await saveAttempts(state.attempts)
    await saveSession({
      id: session.id,
      mode: session.mode,
      categories: session.categories,
      date: session.date,
      startTime: session.startTime,
      durationMs: Date.now() - session.startTime,
      totalQuestions: state.attempts.length,
      completed: true,
    })
    const prior = await getMeta('streak')
    const today = new Date().toISOString().slice(0, 10)
    await setMeta('streak', computeNewStreak(prior, today))
    navigate('/session/results', { state: { attempts: state.attempts, session } })
  }

  if (!session || !view) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: 'var(--color-fg-muted)' }}>
          No session data.{' '}
          <a href="/" style={{ color: 'var(--color-accent)' }}>Go home</a>
        </p>
      </div>
    )
  }

  // live correctness count for streak meter
  const correctRun = (() => {
    let c = 0
    for (let i = state.attempts.length - 1; i >= 0; i--) {
      if (state.attempts[i].correct) c++
      else break
    }
    return c
  })()

  const categoryLabel = CATEGORY_LABEL[view.question.category] || view.question.category

  return (
    <div className="flex flex-col h-full" style={{ padding: '8px 0 16px' }}>
      {/* Top meta row */}
      <header className="flex items-center" style={{ padding: '0 20px', gap: 14 }}>
        <Timer
          mode={session.mode}
          durationSec={session.durationSec || 300}
          onExpire={forceEnd}
        />
        {session.mode !== 'sprint' && (
          <ProgressBar current={state.currentIndex} total={session.questions.length} />
        )}
        {session.mode === 'sprint' && (
          <div style={{ flex: 1 }} />
        )}
        <button
          onClick={forceEnd}
          style={{
            background: 'transparent',
            border: 0,
            color: 'var(--color-fg-muted)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          End
        </button>
      </header>

      {/* Question meta */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '14px 20px 0' }}
      >
        <span className="eyebrow">
          Question {state.currentIndex + 1} · {categoryLabel}
        </span>
        {correctRun > 0 && (
          <span className="pill">
            <span className="dot" />
            streak {correctRun}
          </span>
        )}
      </div>

      {/* Hero question */}
      <div
        className="flex flex-col items-center justify-center text-center fade-up"
        style={{ flex: 1, padding: '20px 24px' }}
        key={view.question.id}
      >
        <div
          className="num"
          style={{
            fontSize: 'clamp(72px, 22vw, 110px)',
            lineHeight: 0.9,
            color: 'var(--color-fg)',
          }}
        >
          {view.question.prompt}
        </div>
        <div
          className="serif"
          style={{
            fontSize: 36,
            color: 'var(--color-fg-muted)',
            marginTop: -4,
            fontStyle: 'italic',
          }}
        >
          = ?
        </div>
      </div>

      {/* Answer surface */}
      <div style={{ paddingBottom: 4 }}>
        {view.format === 'type' && <TypeAnswer key={view.question.id} onSubmit={submitAnswer} />}
        {view.format === 'flashcard' && (
          <Flashcard question={view.question} onRate={submitAnswer} />
        )}
        {view.format === 'mcq' && (
          <MCQOptions
            options={view.options}
            onSelect={(opt) => submitAnswer(opt.value)}
            disabled={state.phase === 'feedback'}
          />
        )}
      </div>

      {/* Feedback overlay */}
      {state.phase === 'feedback' && (
        <FeedbackFlash
          result={state.lastResult}
          correctAnswer={view.question.answerDisplay}
          onDone={advance}
        />
      )}
    </div>
  )
}
