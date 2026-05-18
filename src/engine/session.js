import { QUESTION_BANK, CATEGORY_FORMAT, getByCategory, shuffle } from '../data/questionBank'
import { generateOptions } from './mcqOptions'

export function buildSession({ mode, categories, durationSec, count, subcategory }) {
  let pool = []

  if (mode === 'topic' && subcategory) {
    pool = getByCategory(categories[0], subcategory)
  } else {
    pool = QUESTION_BANK.filter(q => categories.includes(q.category))
  }

  let questions = shuffle(pool)

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
