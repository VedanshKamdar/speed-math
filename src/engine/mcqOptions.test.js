import { describe, it, expect } from 'vitest'
import { generateOptions } from './mcqOptions'
import { QUESTION_BANK } from '../data/questionBank'

describe('generateOptions', () => {
  it('returns exactly 4 options', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sq-13')
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts).toHaveLength(4)
  })

  it('includes the correct answer', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sq-13') // 169
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts.some(o => o.value === q.answer && o.correct)).toBe(true)
  })

  it('all options are distinct', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sq-15') // 225
    const opts = generateOptions(q, QUESTION_BANK)
    const values = opts.map(o => o.answerDisplay)
    expect(new Set(values).size).toBe(4)
  })

  it('generates options for fractions', () => {
    const q = QUESTION_BANK.find(q => q.id === 'frac-7') // 14.29%
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts).toHaveLength(4)
    expect(opts.some(o => o.correct)).toBe(true)
  })

  it('generates options for cubes', () => {
    const q = QUESTION_BANK.find(q => q.id === 'cb-7') // 343
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts).toHaveLength(4)
  })

  it('generates options for powers', () => {
    const q = QUESTION_BANK.find(q => q.id === 'pow-2-10') // 1024
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts).toHaveLength(4)
    expect(opts.some(o => o.correct && o.value === 1024)).toBe(true)
  })

  it('each option has value, answerDisplay, and correct fields', () => {
    const q = QUESTION_BANK.find(q => q.id === 'frac-5')
    const opts = generateOptions(q, QUESTION_BANK)
    for (const o of opts) {
      expect(o).toHaveProperty('value')
      expect(o).toHaveProperty('answerDisplay')
      expect(o).toHaveProperty('correct')
    }
  })
})
