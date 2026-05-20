// Scheduler — decides which questions to surface and in what order.
//
// Owns three responsibilities:
//   1. factKey(question)         → canonical key shared by sibling cards
//   2. gradeFromAttempt(...)     → maps (correct, time, format) → 1..4 FSRS grade
//   3. pickQuestions(...)        → ranks a pool by FSRS urgency for a session

import { updateCard, currentRetrievability } from './fsrs'
import { shuffle } from '../data/questionBank'

// 7×8 and 8×7 share state; sqrt(n²) and n² do NOT (different mental skills).
export function factKey(question) {
  if (question.factKey) return question.factKey
  return question.id  // fallback: each question is its own fact
}

// Default speed targets per category when not specified on the question itself.
const DEFAULT_TARGET_MS = {
  tables: 2500,
  squares: 1500,
  cubes: 2500,
  fractions: 2000,
  'square-roots': 2000,
  'cube-roots': 2500,
  'pct-to-frac': 2000,
  approximation: 5000,
}

function speedTargetFor(question) {
  if (question.speedTargetMs) return question.speedTargetMs
  if (question.category.startsWith('powers-')) return 2500
  if (question.category.startsWith('log-'))    return 2500
  return DEFAULT_TARGET_MS[question.category] || 2500
}

// Map (correct, time-taken, format) to an FSRS grade.
//   Wrong              → 1 (Again)
//   Correct, ≤ target  → 4 (Easy)
//   Correct, ≤ 2× tgt  → 3 (Good)
//   Correct, ≤ 4× tgt  → 2 (Hard)
//   Correct, > 4× tgt  → 1 (Again) — too slow to count as a recall
//
// MCQ correctness is capped at Good — guessing inflates correct-rate so we
// never let an MCQ pass count as "Easy."
export function gradeFromAttempt({ correct, timeTakenMs, question, format }) {
  if (!correct) return 1
  const target = speedTargetFor(question)
  let grade
  if      (timeTakenMs <= target)         grade = 4
  else if (timeTakenMs <= 2 * target)     grade = 3
  else if (timeTakenMs <= 4 * target)     grade = 2
  else                                    grade = 1
  if (format === 'mcq' && grade === 4) grade = 3   // cap MCQ at Good
  return grade
}

// Apply one attempt to the cardStates map. Mutates in place; returns the map.
// `nowMs` is the timestamp the attempt was made (epoch ms).
export function applyAttempt(cardStates, question, { correct, timeTakenMs, format, nowMs }) {
  const grade = gradeFromAttempt({ correct, timeTakenMs, question, format })
  const fk = factKey(question)
  cardStates[fk] = updateCard(cardStates[fk] || null, grade, nowMs)
  cardStates[fk].factKey = fk   // ensure factKey is on the record for persistence
  return cardStates
}

// Rate of new-card introduction: at most 1 new card per N existing cards
// in the produced ordering. Keeps sessions feeling like review, not a flood.
const DUE_PER_NEW = 4

// Urgency of an already-seen card at `nowMs`. Higher = more urgent.
// Defined as 1 - retrievability so a card with R=0.3 is more urgent than R=0.9.
function urgencyOf(state, nowMs) {
  return 1 - currentRetrievability(state, nowMs)
}

// Order a pool of questions by FSRS urgency. New cards (no state) are mixed in
// at a controlled rate so they don't crowd out review.
//
// Sibling questions that share a factKey (e.g. 7×14 and 14×7) collapse to one
// random direction per session — practising both directions across sessions,
// never both within the same session.
//
// The full pool is returned in scheduled order; callers slice as needed.
export function pickQuestions({ pool, cardStates, nowMs }) {
  const groups = new Map()   // factKey → array of sibling questions
  for (const q of pool) {
    const fk = factKey(q)
    if (!groups.has(fk)) groups.set(fk, [])
    groups.get(fk).push(q)
  }
  const dedupedPool = [...groups.values()].map(siblings =>
    siblings.length === 1 ? siblings[0] : siblings[Math.floor(Math.random() * siblings.length)]
  )

  const dueList = []   // already-seen, sorted by urgency desc
  const newList = []   // unseen, randomised
  for (const q of dedupedPool) {
    const state = cardStates[factKey(q)]
    if (state) dueList.push({ q, urgency: urgencyOf(state, nowMs) })
    else       newList.push(q)
  }
  dueList.sort((a, b) => b.urgency - a.urgency)
  const newShuffled = shuffle(newList)

  const result = []
  let di = 0, ni = 0
  let dueSinceNew = DUE_PER_NEW   // allow first slot to be a new card
  while (di < dueList.length || ni < newShuffled.length) {
    if (dueSinceNew >= DUE_PER_NEW && ni < newShuffled.length) {
      result.push(newShuffled[ni++])
      dueSinceNew = 0
    } else if (di < dueList.length) {
      result.push(dueList[di++].q)
      dueSinceNew++
    } else {
      result.push(newShuffled[ni++])
    }
  }
  return result
}

// Replay a chronologically-ordered attempt log through FSRS to seed cardState.
// Used for one-time migration from the previous mastery-based engine.
export function replayAttempts(attempts, questionsById) {
  const sorted = [...attempts].sort((a, b) => {
    const ta = a.timestamp ?? new Date(a.date).getTime()
    const tb = b.timestamp ?? new Date(b.date).getTime()
    return ta - tb
  })
  const cardStates = {}
  for (const att of sorted) {
    const q = questionsById[att.questionId]
    if (!q) continue
    const nowMs = att.timestamp ?? new Date(att.date).getTime()
    applyAttempt(cardStates, q, {
      correct: att.correct,
      timeTakenMs: att.timeTakenMs,
      format: att.format,
      nowMs,
    })
  }
  return cardStates
}
