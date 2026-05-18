export function computeStats(attempts, sessions) {
  // Per-question accuracy
  const byQuestion = {}
  for (const a of attempts) {
    if (!byQuestion[a.questionId]) byQuestion[a.questionId] = { correct: 0, total: 0, category: a.category }
    byQuestion[a.questionId].total++
    if (a.correct) byQuestion[a.questionId].correct++
  }

  const questionAccuracy = {}
  for (const [qid, data] of Object.entries(byQuestion)) {
    questionAccuracy[qid] = data.total > 0 ? data.correct / data.total : 0
  }

  // Per-category accuracy (mean of per-question accuracies)
  const categoryBuckets = {}
  for (const [qid, data] of Object.entries(byQuestion)) {
    if (!categoryBuckets[data.category]) categoryBuckets[data.category] = []
    categoryBuckets[data.category].push(questionAccuracy[qid])
  }

  const categoryAccuracy = {}
  for (const [cat, accs] of Object.entries(categoryBuckets)) {
    categoryAccuracy[cat] = accs.reduce((s, v) => s + v, 0) / accs.length
  }

  // Weakest questions (min 3 attempts, sorted by accuracy asc, top 10)
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

  // Speed trend: average timeTakenMs per session, last 14 sessions sorted by time
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
        avgMs: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      }
    })

  return { questionAccuracy, categoryAccuracy, weakestQuestions, sessionSpeeds }
}
