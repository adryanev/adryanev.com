// Resume dates are ISO calendar dates (YYYY-MM-DD), which parse as UTC midnight,
// so formatting in UTC keeps "2025-06-01" from showing as May west of UTC
const monthYear = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatResumeDateRange(
  start: string | null,
  end: string | null,
): string {
  const format = (date: string) => monthYear.format(new Date(date))
  if (start && end) return `${format(start)} – ${format(end)}`
  if (start) return `${format(start)} – Present`
  if (end) return `Until ${format(end)}`
  return ''
}
