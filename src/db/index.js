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
