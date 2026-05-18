import { useReducer, useCallback, useRef } from 'react'
import { QUESTION_BANK } from '../data/questionBank'
import { buildQuestionView, checkAnswer, buildAttempt } from '../engine/session'

const initialState = {
  currentIndex: 0,
  attempts: [],
  phase: 'question', // 'question' | 'feedback' | 'done'
  lastResult: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'ANSWER':
      return { ...state, phase: 'feedback', lastResult: action.result, attempts: [...state.attempts, action.attempt] }
    case 'NEXT': {
      const next = state.currentIndex + 1
      if (next >= action.total) return { ...state, phase: 'done', currentIndex: next }
      return { ...state, phase: 'question', currentIndex: next, lastResult: null }
    }
    case 'END':
      return { ...state, phase: 'done' }
    default:
      return state
  }
}

export function useSession(session) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const questionStartTime = useRef(Date.now())

  const current = session?.questions[state.currentIndex]
  const view = current ? buildQuestionView(current, QUESTION_BANK) : null

  const submitAnswer = useCallback((userAnswer) => {
    if (!current || state.phase !== 'question') return
    const timeTakenMs = Date.now() - questionStartTime.current
    const correct = checkAnswer(current, userAnswer)
    const attempt = buildAttempt({
      sessionId: session.id,
      question: current,
      correct,
      timeTakenMs,
      format: view.format,
    })
    dispatch({ type: 'ANSWER', result: correct, attempt })
  }, [current, state.phase, session?.id, view])

  const advance = useCallback(() => {
    questionStartTime.current = Date.now()
    dispatch({ type: 'NEXT', total: session.questions.length })
  }, [session?.questions.length])

  const forceEnd = useCallback(() => dispatch({ type: 'END' }), [])

  return { state, view, submitAnswer, advance, forceEnd }
}
