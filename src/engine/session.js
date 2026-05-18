import { QUESTION_BANK, CATEGORY_FORMAT, getByCategory, shuffle } from '../data/questionBank'
import { generateOptions } from './mcqOptions'

const MASTERY_TARGET_MS = 3000
const UNSEEN_WEIGHT = 2

// Aggregate per-question mastery from raw attempts. Mirrors the formula
// used by stats/compute.js; kept inline here so the session engine has
// zero dependencies on the stats module.
export function masteryByQuestion(attempts) {
  const byQ = {}
  for (const a of attempts) {
    if (!byQ[a.questionId]) byQ[a.questionId] = { correct: 0, total: 0, totalMs: 0 }
    byQ[a.questionId].total++
    byQ[a.questionId].totalMs += a.timeTakenMs
    if (a.correct) byQ[a.questionId].correct++
  }
  const result = {}
  for (const [qid, d] of Object.entries(byQ)) {
    const accuracy   = d.correct / d.total
    const avgMs      = d.totalMs / d.total
    const speedScore = Math.min(1, MASTERY_TARGET_MS / avgMs)
    result[qid] = {
      mastery:  Math.round((0.6 * accuracy + 0.4 * speedScore) * 100),
      attempts: d.total,
    }
  }
  return result
}

// Higher weight = more likely to be drawn. Range: 1 (mastered) → 5 (failing).
// Unseen questions get a neutral weight so they aren't crowded out.
export function weightForQuestion(question, masteryMap) {
  const m = masteryMap[question.id]
  if (!m || m.attempts < 1) return UNSEEN_WEIGHT
  return 1 + (100 - m.mastery) / 25
}

// Weighted sample without replacement — produces a full ordering of the pool.
export function weightedSample(pool, masteryMap) {
  const remaining = [...pool]
  const result = []
  while (remaining.length > 0) {
    const weights = remaining.map(q => weightForQuestion(q, masteryMap))
    const total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    let i = 0
    for (; i < weights.length - 1; i++) {
      r -= weights[i]
      if (r <= 0) break
    }
    result.push(remaining[i])
    remaining.splice(i, 1)
  }
  return result
}

export function buildSession({ mode, categories, durationSec, count, subcategory, attempts = [] }) {
  let pool = []

  if (mode === 'topic' && subcategory) {
    pool = getByCategory(categories[0], subcategory)
  } else {
    pool = QUESTION_BANK.filter(q => categories.includes(q.category))
  }

  // Topic mode is an explicit drill — keep deterministic shuffle.
  // Sprint and fixed modes use spaced-repetition-style weighting so weak
  // questions resurface more often.
  let questions
  if (mode === 'topic' || attempts.length === 0) {
    questions = shuffle(pool)
  } else {
    questions = weightedSample(pool, masteryByQuestion(attempts))
  }

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
    category: question.category,
    format,
    correct,
    userAnswer,
    timeTakenMs,
    date: new Date().toISOString().slice(0, 10),
  }
}
