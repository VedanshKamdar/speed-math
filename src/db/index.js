import { openDB } from 'idb'

const DB_NAME = 'speed-math'
const DB_VERSION = 2

let dbPromise = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('attempts')) {
          const store = db.createObjectStore('attempts', { keyPath: 'id' })
          store.createIndex('by-session', 'sessionId')
          store.createIndex('by-question', 'questionId')
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
        // v2: per-fact FSRS state, keyed by factKey (siblings share a record).
        if (oldVersion < 2 && !db.objectStoreNames.contains('cardState')) {
          db.createObjectStore('cardState', { keyPath: 'factKey' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveSession(session) {
  const db = await getDB()
  await db.put('sessions', session)
}

export async function getSessions() {
  const db = await getDB()
  return db.getAll('sessions')
}

export async function saveAttempts(attempts) {
  const db = await getDB()
  const tx = db.transaction('attempts', 'readwrite')
  await Promise.all([...attempts.map(a => tx.store.put(a)), tx.done])
}

export async function getAttempts() {
  const db = await getDB()
  return db.getAll('attempts')
}

export async function getMeta(key) {
  const db = await getDB()
  const record = await db.get('meta', key)
  return record ? record.value : null
}

export async function setMeta(key, value) {
  const db = await getDB()
  await db.put('meta', { key, value })
}

// One-time migration: replay existing attempts through FSRS to seed cardState.
// Idempotent — gated by a meta flag, safe to call on every app boot.
export async function migrateAttemptsToCardState(replayFn, questionsById) {
  const done = await getMeta('cardState_migrated_v1')
  if (done) return { migrated: false, reason: 'already-migrated' }

  const attempts = await getAttempts()
  if (attempts.length === 0) {
    await setMeta('cardState_migrated_v1', true)
    return { migrated: false, reason: 'no-attempts' }
  }

  const states = replayFn(attempts, questionsById)
  await saveCardStates(states)
  await setMeta('cardState_migrated_v1', true)
  return { migrated: true, count: Object.keys(states).length }
}

// ─── cardState (FSRS per-fact state) ────────────────────────────────────────

// Returns { [factKey]: { difficulty, stability, lastReviewedAt, reps, lapses, factKey } }
export async function getCardStates() {
  const db = await getDB()
  const rows = await db.getAll('cardState')
  const out = {}
  for (const r of rows) out[r.factKey] = r
  return out
}

// Persist an arbitrary slice of cardState entries.
export async function saveCardStates(states) {
  const entries = Array.isArray(states) ? states : Object.values(states)
  if (entries.length === 0) return
  const db = await getDB()
  const tx = db.transaction('cardState', 'readwrite')
  await Promise.all([...entries.map(s => tx.store.put(s)), tx.done])
}

export async function exportAllData() {
  const db = await getDB()
  const [sessions, attempts, meta, cardState] = await Promise.all([
    db.getAll('sessions'),
    db.getAll('attempts'),
    db.getAll('meta'),
    db.getAll('cardState'),
  ])
  return {
    app: 'speed-math',
    version: 2,
    exportedAt: new Date().toISOString(),
    sessions,
    attempts,
    meta,
    cardState,
  }
}

export async function importAllData(data) {
  if (data?.app !== 'speed-math') {
    throw new Error('This file is not a Speed Math backup.')
  }
  if (!Array.isArray(data.sessions) || !Array.isArray(data.attempts) || !Array.isArray(data.meta)) {
    throw new Error('Backup file is incomplete or corrupted.')
  }
  const db = await getDB()
  await Promise.all([
    db.clear('sessions'),
    db.clear('attempts'),
    db.clear('meta'),
    db.clear('cardState'),
  ])

  const writeAll = async (store, rows) => {
    if (!rows || rows.length === 0) return
    const tx = db.transaction(store, 'readwrite')
    await Promise.all([...rows.map(r => tx.store.put(r)), tx.done])
  }
  await writeAll('sessions',  data.sessions)
  await writeAll('attempts',  data.attempts)
  await writeAll('meta',      data.meta)
  await writeAll('cardState', data.cardState || [])

  return {
    sessions: data.sessions.length,
    attempts: data.attempts.length,
    cardState: (data.cardState || []).length,
  }
}
