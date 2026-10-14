export function getArticleViewWindow(now = new Date()) {
  const firstDay = new Date(now)
  firstDay.setUTCDate(firstDay.getUTCDate() - 6)
  return {
    startDate: firstDay.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  }
}
