export type WorkProject = {
  id: number
  title: string
  slug: string
  year: number
  role: string
  workplace: string
  technology: string[]
}

export type WorkCategory = {
  id: number
  name: string
  slug: string
  description: string | null
  projects: WorkProject[]
}
