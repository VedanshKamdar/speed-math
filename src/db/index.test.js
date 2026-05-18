import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock idb before importing db functions
vi.mock('idb', () => {
  const store = {}
  const mockDB = {
    put: vi.fn((storeName, val) => {
      store[storeName] = store[storeName] || []
      // replace existing entry with same key or push new
      const existing = store[storeName].findIndex(v => v.id === val.id || v.key === val.key)
      if (existing >= 0) store[storeName][existing] = val
      else store[storeName].push(val)
      return Promise.resolve()
    }),
    getAll: vi.fn((storeName) => Promise.resolve(store[storeName] || [])),
    get: vi.fn((storeName, key) => Promise.resolve((store[storeName] || []).find(v => v.key === key))),
    transaction: vi.fn((storeName, mode) => ({
      store: {
        put: vi.fn((val) => {
          store[storeName] = store[storeName] || []
          store[storeName].push(val)
          return Promise.resolve()
        }),
      },
      done: Promise.resolve(),
    })),
  }
  return {
    openDB: vi.fn(() => Promise.resolve(mockDB)),
  }
})

import { saveSession, saveAttempts, getAttempts, getSessions, getMeta, setMeta } from './index'

describe('db layer', () => {
  it('saveSession stores a session object', async () => {
    const session = { id: 's1', mode: 'sprint', categories: ['tables'], date: '2026-05-18', completed: false }
    await saveSession(session)
    const all = await getSessions()
    expect(all.some(s => s.id === 's1')).toBe(true)
  })

  it('saveAttempts stores multiple attempts', async () => {
    const attempts = [
      { id: 'a1', sessionId: 's1', questionId: 'tbl-1x1', correct: true, timeTakenMs: 1200 },
      { id: 'a2', sessionId: 's1', questionId: 'tbl-2x2', correct: false, timeTakenMs: 3000 },
    ]
    await saveAttempts(attempts)
    const all = await getAttempts()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })

  it('setMeta and getMeta round-trip', async () => {
    await setMeta('streak', { count: 5, lastSessionDate: '2026-05-18' })
    const val = await getMeta('streak')
    expect(val.count).toBe(5)
  })
})
