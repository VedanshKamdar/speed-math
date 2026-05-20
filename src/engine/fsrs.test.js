import { describe, it, expect } from 'vitest'
import { updateCard, retrievability, currentRetrievability, DEFAULT_W } from './fsrs'

const DAY = 86_400_000

describe('retrievability', () => {
  it('R = 1.0 when no time has passed', () => {
    expect(retrievability(0, 10)).toBeCloseTo(1.0, 5)
  })

  it('R = 0.9 when elapsedDays equals stability', () => {
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 5)
  })

  it('R decays toward 0 over many stability-units', () => {
    expect(retrievability(100, 10)).toBeLessThan(0.4)
  })
})

describe('updateCard — first review', () => {
  it('creates a state from null with grade 3 (Good)', () => {
    const s = updateCard(null, 3, 1_000_000)
    expect(s.reps).toBe(1)
    expect(s.lapses).toBe(0)
    expect(s.stability).toBeGreaterThan(0)
    expect(s.difficulty).toBeGreaterThanOrEqual(1)
    expect(s.difficulty).toBeLessThanOrEqual(10)
    expect(s.lastReviewedAt).toBe(1_000_000)
  })

  it('grade Again (1) records a lapse on first review', () => {
    const s = updateCard(null, 1, 1_000_000)
    expect(s.lapses).toBe(1)
  })

  it('grade Easy (4) produces higher initial stability than Hard (2)', () => {
    const easy = updateCard(null, 4, 0)
    const hard = updateCard(null, 2, 0)
    expect(easy.stability).toBeGreaterThan(hard.stability)
  })
})

describe('updateCard — subsequent reviews', () => {
  it('successful reviews increase stability over time', () => {
    let s = updateCard(null, 3, 0)
    const s0 = s.stability
    s = updateCard(s, 3, s0 * DAY)   // review at first due date
    expect(s.stability).toBeGreaterThan(s0)
  })

  it('a lapse decreases stability', () => {
    let s = updateCard(null, 4, 0)
    s = updateCard(s, 4, s.stability * DAY)
    const beforeLapse = s.stability
    s = updateCard(s, 1, s.stability * DAY)
    expect(s.stability).toBeLessThan(beforeLapse)
    expect(s.lapses).toBe(1)
  })

  it('reps counter increments on every review', () => {
    let s = updateCard(null, 3, 0)
    s = updateCard(s, 3, 1 * DAY)
    s = updateCard(s, 3, 5 * DAY)
    expect(s.reps).toBe(3)
  })
})

describe('currentRetrievability', () => {
  it('returns 0 for a null state (unseen)', () => {
    expect(currentRetrievability(null, Date.now())).toBe(0)
  })

  it('returns ~1 immediately after a review', () => {
    const s = updateCard(null, 3, 1_000_000)
    expect(currentRetrievability(s, 1_000_000)).toBeCloseTo(1.0, 5)
  })

  it('decays as time passes', () => {
    const s = updateCard(null, 3, 0)
    const rNow = currentRetrievability(s, 0)
    const rLater = currentRetrievability(s, s.stability * DAY * 5)
    expect(rLater).toBeLessThan(rNow)
  })
})

describe('DEFAULT_W', () => {
  it('has 17 parameters', () => {
    expect(DEFAULT_W).toHaveLength(17)
  })
})
