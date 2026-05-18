import { describe, it, expect } from 'vitest'
import { QUESTION_BANK, getByCategory, CATEGORY_FORMAT } from './questionBank'

describe('QUESTION_BANK', () => {
  it('has 617 total questions', () => {
    expect(QUESTION_BANK).toHaveLength(617)
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
})
