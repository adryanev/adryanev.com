import { Badge } from '@/components/ui'
import type { contentStatuses } from '@/db/schema/enums'

const contentStatusBadges = {
  published: { label: 'Published', tone: 'success' },
  draft: { label: 'Draft', tone: 'warning' },
} as const

export function ContentStatusBadge({
  status,
}: {
  status: (typeof contentStatuses)[number]
}) {
  const badge = contentStatusBadges[status]
  return <Badge tone={badge.tone}>{badge.label}</Badge>
}
