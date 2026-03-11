import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  pdf,
} from '@react-pdf/renderer'

// ── Types ─────────────────────────────────────────────────
type ResumeEntry = {
  id: number
  type: string
  title: string
  organization: string | null
  organizationUrl: string | null
  location: string | null
  description: string | null
  technology: string[] | null
  startDate: string | null
  endDate: string | null
  sortOrder: number
}

type ResumeData = {
  experience: ResumeEntry[]
  education: ResumeEntry[]
  certification: ResumeEntry[]
  skill: ResumeEntry[]
}

// ── Styles ────────────────────────────────────────────────
const c = {
  primary: '#1e293b',
  secondary: '#475569',
  accent: '#0ea5e9',
  muted: '#94a3b8',
  border: '#cbd5e1',
  tagBg: '#f1f5f9',
  tagText: '#334155',
}

const s = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: c.primary,
    lineHeight: 1.35,
  },
  // Header — compact single-line contact
  header: {
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: c.accent,
    paddingBottom: 10,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: c.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: c.secondary,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 6,
    fontSize: 8,
    color: c.muted,
    alignItems: 'center',
  },
  contactLink: {
    color: c.accent,
    textDecoration: 'none',
    fontSize: 8,
  },
  contactSep: {
    color: c.border,
    fontSize: 8,
  },
  // Sections
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: c.accent,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
    marginBottom: 6,
  },
  // Entry — wrap=false keeps each entry together across page breaks
  entry: {
    marginBottom: 7,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  entryTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: c.primary,
    flex: 1,
  },
  entryDate: {
    fontSize: 8,
    color: c.muted,
    textAlign: 'right' as const,
    minWidth: 100,
  },
  entryOrg: {
    fontSize: 8.5,
    color: c.secondary,
    marginBottom: 1,
  },
  entryOrgLink: {
    fontSize: 8.5,
    color: c.accent,
    textDecoration: 'none',
  },
  entryDesc: {
    fontSize: 8,
    color: c.secondary,
    marginBottom: 2,
    fontStyle: 'italic' as const,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 1,
    paddingLeft: 6,
  },
  bullet: {
    fontSize: 8,
    color: c.muted,
    marginRight: 3,
    width: 6,
  },
  bulletText: {
    fontSize: 8,
    color: c.secondary,
    flex: 1,
  },
  // Tech tags — inline comma-separated to save vertical space
  techLine: {
    fontSize: 7.5,
    color: c.muted,
    marginTop: 2,
  },
  techLabel: {
    fontFamily: 'Helvetica-Bold',
    color: c.secondary,
    fontSize: 7.5,
  },
  // Skills — compact grid
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: c.primary,
    width: 80,
  },
  skillValue: {
    fontSize: 8,
    color: c.secondary,
    flex: 1,
  },
  // Certification — compact row
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  certTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: c.primary,
  },
  certOrg: {
    fontSize: 8,
    color: c.secondary,
  },
  certDate: {
    fontSize: 8,
    color: c.muted,
  },
  certDesc: {
    fontSize: 7.5,
    color: c.secondary,
    paddingLeft: 6,
    marginBottom: 2,
  },
})

// ── Helpers ───────────────────────────────────────────────
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function fmtRange(start: string | null, end: string | null): string {
  if (start && end) return `${fmtDate(start)} — ${fmtDate(end)}`
  if (start) return `${fmtDate(start)} — Present`
  if (end) return `Until ${fmtDate(end)}`
  return ''
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

// ── Components ────────────────────────────────────────────
function ExperienceEntry({ entry }: { entry: ResumeEntry }) {
  const sentences = entry.description ? splitSentences(entry.description) : []
  const companyDesc = sentences.length > 1 ? sentences[0] : null
  const bullets = sentences.length > 1 ? sentences.slice(1) : sentences

  return (
    <View style={s.entry} wrap={false}>
      <View style={s.entryHeader}>
        <Text style={s.entryTitle}>{entry.title}</Text>
        {(entry.startDate || entry.endDate) && (
          <Text style={s.entryDate}>
            {fmtRange(entry.startDate, entry.endDate)}
          </Text>
        )}
      </View>
      {entry.organization && (
        <Text style={s.entryOrg}>
          {entry.organizationUrl ? (
            <Link src={entry.organizationUrl} style={s.entryOrgLink}>
              {entry.organization}
            </Link>
          ) : (
            entry.organization
          )}
          {entry.location ? ` — ${entry.location}` : ''}
        </Text>
      )}
      {companyDesc && <Text style={s.entryDesc}>{companyDesc}</Text>}
      {bullets.map((sentence, i) => (
        <View key={i} style={s.bulletItem}>
          <Text style={s.bullet}>•</Text>
          <Text style={s.bulletText}>{sentence}</Text>
        </View>
      ))}
      {entry.technology && entry.technology.length > 0 && (
        <Text style={s.techLine}>
          <Text style={s.techLabel}>Tech: </Text>
          {entry.technology.join(', ')}
        </Text>
      )}
    </View>
  )
}

function ResumePDFDocument({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ──────────────────────────────────── */}
        <View style={s.header} fixed>
          <Text style={s.name}>Adryan Eka Vandra</Text>
          <Text style={s.subtitle}>Software Engineer</Text>
          <View style={s.contactRow}>
            <Link src="mailto:adryanekavandra@gmail.com" style={s.contactLink}>
              adryanekavandra@gmail.com
            </Link>
            <Text style={s.contactSep}>|</Text>
            <Link src="https://linkedin.com/in/adryanev" style={s.contactLink}>
              linkedin.com/in/adryanev
            </Link>
            <Text style={s.contactSep}>|</Text>
            <Link src="https://github.com/adryanev" style={s.contactLink}>
              github.com/adryanev
            </Link>
            <Text style={s.contactSep}>|</Text>
            <Link src="https://adryanev.com" style={s.contactLink}>
              adryanev.com
            </Link>
          </View>
        </View>

        {/* ── Experience ──────────────────────────────── */}
        {data.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Experience</Text>
            <View style={s.divider} />
            {data.experience.map((entry) => (
              <ExperienceEntry key={entry.id} entry={entry} />
            ))}
          </View>
        )}

        {/* ── Education ───────────────────────────────── */}
        {data.education.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>Education</Text>
            <View style={s.divider} />
            {data.education.map((entry) => (
              <ExperienceEntry key={entry.id} entry={entry} />
            ))}
          </View>
        )}

        {/* ── Certifications ──────────────────────────── */}
        {data.certification.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>Certifications</Text>
            <View style={s.divider} />
            {data.certification.map((entry) => (
              <View key={entry.id} style={{ marginBottom: 4 }} wrap={false}>
                <View style={s.certRow}>
                  <View>
                    <Text style={s.certTitle}>{entry.title}</Text>
                    {entry.organization && (
                      <Text style={s.certOrg}>
                        {entry.organizationUrl ? (
                          <Link src={entry.organizationUrl} style={{ ...s.certOrg, color: c.accent, textDecoration: 'none' }}>
                            {entry.organization}
                          </Link>
                        ) : (
                          entry.organization
                        )}
                      </Text>
                    )}
                  </View>
                  {entry.startDate && (
                    <Text style={s.certDate}>{fmtDate(entry.startDate)}</Text>
                  )}
                </View>
                {entry.description && (
                  <Text style={s.certDesc}>{entry.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Skills ──────────────────────────────────── */}
        {data.skill.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>Skills</Text>
            <View style={s.divider} />
            {data.skill.map((entry) => (
              <View key={entry.id} style={s.skillRow}>
                <Text style={s.skillLabel}>{entry.title}</Text>
                <Text style={s.skillValue}>
                  {entry.technology && entry.technology.length > 0
                    ? entry.technology.join(', ')
                    : entry.description ?? ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}

// ── Public API ────────────────────────────────────────────
export async function generateResumePDF(data: ResumeData): Promise<void> {
  const blob = await pdf(<ResumePDFDocument data={data} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Adryan_Eka_Vandra_Resume.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
