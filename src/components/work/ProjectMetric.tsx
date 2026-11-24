import type { ProjectMetric as ProjectMetricData } from '@/lib/project-metrics'

export function ProjectMetric({ metric }: { metric: ProjectMetricData }) {
  return (
    <div className="project-metric">
      <b>{metric.value}</b>
      <span>{metric.label}</span>
    </div>
  )
}
