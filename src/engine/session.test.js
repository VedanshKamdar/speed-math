import { describe, it, expect } from 'vitest'
import { buildSession, buildQuestionView, checkAnswer, buildAttempt } from './session'
import { QUESTION_BANK } from '../data/questionBank'

describe('buildSession', () => {
  it('sprint mode returns all questions from selected categories', () => {
    const session = buildSession({ mode: 'sprint', categories: ['squares'], durationSec: 300 })
    expect(session.questions.every(q => q.category === 'squares')).toBe(true)
    expect(session.questions).toHaveLength(25)
  })

  it('fixed mode limits to requested count', () => {
    const session = buildSession({ mode: 'fixed', categories: ['tables'], count: 20 })
    expect(session.questions).toHaveLength(20)
  })

  it('topic mode with subcategory filters correctly', () => {
    const session = buildSession({ mode: 'topic', categories: ['tables'], subcategory: '21-25' })
    expect(session.questions.every(q => q.subcategory === '21-25')).toBe(true)
    expect(session.questions).toHaveLength(100)
  })

  it('multi-category sprint mixes categories', () => {
    const session = buildSession({ mode: 'sprint', categories: ['squares', 'cubes'], durationSec: 300 })
    const cats = new Set(session.questions.map(q => q.category))
    expect(cats.size).toBe(2)
  })

  it('session has required fields', () => {
    const session = buildSession({ mode: 'sprint', categories: ['squares'], durationSec: 300 })
    expect(session).toHaveProperty('id')
    expect(session).toHaveProperty('mode', 'sprint')
    expect(session).toHaveProperty('questions')
    expect(session).toHaveProperty('startTime')
    expect(session).toHaveProperty('date')
  })
})

describe('checkAnswer', () => {
  it('correct integer answer returns true', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x14')
    expect(checkAnswer(q, '98')).toBe(true)
    expect(checkAnswer(q, 98)).toBe(true)
  })

  it('wrong integer answer returns false', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x14')
    expect(checkAnswer(q, '99')).toBe(false)
  })

  it('fraction answer matches string', () => {
    const q = QUESTION_BANK.find(q => q.id === 'frac-7')
    expect(checkAnswer(q, '14.29%')).toBe(true)
  })

  it('fraction answer with whitespace matches', () => {
    const q = QUESTION_BANK.find(q => q.id === 'frac-7')
    expect(checkAnswer(q, '  14.29%  ')).toBe(true)
  })
})

describe('checkAnswer with tolerance', () => {
  it('accepts answers within ±5% of the exact value', () => {
    const q = { answer: 100, tolerance: 0.05 }
    expect(checkAnswer(q, 100)).toBe(true)
    expect(checkAnswer(q, 95)).toBe(true)
    expect(checkAnswer(q, 105)).toBe(true)
    expect(checkAnswer(q, 94)).toBe(false)
    expect(checkAnswer(q, 106)).toBe(false)
  })

  it('rejects non-numeric input for tolerance answers', () => {
    const q = { answer: 100, tolerance: 0.05 }
    expect(checkAnswer(q, 'abc')).toBe(false)
  })

  it('still requires exact match when no tolerance is set', () => {
    const q = { answer: 100 }
    expect(checkAnswer(q, 99)).toBe(false)
    expect(checkAnswer(q, 100)).toBe(true)
  })
})

describe('buildAttempt', () => {
  it('returns attempt with required fields including factKey and timestamp', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x14')
    const attempt = buildAttempt({ sessionId: 's1', question: q, correct: true, timeTakenMs: 1500, format: 'type' })
    expect(attempt).toHaveProperty('id')
    expect(attempt).toHaveProperty('sessionId', 's1')
    expect(attempt).toHaveProperty('questionId', 'tbl-7x14')
    expect(attempt).toHaveProperty('factKey', 'tbl-fact-7x14')
    expect(attempt).toHaveProperty('category', 'tables')
    expect(attempt).toHaveProperty('correct', true)
    expect(attempt).toHaveProperty('timeTakenMs', 1500)
    expect(attempt).toHaveProperty('format', 'type')
    expect(attempt).toHaveProperty('date')
    expect(attempt).toHaveProperty('timestamp')
  })
})

describe('buildQuestionView', () => {
  it('type format returns no options', () => {
    const q = QUESTION_BANK.find(q => q.category === 'tables')
    const view = buildQuestionView(q, QUESTION_BANK)
    expect(view.format).toBe('type')
    expect(view.options).toBeNull()
  })

  it('mcq format returns 4 options', () => {
    const q = QUESTION_BANK.find(q => q.category === 'squares')
    const view = buildQuestionView(q, QUESTION_BANK)
    expect(view.format).toBe('mcq')
    expect(view.options).toHaveLength(4)
  })

  it('powers use mcq format with options', () => {
    const q = QUESTION_BANK.find(q => q.category === 'powers-base2')
    const view = buildQuestionView(q, QUESTION_BANK)
    expect(view.format).toBe('mcq')
    expect(view.options).toHaveLength(4)
  })
})

describe('table factKey siblings', () => {
  it('7×8 and 8×7 share the same factKey', () => {
    const ab = QUESTION_BANK.find(q => q.id === 'tbl-7x8')
    const ba = QUESTION_BANK.find(q => q.id === 'tbl-8x7')
    expect(ab.factKey).toBe(ba.factKey)
  })

  it('different facts have different factKeys', () => {
    const a = QUESTION_BANK.find(q => q.id === 'tbl-7x8')
    const b = QUESTION_BANK.find(q => q.id === 'tbl-9x8')
    expect(a.factKey).not.toBe(b.factKey)
  })
})
