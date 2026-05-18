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

describe('buildAttempt', () => {
  it('returns attempt with required fields', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x14')
    const attempt = buildAttempt({ sessionId: 's1', question: q, correct: true, timeTakenMs: 1500, format: 'type' })
    expect(attempt).toHaveProperty('id')
    expect(attempt).toHaveProperty('sessionId', 's1')
    expect(attempt).toHaveProperty('questionId', 'tbl-7x14')
    expect(attempt).toHaveProperty('category', 'tables')
    expect(attempt).toHaveProperty('correct', true)
    expect(attempt).toHaveProperty('timeTakenMs', 1500)
    expect(attempt).toHaveProperty('format', 'type')
    expect(attempt).toHaveProperty('date')
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
