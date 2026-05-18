import { describe, it, expect } from 'vitest'
import { computeNewStreak } from './streak'

describe('computeNewStreak', () => {
  it('starts streak at 1 when no prior session', () => {
    const result = computeNewStreak(null, '2026-05-18')
    expect(result).toEqual({ count: 1, lastSessionDate: '2026-05-18' })
  })

  it('increments streak when last session was yesterday', () => {
    const prior = { count: 5, lastSessionDate: '2026-05-17' }
    const result = computeNewStreak(prior, '2026-05-18')
    expect(result).toEqual({ count: 6, lastSessionDate: '2026-05-18' })
  })

  it('does not change count when last session was today', () => {
    const prior = { count: 5, lastSessionDate: '2026-05-18' }
    const result = computeNewStreak(prior, '2026-05-18')
    expect(result).toEqual({ count: 5, lastSessionDate: '2026-05-18' })
  })

  it('resets to 1 when streak is broken', () => {
    const prior = { count: 10, lastSessionDate: '2026-05-15' }
    const result = computeNewStreak(prior, '2026-05-18')
    expect(result).toEqual({ count: 1, lastSessionDate: '2026-05-18' })
  })

  it('handles month boundaries correctly', () => {
    const prior = { count: 3, lastSessionDate: '2026-04-30' }
    const result = computeNewStreak(prior, '2026-05-01')
    expect(result).toEqual({ count: 4, lastSessionDate: '2026-05-01' })
  })
})
