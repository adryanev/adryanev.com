// Prints one UPDATE per project in PORTFOLIO_METRICS. Each statement sets both
// columns outright, so running the output again leaves the rows unchanged.
// scripts/set-project-metrics.sh runs it through `wrangler d1 execute`.
import { parseProjectMetrics } from '../lib/project-metrics'
import { PORTFOLIO_METRICS } from './portfolio-metrics'

const sqlString = (text: string) => `'${text.replace(/'/g, "''")}'`

const statements = Object.entries(PORTFOLIO_METRICS).map(([slug, input]) => {
  const { metrics, metricsNote } = parseProjectMetrics(input)
  const note = metricsNote === null ? 'NULL' : sqlString(metricsNote)
  return `UPDATE portfolio_projects SET metrics = ${sqlString(JSON.stringify(metrics))}, metrics_note = ${note} WHERE slug = ${sqlString(slug)};`
})

console.log(statements.join('\n'))
