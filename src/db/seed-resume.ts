import { sql } from 'drizzle-orm'
import { insertEach, openSeedDb } from './seed-db'
import { resumeEntries } from './schema/resume'
import { resumeTypes } from './schema/enums'

async function seedResume() {
  const { db, close } = await openSeedDb()

  console.log('Truncating resume_entries...')
  await db.batch([
    db.delete(resumeEntries),
    db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'resume_entries'`),
  ])

  console.log('Seeding resume entries...')

  // Descriptions split into points on sentence ends: the first sentence
  // describes the organization, each later sentence is one point
  const entries = [
    // ── Experience (sortOrder 0 = most recent) ──────────────
    {
      type: 'experience' as const,
      title: 'Software Engineer, Mobile',
      organization: 'PT Digital Sawit Pro (SawitPRO)',
      organizationUrl: 'https://www.sawitpro.com/',
      location: 'Indonesia',
      description:
        'Agricultural technology company serving the Indonesian palm oil industry. ' +
        'Build fresh fruit bunch supply workflows for field agents, including commodity pricing, mill locations, clustered maps, and cached master data. ' +
        'Build loyalty campaigns, streak milestones, reward claiming, and leaderboards. ' +
        'Built the runtime feature-gating platform all four apps use, and wrote the iOS playbook new engineers start from. ' +
        'Launched two iOS apps from scratch as one of two iOS engineers; the workspace now ships four. ' +
        'Owned cart-to-order flows for six months, during which monthly sales value grew 30x and store-visit-to-purchase conversion increased 6x while the active user base stayed flat. ' +
        "Integrated QR payments, e-wallets, vouchers, and account balance into checkout; these methods now carry most of the marketplace's transaction value. " +
        'Rolled out crash reporting and performance monitoring; the apps maintain 99.9% crash-free sessions. ' +
        'Defined the workflow the team uses to port Android features to iOS.',
      technology: ['SwiftUI', 'Swift Concurrency', 'Jetpack Compose', 'Fastlane', 'Firebase', 'OpenAPI'],
      startDate: '2025-06-01',
      endDate: null,
      sortOrder: 0,
    },
    {
      type: 'experience' as const,
      title: 'Platform Maintainer / DevOps Lead',
      organization: 'EngageMedia (Cinemata)',
      organizationUrl: 'https://www.engagemedia.org/',
      location: 'Remote',
      description:
        'Video platform of EngageMedia, a non-profit for digital rights across Asia-Pacific, with a distributed team across Indonesia, the Philippines, and Bangladesh. ' +
        'Maintain a multi-terabyte video platform serving millions of requests a month to viewers in the US, Southeast Asia, and Europe. ' +
        'Cut page load times by 87% using a CDN, query caching, and content-hashed static assets. ' +
        'Promoted from contributor to DevOps lead; direct three developers and the technical working group. ' +
        'Hardened password-protected video: replaced plaintext verification with tokens, hashed credentials at rest, and closed an exposure path in the admin interface. ' +
        'Added metrics and distributed tracing, and capped encoder CPU per process to stabilise the transcoding pipeline. ' +
        'Migrated the frontend from Webpack to Vite and React 19, moving legacy stylesheets into Tailwind.',
      technology: ['Django', 'React', 'Vite', 'Celery', 'Redis', 'FFmpeg', 'Nginx', 'OpenTelemetry'],
      startDate: '2025-05-01',
      endDate: null,
      sortOrder: 1,
    },
    {
      type: 'experience' as const,
      title: 'Technical Co-founder',
      organization: 'Lexicon',
      organizationUrl: 'https://lexicon.id/',
      location: 'Remote',
      description:
        'Legal-intelligence startup building beneficial-ownership, procurement, and legal-research products for Indonesia with a six-person team. ' +
        'Built a multi-jurisdiction ingestion platform and an Airflow entity-resolution pipeline for a 64M-row warehouse that resolves 8.9M actor events into 239k entities. ' +
        'Built the Go backend for eight product domains, including beneficial ownership, procurement analytics, sanctions screening, and relationship graphs. ' +
        'Shipped a self-hosted LLM gateway, retrieval-augmented search over Indonesian court decisions, multi-agent judicial analysis, and a metered API. ' +
        'Delivered anti-money-laundering screening over 161k sanctioned entities and 470k name variants, used by a national digital identity provider and government agencies. ' +
        'Operate production infrastructure across multiple hosts with PostgreSQL, Redis, NATS, Grafana, and OpenTelemetry. ' +
        'Built the web app, screening module, and Indonesian procurement mapping for Specus, a four-country anti-corruption platform funded by the US State Department. ' +
        'Delivered the Indonesia TB Policy Tracker, which tracks tuberculosis regulation from central to regional government. ' +
        'Secured seed funding, grants, an enterprise retainer, and government contracts, and was named a top startup in the inaugural Google for Startups AI Solutions Lab Indonesia in 2025.',
      technology: ['Go', 'Python', 'TypeScript', 'PostgreSQL', 'Airflow', 'Redis', 'NATS', 'LLM/RAG', 'Docker', 'OpenTelemetry'],
      startDate: '2023-01-01',
      endDate: null,
      sortOrder: 2,
    },
    {
      type: 'experience' as const,
      title: 'Mobile Engineer, Acting Supervisor',
      organization: 'Majoo Teknologi Indonesia',
      organizationUrl: 'https://majoo.id/',
      location: 'Indonesia',
      description:
        'Series A funded point-of-sale platform for Indonesian small and medium enterprises. ' +
        'Promoted from Senior Mobile Associate (Apr 2022 – Mar 2023) to Mobile Engineer, Acting Supervisor (Feb 2023 – Feb 2025). ' +
        'Technical lead for the mobile team on a point-of-sale app serving 35,000+ merchants across 600 Indonesian cities. ' +
        'Led a six-person task force that redesigned and replaced the legacy point-of-sale codebase. ' +
        "Wrote the team's technical standards and reviewed all new features. " +
        'Benchmarked critical app paths and used root-cause analysis to fix performance bottlenecks. ' +
        'Shipped hotfixes for high-priority production defects.',
      technology: ['Flutter', 'Android', 'iOS', 'RabbitMQ'],
      startDate: '2022-04-01',
      endDate: '2025-02-28',
      sortOrder: 3,
    },
    {
      type: 'experience' as const,
      title: 'Android Engineer',
      organization: 'Sprint Asia Technology',
      organizationUrl: 'https://sprintasia.co.id/',
      location: 'Indonesia',
      description:
        'Indonesian digital transformation consultancy serving clients across Southeast Asia. ' +
        'Rebuilt a travel booking app in Flutter so Android and iOS shared one codebase, and released its staycation feature. ' +
        'Contributed to the microservice architecture for the replacement API.',
      technology: ['Android', 'Flutter', 'Go'],
      startDate: '2021-08-01',
      endDate: '2022-04-30',
      sortOrder: 4,
    },
    {
      type: 'experience' as const,
      title: 'Software Engineer, Project-based',
      organization: 'TopApp ID and independent client work',
      organizationUrl: 'https://topapp.id/',
      location: 'Riau, Indonesia',
      description:
        'TopApp ID from Jan 2018 to Dec 2022, and independent client work from Aug 2017 to Nov 2021. ' +
        'Built a university accreditation system, an application marketplace, a government treasury Android app, and e-learning apps, and ran the hosting for all of them.',
      technology: ['PHP', 'Yii2', 'MySQL', 'JavaScript', 'Kotlin', 'Linux'],
      startDate: '2017-08-01',
      endDate: '2022-12-31',
      sortOrder: 5,
    },

    // ── Education ─────────────────────────────────────────────
    {
      type: 'education' as const,
      title: 'Bachelor of Engineering, Informatics Engineering',
      organization: 'State Islamic University of Sultan Syarif Kasim (UIN Suska) Riau',
      organizationUrl: 'https://www.uin-suska.ac.id/',
      location: 'Riau, Indonesia',
      description:
        'Cumulative GPA: 3.82 / 4.00. ' +
        'Elective courses: Machine Learning, Genetic Algorithm, Natural Language Processing, Digital Image Processing, Mobile Application Development.',
      technology: null,
      startDate: null,
      endDate: '2021-12-31',
      sortOrder: 0,
    },
    {
      type: 'education' as const,
      title: 'Apple Developer Academy',
      organization: 'Apple Developer Academy @ BINUS',
      organizationUrl: 'https://developeracademy.apps.binus.ac.id/',
      location: 'Jakarta, Indonesia',
      description:
        'Ten-month iOS program. ' +
        'Shipped five apps, including one published to the App Store.',
      technology: null,
      startDate: '2023-02-01',
      endDate: '2023-12-31',
      sortOrder: 1,
    },

    // ── Certifications ────────────────────────────────────────
    {
      type: 'certification' as const,
      title: 'Android Jetpack Pro',
      organization: 'Dicoding',
      organizationUrl: 'https://www.dicoding.com/certificates/MRZMG2QY3ZYQ',
      description:
        'Implemented the latest Android development best practices: MVVM Architecture, Dependency Injection, LiveData, Data Binding, Coroutine, Paging, Unit Test, and Integration Test.',
      technology: ['Android', 'Jetpack', 'Kotlin'],
      startDate: '2021-01-01',
      sortOrder: 0,
    },
    {
      type: 'certification' as const,
      title: 'SOLID Principle in Programming',
      organization: 'Dicoding',
      organizationUrl: 'https://www.dicoding.com/certificates/J1RXYK221ZVM',
      description:
        'Learned how to write clean code by implementing the SOLID Principle.',
      technology: null,
      startDate: '2020-01-01',
      sortOrder: 1,
    },
    {
      type: 'certification' as const,
      title: 'Programmer',
      organization: 'BNSP (Badan Nasional Sertifikasi Profesi)',
      organizationUrl: null,
      description:
        'Evaluated basic programming skills: Designing With UML, Database Design, Writing Code, Using Library, and Testing.',
      technology: null,
      startDate: '2019-01-01',
      sortOrder: 2,
    },

    // ── Skills ────────────────────────────────────────────────
    {
      type: 'skill' as const,
      title: 'Core languages',
      description: 'Go, Python, TypeScript, SQL, Swift, Kotlin, Dart',
      technology: ['Go', 'Python', 'TypeScript', 'SQL', 'Swift', 'Kotlin', 'Dart'],
      sortOrder: 0,
    },
    {
      type: 'skill' as const,
      title: 'Backend',
      description: 'Go, Chi, SQLC, Python, Django, Celery, OpenAPI',
      technology: ['Go', 'Chi', 'SQLC', 'Python', 'Django', 'Celery', 'OpenAPI'],
      sortOrder: 1,
    },
    {
      type: 'skill' as const,
      title: 'Data',
      description: 'PostgreSQL, PostGIS, Apache AGE, ParadeDB, Airflow, Redis, RabbitMQ, NATS',
      technology: ['PostgreSQL', 'PostGIS', 'Apache AGE', 'ParadeDB', 'Airflow', 'Redis', 'RabbitMQ', 'NATS'],
      sortOrder: 2,
    },
    {
      type: 'skill' as const,
      title: 'Platform',
      description: 'Docker, Linux, Nginx, CI/CD, OpenTelemetry, Grafana, VictoriaMetrics',
      technology: ['Docker', 'Linux', 'Nginx', 'CI/CD', 'OpenTelemetry', 'Grafana', 'VictoriaMetrics'],
      sortOrder: 3,
    },
    {
      type: 'skill' as const,
      title: 'AI systems',
      description: 'Retrieval-augmented generation, LLM agents, Model Context Protocol, Whisper',
      technology: ['Retrieval-augmented generation', 'LLM agents', 'Model Context Protocol', 'Whisper'],
      sortOrder: 4,
    },
    {
      type: 'skill' as const,
      title: 'Mobile',
      description: 'Swift, SwiftUI, UIKit, Swift Concurrency, Kotlin, Jetpack Compose, Dart, Flutter',
      technology: ['Swift', 'SwiftUI', 'UIKit', 'Swift Concurrency', 'Kotlin', 'Jetpack Compose', 'Dart', 'Flutter'],
      sortOrder: 5,
    },
    {
      type: 'skill' as const,
      title: 'Mobile tooling',
      description: 'Xcode, Fastlane, Firebase Crashlytics, Firebase Performance, OpenAPI, App Store Connect',
      technology: ['Xcode', 'Fastlane', 'Firebase Crashlytics', 'Firebase Performance', 'OpenAPI', 'App Store Connect'],
      sortOrder: 6,
    },
    {
      type: 'skill' as const,
      title: 'Architecture and testing',
      description: 'MVVM, MVI, Clean Architecture, unit testing, integration testing',
      technology: ['MVVM', 'MVI', 'Clean Architecture', 'Unit testing', 'Integration testing'],
      sortOrder: 7,
    },
    {
      type: 'skill' as const,
      title: 'Spoken',
      description: 'English (professional working proficiency), Indonesian (native)',
      technology: ['English (professional working proficiency)', 'Indonesian (native)'],
      sortOrder: 8,
    },
  ]

  await insertEach(db, resumeEntries, entries)

  console.log(`Resume entries seeded: ${entries.length} entries`)
  for (const type of resumeTypes) {
    const count = entries.filter((entry) => entry.type === type).length
    console.log(`  - ${type}: ${count}`)
  }

  await close()
  console.log('Resume seeding complete!')
}

seedResume().catch((err) => {
  console.error('Resume seed failed:', err)
  process.exit(1)
})
