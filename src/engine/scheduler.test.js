import { describe, it, expect } from 'vitest'
import { factKey, gradeFromAttempt, applyAttempt, pickQuestions, replayAttempts } from './scheduler'
import { QUESTION_BANK } from '../data/questionBank'

const DAY = 86_400_000

describe('factKey', () => {
  it('returns the question.factKey when present', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x8')
    expect(factKey(q)).toBe('tbl-fact-7x8')
  })

  it('falls back to id when no factKey is set', () => {
    expect(factKey({ id: 'sq-5' })).toBe('sq-5')
  })
})

describe('gradeFromAttempt', () => {
  const q = { speedTargetMs: 2000 }

  it('wrong is always Again (1)', () => {
    expect(gradeFromAttempt({ correct: false, timeTakenMs: 500, question: q, format: 'type' })).toBe(1)
  })

  it('correct ≤ target is Easy (4) for typed answers', () => {
    expect(gradeFromAttempt({ correct: true, timeTakenMs: 1500, question: q, format: 'type' })).toBe(4)
  })

  it('correct ≤ 2× target is Good (3)', () => {
    expect(gradeFromAttempt({ correct: true, timeTakenMs: 3500, question: q, format: 'type' })).toBe(3)
  })

  it('correct ≤ 4× target is Hard (2)', () => {
    expect(gradeFromAttempt({ correct: true, timeTakenMs: 7000, question: q, format: 'type' })).toBe(2)
  })

  it('correct but slower than 4× target collapses to Again (1)', () => {
    expect(gradeFromAttempt({ correct: true, timeTakenMs: 12_000, question: q, format: 'type' })).toBe(1)
  })

  it('MCQ correctness is capped at Good — no Easy from guessing', () => {
    expect(gradeFromAttempt({ correct: true, timeTakenMs: 1500, question: q, format: 'mcq' })).toBe(3)
  })

  it('uses category default when question has no explicit target', () => {
    const sq = { category: 'squares' }   // default 1500ms
    expect(gradeFromAttempt({ correct: true, timeTakenMs: 1000, question: sq, format: 'mcq' })).toBe(3)
  })
})

describe('applyAttempt', () => {
  it('seeds a new cardState entry under the factKey', () => {
    const states = {}
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x8')
    applyAttempt(states, q, { correct: true, timeTakenMs: 1500, format: 'type', nowMs: 1_000_000 })
    expect(states['tbl-fact-7x8']).toBeDefined()
    expect(states['tbl-fact-7x8'].reps).toBe(1)
    expect(states['tbl-fact-7x8'].factKey).toBe('tbl-fact-7x8')
  })

  it('sibling cards share FSRS state', () => {
    const states = {}
    const ab = QUESTION_BANK.find(q => q.id === 'tbl-7x8')
    const ba = QUESTION_BANK.find(q => q.id === 'tbl-8x7')
    applyAttempt(states, ab, { correct: true, timeTakenMs: 1500, format: 'type', nowMs: 0 })
    applyAttempt(states, ba, { correct: true, timeTakenMs: 1500, format: 'type', nowMs: 1 * DAY })
    expect(Object.keys(states)).toHaveLength(1)
    expect(states['tbl-fact-7x8'].reps).toBe(2)
  })
})

describe('pickQuestions', () => {
  const pool = QUESTION_BANK.filter(q => q.category === 'squares')

  it('shuffles when no cardStates exist (all new)', () => {
    const out = pickQuestions({ pool, cardStates: {}, nowMs: Date.now() })
    expect(out).toHaveLength(pool.length)
    expect(new Set(out.map(q => q.id)).size).toBe(pool.length)
  })

  it('ranks weak/overdue cards before strong ones', () => {
    const states = {}
    const weak   = pool[0]   // will set low retrievability
    const strong = pool[1]   // will set high retrievability
    // strong: reviewed just now → R ≈ 1
    applyAttempt(states, strong, { correct: true, timeTakenMs: 800, format: 'mcq', nowMs: Date.now() })
    // weak: reviewed 30 days ago with very small stability → R near 0
    applyAttempt(states, weak,   { correct: false, timeTakenMs: 8000, format: 'mcq', nowMs: Date.now() - 30 * DAY })
    const ordered = pickQuestions({ pool, cardStates: states, nowMs: Date.now() })
    const weakPos   = ordered.findIndex(q => q.id === weak.id)
    const strongPos = ordered.findIndex(q => q.id === strong.id)
    expect(weakPos).toBeLessThan(strongPos)
  })

  it('rate-limits new cards (~1 per 4 due cards)', () => {
    const states = {}
    // Mark 20 of 25 squares as already-seen (stable, high R)
    for (let i = 0; i < 20; i++) {
      applyAttempt(states, pool[i], { correct: true, timeTakenMs: 800, format: 'mcq', nowMs: Date.now() })
    }
    const ordered = pickQuestions({ pool, cardStates: states, nowMs: Date.now() })
    // First 5 slots should be a mix; new cards shouldn't dominate the head.
    const newInFirst5 = ordered.slice(0, 5).filter(q => !states[q.factKey || q.id]).length
    expect(newInFirst5).toBeLessThanOrEqual(2)
  })
})

describe('replayAttempts', () => {
  it('returns empty state for empty input', () => {
    expect(replayAttempts([], {})).toEqual({})
  })

  it('processes attempts in chronological order', () => {
    const byId = {}
    for (const q of QUESTION_BANK) byId[q.id] = q
    const attempts = [
      { questionId: 'tbl-7x8', correct: true,  timeTakenMs: 1500, format: 'type', timestamp: 2 * DAY },
      { questionId: 'tbl-7x8', correct: false, timeTakenMs: 5000, format: 'type', timestamp: 1 * DAY },
      { questionId: 'tbl-7x8', correct: true,  timeTakenMs: 1500, format: 'type', timestamp: 3 * DAY },
    ]
    const states = replayAttempts(attempts, byId)
    expect(states['tbl-fact-7x8'].reps).toBe(3)
    expect(states['tbl-fact-7x8'].lapses).toBe(1)
    expect(states['tbl-fact-7x8'].lastReviewedAt).toBe(3 * DAY)
  })

  it('falls back to date when timestamp is missing (legacy attempts)', () => {
    const byId = {}
    for (const q of QUESTION_BANK) byId[q.id] = q
    const attempts = [
      { questionId: 'sq-3', correct: true, timeTakenMs: 900, format: 'mcq', date: '2026-05-01' },
    ]
    const states = replayAttempts(attempts, byId)
    expect(states['sq-3']).toBeDefined()
    expect(states['sq-3'].reps).toBe(1)
  })

  it('skips attempts for unknown questions', () => {
    const states = replayAttempts(
      [{ questionId: 'ghost', correct: true, timeTakenMs: 1000, format: 'type', timestamp: 0 }],
      {},
    )
    expect(states).toEqual({})
  })
})
