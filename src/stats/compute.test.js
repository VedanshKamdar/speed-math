import { describe, it, expect } from 'vitest'
import { computeStats } from './compute'

const makeAttempt = (overrides) => ({
  id: crypto.randomUUID(),
  sessionId: 's1',
  questionId: 'tbl-7x14',
  category: 'tables',
  format: 'type',
  correct: true,
  timeTakenMs: 2000,
  date: '2026-05-18',
  ...overrides,
})

describe('computeStats', () => {
  it('per-question accuracy is correct/total', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: false }),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.questionAccuracy['sq-5']).toBeCloseTo(0.667, 2)
  })

  it('weakest questions excludes those with fewer than 3 attempts', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: false }),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.weakestQuestions.find(q => q.questionId === 'sq-1')).toBeUndefined()
  })

  it('weakest questions includes those with 3+ attempts sorted by accuracy asc', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-3', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-3', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-3', category: 'squares', correct: true }),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.weakestQuestions[0].questionId).toBe('sq-2')
  })

  it('categoryAccuracy averages per-question accuracies', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.categoryAccuracy['squares']).toBeCloseTo(0.5)
  })

  it('sessionSpeeds returns last 7 sessions with avgMs', () => {
    const attempts = [
      makeAttempt({ sessionId: 's1', timeTakenMs: 1000 }),
      makeAttempt({ sessionId: 's1', timeTakenMs: 3000 }),
    ]
    const sessions = [{ id: 's1', date: '2026-05-18' }]
    const stats = computeStats(attempts, sessions)
    expect(stats.sessionSpeeds).toHaveLength(1)
    expect(stats.sessionSpeeds[0].avgMs).toBe(2000)
  })

  it('returns empty arrays when no attempts', () => {
    const stats = computeStats([], [])
    expect(stats.weakestQuestions).toHaveLength(0)
    expect(stats.sessionSpeeds).toHaveLength(0)
    expect(stats.questionAccuracy).toEqual({})
    expect(stats.categoryAccuracy).toEqual({})
  })
})
