import { pgEnum } from 'drizzle-orm/pg-core'

export const contentStatusEnum = pgEnum('content_status', [
  'draft',
  'published',
])

export const resumeTypeEnum = pgEnum('resume_type', [
  'experience',
  'education',
  'certification',
  'skill',
])

export const saasStatusEnum = pgEnum('saas_status', [
  'active',
  'beta',
  'retired',
])
