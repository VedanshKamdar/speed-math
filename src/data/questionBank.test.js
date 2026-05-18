import { describe, it, expect } from 'vitest'
import { QUESTION_BANK, getByCategory, CATEGORY_FORMAT } from './questionBank'

describe('QUESTION_BANK', () => {
  it('has 763 total questions', () => {
    expect(QUESTION_BANK).toHaveLength(763)
  })

  it('has 500 table questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'tables')).toHaveLength(500)
  })

  it('has 25 square questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'squares')).toHaveLength(25)
  })

  it('has 12 cube questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'cubes')).toHaveLength(12)
  })

  it('has 50 power questions total', () => {
    const powers = QUESTION_BANK.filter(q => q.category.startsWith('powers-'))
    expect(powers).toHaveLength(50)
  })

  it('has 30 fraction questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'fractions')).toHaveLength(30)
  })

  it('all IDs are unique', () => {
    const ids = QUESTION_BANK.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('7 × 14 = 98', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x14')
    expect(q.answer).toBe(98)
  })

  it('13² = 169', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sq-13')
    expect(q.answer).toBe(169)
  })

  it('2^10 = 1024', () => {
    const q = QUESTION_BANK.find(q => q.id === 'pow-2-10')
    expect(q.answer).toBe(1024)
  })

  it('1/7 = 14.29%', () => {
    const q = QUESTION_BANK.find(q => q.id === 'frac-7')
    expect(q.answer).toBe('14.29%')
  })

  it('tables subcategory 21-25 has 100 questions', () => {
    expect(getByCategory('tables', '21-25')).toHaveLength(100)
  })

  it('√169 = 13 (square root reverse)', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sqrt-13')
    expect(q.answer).toBe(13)
    expect(q.prompt).toBe('√169')
  })

  it('∛1728 = 12 (cube root reverse)', () => {
    const q = QUESTION_BANK.find(q => q.id === 'cbrt-12')
    expect(q.answer).toBe(12)
    expect(q.prompt).toBe('∛1728')
  })

  it('2^? = 1024 → 10 (log reverse)', () => {
    const q = QUESTION_BANK.find(q => q.id === 'log-2-10')
    expect(q.answer).toBe(10)
    expect(q.prompt).toBe('2^? = 1024')
  })

  it('14.29% = 1/7 (pct to fraction reverse)', () => {
    const q = QUESTION_BANK.find(q => q.id === 'pct-7')
    expect(q.answer).toBe(7)
    expect(q.prompt).toBe('14.29% = 1/?')
  })

  it('has 30 approximation questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'approximation')).toHaveLength(30)
  })

  it('approximation questions have a tolerance', () => {
    const q = QUESTION_BANK.find(q => q.id === 'approx-pct-23-478')
    expect(q.tolerance).toBe(0.05)
    expect(q.answer).toBeCloseTo(109.94, 2)
    expect(q.prompt).toBe('23% of 478')
  })

  it('all reverse categories use mcq format', () => {
    const reverseCats = [
      'square-roots', 'cube-roots', 'pct-to-frac',
      'log-base2', 'log-base3', 'log-base4', 'log-base5',
      'log-base6', 'log-base7', 'log-base8', 'log-base9',
    ]
    for (const cat of reverseCats) {
      expect(CATEGORY_FORMAT[cat]).toBe('mcq')
    }
  })
})
