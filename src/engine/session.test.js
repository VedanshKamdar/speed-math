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

describe('checkAnswer with tolerance', () => {
  it('accepts answers within ±5% of the exact value', async () => {
    const { checkAnswer } = await import('./session')
    const q = { answer: 100, tolerance: 0.05 }
    expect(checkAnswer(q, 100)).toBe(true)
    expect(checkAnswer(q, 95)).toBe(true)
    expect(checkAnswer(q, 105)).toBe(true)
    expect(checkAnswer(q, 94)).toBe(false)
    expect(checkAnswer(q, 106)).toBe(false)
  })

  it('rejects non-numeric input for tolerance answers', async () => {
    const { checkAnswer } = await import('./session')
    const q = { answer: 100, tolerance: 0.05 }
    expect(checkAnswer(q, 'abc')).toBe(false)
  })

  it('still requires exact match when no tolerance is set', async () => {
    const { checkAnswer } = await import('./session')
    const q = { answer: 100 }
    expect(checkAnswer(q, 99)).toBe(false)
    expect(checkAnswer(q, 100)).toBe(true)
  })
})

describe('spaced repetition', () => {
  it('weightForQuestion returns higher weight for lower mastery', async () => {
    const { weightForQuestion } = await import('./session')
    const masteryMap = {
      'high': { mastery: 100, attempts: 5 },
      'mid':  { mastery: 50,  attempts: 5 },
      'low':  { mastery: 0,   attempts: 5 },
    }
    const wHigh = weightForQuestion({ id: 'high' }, masteryMap)
    const wMid  = weightForQuestion({ id: 'mid'  }, masteryMap)
    const wLow  = weightForQuestion({ id: 'low'  }, masteryMap)
    expect(wLow).toBeGreaterThan(wMid)
    expect(wMid).toBeGreaterThan(wHigh)
  })

  it('unseen questions get neutral weight (treated like ~mastery 75)', async () => {
    const { weightForQuestion } = await import('./session')
    const w = weightForQuestion({ id: 'never-seen' }, {})
    expect(w).toBe(2)
  })

  it('masteryByQuestion aggregates correctness and time', async () => {
    const { masteryByQuestion } = await import('./session')
    const attempts = [
      { questionId: 'q1', correct: true,  timeTakenMs: 2000 },
      { questionId: 'q1', correct: true,  timeTakenMs: 2000 },
      { questionId: 'q1', correct: false, timeTakenMs: 2000 },
    ]
    const m = masteryByQuestion(attempts)
    expect(m['q1'].attempts).toBe(3)
    expect(m['q1'].mastery).toBeGreaterThan(0)
    expect(m['q1'].mastery).toBeLessThan(100)
  })

  it('weightedSample returns a permutation of the pool', async () => {
    const { weightedSample } = await import('./session')
    const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    const out = weightedSample(pool, {})
    expect(out).toHaveLength(4)
    expect(new Set(out.map(q => q.id))).toEqual(new Set(['a','b','c','d']))
  })

  it('weak questions are sampled into the first half more often (statistical)', async () => {
    const { weightedSample } = await import('./session')
    const pool = [
      { id: 'strong' }, { id: 'strong2' }, { id: 'strong3' }, { id: 'strong4' },
      { id: 'weak' },
    ]
    const masteryMap = {
      strong:  { mastery: 100, attempts: 5 },
      strong2: { mastery: 100, attempts: 5 },
      strong3: { mastery: 100, attempts: 5 },
      strong4: { mastery: 100, attempts: 5 },
      weak:    { mastery: 0,   attempts: 5 },
    }
    let weakInFirstHalf = 0
    const iterations = 500
    for (let i = 0; i < iterations; i++) {
      const out = weightedSample(pool, masteryMap)
      const weakIdx = out.findIndex(q => q.id === 'weak')
      if (weakIdx < pool.length / 2) weakInFirstHalf++
    }
    // Random baseline would be ~50%. Weak should land in first half well above that.
    expect(weakInFirstHalf / iterations).toBeGreaterThan(0.7)
  })
})

