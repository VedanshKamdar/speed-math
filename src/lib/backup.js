import { exportAllData, importAllData } from '../db'

export async function downloadBackup() {
  const data = await exportAllData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `speed-math-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return { sessions: data.sessions.length, attempts: data.attempts.length }
}

export async function restoreFromFile(file) {
  const text = await file.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Could not read the file — it must be valid JSON.')
  }
  return importAllData(parsed)
}
