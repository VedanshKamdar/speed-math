import { shuffle } from '../data/questionBank'

function squareDistractors(question) {
  const n = Math.round(Math.sqrt(question.answer))
  const candidates = [-3, -2, -1, 1, 2, 3]
    .map(d => n + d)
    .filter(m => m >= 1 && m <= 30)
    .map(m => ({ value: m * m, answerDisplay: String(m * m), correct: false }))
  return shuffle(candidates).slice(0, 3)
}

function cubeDistractors(question, bank) {
  const sameCategory = bank.filter(q => q.category === 'cubes' && q.id !== question.id)
  return shuffle(sameCategory)
    .slice(0, 3)
    .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
}

function fractionDistractors(question, bank) {
  const sameCategory = bank.filter(q => q.category === 'fractions' && q.id !== question.id)
  return shuffle(sameCategory)
    .slice(0, 3)
    .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
}

function powerDistractors(question, bank) {
  const parts = question.id.split('-')
  const base = Number(parts[1])
  const exp = Number(parts[2])
  const candidates = bank
    .filter(q => {
      if (q.id === question.id) return false
      const p = q.id.split('-')
      if (p[0] !== 'pow') return false
      const qBase = Number(p[1])
      const qExp = Number(p[2])
      return (qBase === base && Math.abs(qExp - exp) <= 2) ||
             (qExp === exp && Math.abs(qBase - base) <= 2)
    })
    .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
  const pool = candidates.length >= 3
    ? candidates
    : bank
        .filter(q => q.category === question.category && q.id !== question.id)
        .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
  return shuffle(pool).slice(0, 3)
}

function nearbyIntDistractors(correctN, min, max, span = 3) {
  const offsets = []
  for (let d = -span; d <= span; d++) if (d !== 0) offsets.push(d)
  const candidates = offsets
    .map(d => correctN + d)
    .filter(m => m >= min && m <= max)
    .map(m => ({ value: m, answerDisplay: String(m), correct: false }))
  return shuffle(candidates).slice(0, 3)
}

function sqrtDistractors(question) {
  return nearbyIntDistractors(question.answer, 1, 30, 3)
}

function cbrtDistractors(question) {
  return nearbyIntDistractors(question.answer, 1, 15, 3)
}

function pctToFracDistractors(question) {
  return nearbyIntDistractors(question.answer, 2, 30, 4)
}

function logDistractors(question, bank) {
  const sameBase = bank.filter(q => q.category === question.category && q.id !== question.id)
  return shuffle(sameBase).slice(0, 3)
    .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
}

export function generateOptions(question, bank) {
  const correct = {
    value: question.answer,
    answerDisplay: question.answerDisplay,
    correct: true,
  }

  let distractors
  if      (question.category === 'squares')      distractors = squareDistractors(question, bank)
  else if (question.category === 'cubes')        distractors = cubeDistractors(question, bank)
  else if (question.category === 'fractions')    distractors = fractionDistractors(question, bank)
  else if (question.category === 'square-roots') distractors = sqrtDistractors(question)
  else if (question.category === 'cube-roots')   distractors = cbrtDistractors(question)
  else if (question.category === 'pct-to-frac')  distractors = pctToFracDistractors(question)
  else if (question.category.startsWith('powers-'))  distractors = powerDistractors(question, bank)
  else if (question.category.startsWith('log-base')) distractors = logDistractors(question, bank)
  else {
    const pool = bank.filter(q => q.category === question.category && q.id !== question.id)
    distractors = shuffle(pool).slice(0, 3).map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
  }

  const unique = distractors.filter(d => d.answerDisplay !== correct.answerDisplay).slice(0, 3)
  return shuffle([correct, ...unique])
}
