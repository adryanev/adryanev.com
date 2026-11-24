import { z } from 'zod'

// A measured outcome shown on the home page and the case study, e.g. 30× / monthly sales value
export type ProjectMetric = { value: string; label: string }

// Layouts show metrics in a two-column grid; four fills two rows
export const MAX_PROJECT_METRICS = 4
// Values are short figures such as "30×", "35,000+" or "14 s → 2.6 s"
export const METRIC_VALUE_MAX_LENGTH = 16
export const METRIC_LABEL_MAX_LENGTH = 120
export const METRICS_NOTE_MAX_LENGTH = 240

const metricSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, 'Each metric needs a value')
    .max(METRIC_VALUE_MAX_LENGTH, `Metric values are at most ${METRIC_VALUE_MAX_LENGTH} characters`),
  label: z
    .string()
    .trim()
    .min(1, 'Each metric needs a label')
    .max(METRIC_LABEL_MAX_LENGTH, `Metric labels are at most ${METRIC_LABEL_MAX_LENGTH} characters`),
})

const projectMetricsSchema = z.object({
  metrics: z
    .array(metricSchema)
    .max(MAX_PROJECT_METRICS, `A project has at most ${MAX_PROJECT_METRICS} metrics`),
  metricsNote: z
    .string()
    .trim()
    .max(METRICS_NOTE_MAX_LENGTH, `The metrics note is at most ${METRICS_NOTE_MAX_LENGTH} characters`)
    .nullish()
    .transform((note) => note || null),
})

export type ProjectMetricsInput = {
  metrics: ProjectMetric[]
  metricsNote: string | null
}

export function parseProjectMetrics(input: unknown): ProjectMetricsInput {
  const result = projectMetricsSchema.safeParse(input)
  if (!result.success) throw new Error(result.error.issues[0].message)
  return result.data
}
