import { QUESTION_BANK, CATEGORY_FORMAT, getByCategory, shuffle } from '../data/questionBank'
import { generateOptions } from './mcqOptions'
import { pickQuestions, applyAttempt, factKey } from './scheduler'

export function buildSession({ mode, categories, durationSec, count, subcategory, cardStates = {} }) {
  let pool = []

  if (mode === 'topic' && subcategory) {
    pool = getByCategory(categories[0], subcategory)
  } else {
    pool = QUESTION_BANK.filter(q => categories.includes(q.category))
  }

  // All modes — including topic — go through the scheduler so weak/overdue
  // facts surface first. Topic mode still drills the chosen pool exclusively;
  // it just orders by FSRS urgency instead of plain shuffle.
  let questions = pickQuestions({ pool, cardStates, nowMs: Date.now() })

  // If no FSRS state exists yet (truly fresh user), pickQuestions already
  // returns a shuffled list, so no extra fallback needed.
  if (questions.length === 0) questions = shuffle(pool)

  if (mode === 'fixed') {
    questions = questions.slice(0, count)
  }

  return {
    id: crypto.randomUUID(),
    mode,
    categories,
    subcategory: subcategory || null,
    durationSec: durationSec || null,
    questions,
    startTime: Date.now(),
    date: new Date().toISOString().slice(0, 10),
  }
}

export function getFormat(question) {
  return CATEGORY_FORMAT[question.category] || 'type'
}

export function buildQuestionView(question, bank) {
  const format = getFormat(question)
  return {
    question,
    format,
    options: format === 'mcq' ? generateOptions(question, bank) : null,
  }
}

export function checkAnswer(question, userAnswer) {
  const correct = question.answer
  if (question.tolerance != null && typeof correct === 'number') {
    const num = Number(userAnswer)
    if (Number.isNaN(num)) return false
    return Math.abs(num - correct) <= Math.abs(correct * question.tolerance)
  }
  if (typeof correct === 'number') {
    return Number(userAnswer) === correct
  }
  return String(userAnswer).trim() === String(correct).trim()
}

export function buildAttempt({ sessionId, question, correct, timeTakenMs, format, userAnswer }) {
  return {
    id: crypto.randomUUID(),
    sessionId,
    questionId: question.id,
    factKey: factKey(question),
    category: question.category,
    format,
    correct,
    userAnswer,
    timeTakenMs,
    timestamp: Date.now(),
    date: new Date().toISOString().slice(0, 10),
  }
}

// Re-export for callers that update FSRS state at end-of-session.
export { applyAttempt, factKey }
