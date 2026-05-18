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
    expect(stats.overallMastery).toBeNull()
    expect(stats.masteryDelta).toBeNull()
    expect(stats.drillTargets).toHaveLength(0)
  })
})

describe('mastery scoring', () => {
  it('perfect accuracy at 3s = mastery 100', () => {
    const attempts = Array.from({ length: 3 }, () =>
      makeAttempt({ questionId: 'tbl-7x14', category: 'tables', correct: true, timeTakenMs: 3000 })
    )
    const stats = computeStats(attempts, [])
    expect(stats.questionMastery['tbl-7x14'].mastery).toBe(100)
  })

  it('100% accuracy at 6s gives lower mastery than at 3s', () => {
    const fast = computeStats(
      Array.from({ length: 3 }, () => makeAttempt({ correct: true, timeTakenMs: 3000 })),
      []
    )
    const slow = computeStats(
      Array.from({ length: 3 }, () => makeAttempt({ correct: true, timeTakenMs: 6000 })),
      []
    )
    expect(fast.questionMastery['tbl-7x14'].mastery).toBeGreaterThan(
      slow.questionMastery['tbl-7x14'].mastery
    )
  })

  it('overallMastery is the mean of per-question mastery', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: true, timeTakenMs: 3000 }),
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: true, timeTakenMs: 3000 }),
      makeAttempt({ questionId: 'sq-6', category: 'squares', correct: false, timeTakenMs: 3000 }),
      makeAttempt({ questionId: 'sq-6', category: 'squares', correct: false, timeTakenMs: 3000 }),
    ]
    const stats = computeStats(attempts, [])
    const m5 = stats.questionMastery['sq-5'].mastery
    const m6 = stats.questionMastery['sq-6'].mastery
    expect(stats.overallMastery).toBe(Math.round((m5 + m6) / 2))
  })

  it('categorySpeed is the avg timeTakenMs across questions in that category', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: true, timeTakenMs: 2000 }),
      makeAttempt({ questionId: 'sq-6', category: 'squares', correct: true, timeTakenMs: 4000 }),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.categorySpeed['squares']).toBe(3000)
  })

  it('drillTargets excludes questions with fewer than 3 attempts', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: false, timeTakenMs: 5000 }),
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: false, timeTakenMs: 5000 }),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.drillTargets.find(t => t.questionId === 'sq-1')).toBeUndefined()
  })

  it('drillTargets sorts lowest mastery first', () => {
    const attempts = [
      // sq-2: 100% correct, fast → high mastery
      ...Array.from({ length: 3 }, () =>
        makeAttempt({ questionId: 'sq-2', category: 'squares', correct: true, timeTakenMs: 2000 })
      ),
      // sq-3: 0% correct, slow → low mastery
      ...Array.from({ length: 3 }, () =>
        makeAttempt({ questionId: 'sq-3', category: 'squares', correct: false, timeTakenMs: 6000 })
      ),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.drillTargets[0].questionId).toBe('sq-3')
  })

  it('masteryDelta is null when fewer than 5 distinct questions in a week', () => {
    const attempts = [makeAttempt({ date: '2026-05-18', correct: true, timeTakenMs: 2000 })]
    const stats = computeStats(attempts, [])
    expect(stats.masteryDelta).toBeNull()
  })
})
