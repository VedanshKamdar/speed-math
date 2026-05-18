function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function computeNewStreak(prior, today) {
  if (!prior) return { count: 1, lastSessionDate: today }
  const { count, lastSessionDate } = prior
  if (lastSessionDate === today) return { count, lastSessionDate: today }
  if (addDays(lastSessionDate, 1) === today) return { count: count + 1, lastSessionDate: today }
  return { count: 1, lastSessionDate: today }
}
