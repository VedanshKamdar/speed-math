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

export default function ActiveSession() {
  const { state: navState } = useLocation()
  const session = navState?.session
  const navigate = useNavigate()
  const { state, view, submitAnswer, advance, forceEnd } = useSession(session)

  useEffect(() => {
    if (state.phase === 'done') {
      finishSession()
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">No session data. <a href="/" className="text-indigo-400 underline">Go home</a></p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pt-8 gap-6 min-h-screen">
      {/* Header row: timer | progress | end button */}
      <div className="flex items-center justify-between w-full px-6 gap-4">
        <Timer mode={session.mode} durationSec={session.durationSec || 300} onExpire={forceEnd} />
        {session.mode !== 'sprint' && (
          <ProgressBar current={state.currentIndex} total={session.questions.length} />
        )}
        <button onClick={forceEnd} className="text-gray-500 text-sm shrink-0">End</button>
      </div>

      {/* Question prompt */}
      <div className="text-5xl font-black text-white text-center px-6 leading-tight">
        {view.question.prompt} = ?
      </div>

      {/* Answer format */}
      {view.format === 'type' && <TypeAnswer onSubmit={submitAnswer} />}
      {view.format === 'flashcard' && <Flashcard question={view.question} onRate={submitAnswer} />}
      {view.format === 'mcq' && (
        <MCQOptions
          options={view.options}
          onSelect={opt => submitAnswer(opt.value)}
          disabled={state.phase === 'feedback'}
        />
      )}

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
