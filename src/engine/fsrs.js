// FSRS-4.5 implementation for mental-arithmetic drill scheduling.
//
// Adapted from the open-source FSRS algorithm. Grades are 1-4:
//   1 = Again  (wrong, or too slow to be useful)
//   2 = Hard   (correct, but slow)
//   3 = Good   (correct, on-target speed)
//   4 = Easy   (correct, fast)
//
// All stability values are in days. Retrievability is the predicted
// probability the user still knows the fact, in [0, 1].

export const DEFAULT_W = [
  0.4072, 1.1829, 3.1262, 15.4722,
  7.2102, 0.5316, 1.0651, 0.0234,
  1.616,  0.1544, 1.0824, 1.9813,
  0.0953, 0.2975, 2.2042, 0.2407,
  2.9466,
]

const MIN_STABILITY = 0.1
const MAX_STABILITY = 36500   // 100 years
const DECAY_LN09 = Math.log(0.9)   // negative number

function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)) }

// Predicted retrievability after `elapsedDays` since the last review.
// Uses the FSRS-4.5 exponential form: R = exp(ln(0.9) · t / S).
export function retrievability(elapsedDays, stability) {
  if (stability <= 0) return 0
  return Math.exp(DECAY_LN09 * elapsedDays / stability)
}

// Initial stability for the first review of a card (grade ∈ {1..4}).
function initialStability(grade, w) {
  return clamp(w[grade - 1], MIN_STABILITY, MAX_STABILITY)
}

// Initial difficulty for the first review of a card.
function initialDifficulty(grade, w) {
  return clamp(w[4] - (grade - 3) * w[5], 1, 10)
}

// Mean-reverted difficulty update.
function nextDifficulty(d, grade, w) {
  const dRaw = d - w[6] * (grade - 3)
  const dDefault = initialDifficulty(4, w)
  const dNext = w[7] * dDefault + (1 - w[7]) * dRaw
  return clamp(dNext, 1, 10)
}

// Stability after a successful review (grade ≥ 2).
function nextStabilitySuccess(d, s, r, grade, w) {
  const hardPenalty = grade === 2 ? w[15] : 1
  const easyBonus   = grade === 4 ? w[16] : 1
  const sNext = s * (1 +
    Math.exp(w[8]) *
    (11 - d) *
    Math.pow(s, -w[9]) *
    (Math.exp(w[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus
  )
  return clamp(sNext, MIN_STABILITY, MAX_STABILITY)
}

// Stability after a lapse (grade = 1).
function nextStabilityLapse(d, s, r, w) {
  const sNext = w[11] *
    Math.pow(d, -w[12]) *
    (Math.pow(s + 1, w[13]) - 1) *
    Math.exp(w[14] * (1 - r))
  return clamp(sNext, MIN_STABILITY, MAX_STABILITY)
}

// Run one review through FSRS. Returns a fresh state object — never mutates.
//
// state: previous { difficulty, stability, lastReviewedAt, reps, lapses } or null
// grade: 1..4
// nowMs: epoch milliseconds at which the review happened
// w:     17-element parameter vector (defaults to DEFAULT_W)
export function updateCard(state, grade, nowMs, w = DEFAULT_W) {
  if (!state) {
    return {
      difficulty: initialDifficulty(grade, w),
      stability:  initialStability(grade, w),
      lastReviewedAt: nowMs,
      reps:  1,
      lapses: grade === 1 ? 1 : 0,
    }
  }
  const elapsedDays = Math.max(0, (nowMs - state.lastReviewedAt) / 86_400_000)
  const r = retrievability(elapsedDays, state.stability)
  const d = nextDifficulty(state.difficulty, grade, w)
  const s = grade === 1
    ? nextStabilityLapse(d, state.stability, r, w)
    : nextStabilitySuccess(d, state.stability, r, grade, w)
  return {
    difficulty: d,
    stability:  s,
    lastReviewedAt: nowMs,
    reps:  state.reps + 1,
    lapses: state.lapses + (grade === 1 ? 1 : 0),
  }
}

// Predicted retrievability of a card at `nowMs`. Null state = treat as new (R=0).
export function currentRetrievability(state, nowMs) {
  if (!state) return 0
  const elapsedDays = Math.max(0, (nowMs - state.lastReviewedAt) / 86_400_000)
  return retrievability(elapsedDays, state.stability)
}
