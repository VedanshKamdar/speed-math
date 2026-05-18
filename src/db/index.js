import { openDB } from 'idb'

const DB_NAME = 'speed-math'
const DB_VERSION = 1

let dbPromise = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
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

export async function exportAllData() {
  const db = await getDB()
  const [sessions, attempts, meta] = await Promise.all([
    db.getAll('sessions'),
    db.getAll('attempts'),
    db.getAll('meta'),
  ])
  return {
    app: 'speed-math',
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
    attempts,
    meta,
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
  await Promise.all([db.clear('sessions'), db.clear('attempts'), db.clear('meta')])

  const writeAll = async (store, rows) => {
    const tx = db.transaction(store, 'readwrite')
    await Promise.all([...rows.map(r => tx.store.put(r)), tx.done])
  }
  await writeAll('sessions', data.sessions)
  await writeAll('attempts', data.attempts)
  await writeAll('meta', data.meta)

  return {
    sessions: data.sessions.length,
    attempts: data.attempts.length,
  }
}
