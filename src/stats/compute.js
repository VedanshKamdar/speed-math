const MASTERY_TARGET_MS = 3000

function masteryScore(accuracy, avgMs) {
  const speedScore = Math.min(1, MASTERY_TARGET_MS / avgMs)
  return Math.round((0.6 * accuracy + 0.4 * speedScore) * 100)
}

export function computeStats(attempts, sessions) {
  // Per-question: accuracy + timing
  const byQuestion = {}
  for (const a of attempts) {
    if (!byQuestion[a.questionId]) {
      byQuestion[a.questionId] = { correct: 0, total: 0, totalMs: 0, category: a.category }
    }
    byQuestion[a.questionId].total++
    byQuestion[a.questionId].totalMs += a.timeTakenMs
    if (a.correct) byQuestion[a.questionId].correct++
  }

  const questionAccuracy = {}
  for (const [qid, data] of Object.entries(byQuestion)) {
    questionAccuracy[qid] = data.total > 0 ? data.correct / data.total : 0
  }

  // Per-question mastery: accuracy weighted 60%, speed 40%
  const questionMastery = {}
  for (const [qid, data] of Object.entries(byQuestion)) {
    const accuracy = questionAccuracy[qid]
    const avgMs = data.totalMs / data.total
    questionMastery[qid] = {
      mastery: masteryScore(accuracy, avgMs),
      accuracy,
      avgMs,
      attempts: data.total,
      category: data.category,
    }
  }

  // Per-category: aggregate accuracy + speed → mastery
  const categoryBuckets = {}
  for (const [, data] of Object.entries(byQuestion)) {
    if (!categoryBuckets[data.category]) categoryBuckets[data.category] = { accs: [], mss: [] }
    categoryBuckets[data.category].accs.push(data.correct / data.total)
    categoryBuckets[data.category].mss.push(data.totalMs / data.total)
  }

  const categoryAccuracy = {}
  const categorySpeed = {}
  const categoryMastery = {}
  for (const [cat, { accs, mss }] of Object.entries(categoryBuckets)) {
    const avgAcc = accs.reduce((s, v) => s + v, 0) / accs.length
    const avgMs  = mss.reduce((s, v) => s + v, 0)  / mss.length
    categoryAccuracy[cat] = avgAcc
    categorySpeed[cat]    = avgMs
    categoryMastery[cat]  = masteryScore(avgAcc, avgMs)
  }

  // Overall mastery: mean of all attempted questions
  const masteryValues = Object.values(questionMastery).map(q => q.mastery)
  const overallMastery = masteryValues.length
    ? Math.round(masteryValues.reduce((s, v) => s + v, 0) / masteryValues.length)
    : null

  // Mastery delta: this week vs prior week (min 5 distinct questions each)
  const dayMs = 86400000
  const now = new Date()
  const last7Cutoff = new Date(now - 7  * dayMs).toISOString().slice(0, 10)
  const prev7Cutoff = new Date(now - 14 * dayMs).toISOString().slice(0, 10)

  function weekMastery(atts) {
    const bq = {}
    for (const a of atts) {
      if (!bq[a.questionId]) bq[a.questionId] = { correct: 0, total: 0, totalMs: 0 }
      bq[a.questionId].total++
      bq[a.questionId].totalMs += a.timeTakenMs
      if (a.correct) bq[a.questionId].correct++
    }
    const scores = Object.values(bq).map(d =>
      masteryScore(d.correct / d.total, d.totalMs / d.total)
    )
    return scores.length >= 5
      ? scores.reduce((s, v) => s + v, 0) / scores.length
      : null
  }

  const recentM = weekMastery(attempts.filter(a => a.date >= last7Cutoff))
  const priorM  = weekMastery(attempts.filter(a => a.date >= prev7Cutoff && a.date < last7Cutoff))
  const masteryDelta = recentM != null && priorM != null
    ? Math.round(recentM - priorM)
    : null

  // Drill targets: lowest mastery first, min 3 attempts
  const drillTargets = Object.entries(questionMastery)
    .filter(([, d]) => d.attempts >= 3)
    .map(([questionId, d]) => ({ questionId, ...d }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 10)

  // Weakest questions (accuracy-only, kept for backward compat)
  const weakestQuestions = Object.entries(byQuestion)
    .filter(([, data]) => data.total >= 3)
    .map(([questionId, data]) => ({
      questionId,
      category: data.category,
      accuracy: questionAccuracy[questionId],
      attempts: data.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10)

  // Speed trend: avg timeTakenMs per session, last 14 sessions
  const bySession = {}
  for (const a of attempts) {
    if (!bySession[a.sessionId]) bySession[a.sessionId] = []
    bySession[a.sessionId].push(a.timeTakenMs)
  }

  const sortedSessions = [...sessions].sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
  const sessionSpeeds = sortedSessions
    .slice(-14)
    .map(s => {
      const times = bySession[s.id] || []
      return {
        sessionId: s.id,
        date: s.date,
        avgMs: times.length
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : 0,
      }
    })

  return {
    questionAccuracy,
    categoryAccuracy,
    weakestQuestions,
    sessionSpeeds,
    questionMastery,
    categorySpeed,
    categoryMastery,
    overallMastery,
    masteryDelta,
    drillTargets,
  }
}
