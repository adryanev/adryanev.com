import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { sql } from 'drizzle-orm'
import { resumeEntries } from './schema/resume'

async function seedResume() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const db = drizzle(pool)

  console.log('Truncating resume_entries...')
  await db.execute(sql`TRUNCATE TABLE resume_entries RESTART IDENTITY`)

  console.log('Seeding resume entries...')

  const entries = [
    // ── Experience (sortOrder 0 = most recent) ──────────────
    {
      type: 'experience' as const,
      title: 'Software Engineer (Mobile), Full-Time',
      organization: 'PT Digital Sawit Pro',
      organizationUrl: 'https://www.sawitpro.com/',
      location: 'Indonesia',
      description:
        'SawitPRO is an agricultural technology company dedicated to nurturing the Indonesian palm oil industry. ' +
        'Developed and maintained Toko Sawit (E-Commerce) feature for iOS Agen SawitPRO App. ' +
        'Piloted a Technical Improvement Project of Application Performance Monitoring for Mobile Application. ' +
        'Presented an RFC about Activity-Based Cross-Selling Feature for Cross-Product Demo.',
      technology: ['Android', 'Jetpack Compose', 'iOS', 'SwiftUI', 'OpenAPI'],
      startDate: '2025-06-01',
      endDate: null,
      sortOrder: 0,
    },
    {
      type: 'experience' as const,
      title: 'Software Engineer, Paid Contributor',
      organization: 'EngageMedia Collective, Inc',
      organizationUrl: 'https://www.engagemedia.org/',
      location: 'Remote',
      description:
        'EngageMedia is a nonprofit promoting digital rights, open and secure technology, and social issue documentaries. ' +
        'Patched security vulnerability by upgrading/changing dependency. ' +
        'Enhanced Video Player by leveraging heuristic device detection and recommending specific video resolution. ' +
        'Improved site performance by 87% by introducing caching and CDN. ' +
        'Implemented Media Versioning for allowing media update without cache busting. ' +
        'Secured media files from unauthorized access using Nginx X-Accel-Redirect.',
      technology: ['Django', 'React', 'Celery', 'FFMPEG', 'Nginx', 'Redis'],
      startDate: '2025-04-01',
      endDate: null,
      sortOrder: 1,
    },
    {
      type: 'experience' as const,
      title: 'Mobile Engineer, Full-Time',
      organization: 'Majoo Teknologi Indonesia',
      organizationUrl: 'https://majoo.id/',
      location: 'Indonesia',
      description:
        'Series A funded Indonesian technology company providing integrated POS solutions for SMEs. ' +
        'Position equivalent to supervisor in technical expertise. ' +
        'Designed, analyzed, and reviewed new features and improvements. ' +
        'Provided technical documents and standardization to improve code health. ' +
        'Benchmarked mobile app performance and improved it using Root Cause Analysis and best practices. ' +
        'Previously as Mobile Sr. Associate: maintained POS application, led a five-person team to redesign legacy code, ' +
        'handled bugfix and hotfix for high to critical bugs.',
      technology: ['Flutter', 'RabbitMQ', 'Android', 'iOS'],
      startDate: '2022-04-01',
      endDate: '2025-02-28',
      sortOrder: 2,
    },
    {
      type: 'experience' as const,
      title: 'iOS Developer, Learner',
      organization: 'Apple Developer Academy',
      organizationUrl: 'https://developeracademy.apps.binus.ac.id/',
      location: 'Jakarta, Indonesia',
      description:
        'Developed 5 iOS applications in 10 months, 4 released in TestFlight and 1 in App Store. ' +
        'Lexicon — Project Manager/Developer (3 months): Delivered iOS app to App Store within 1 month, built backend for Regulation and Definition Search Engine, showcased at Tech in Asia StartUp Factory 2023. ' +
        'Memoria — Project Manager/Developer (1 month): Implemented person detection, cropping, and paste-to-image features. ' +
        'DodgeVirus — Developer (2 weeks): Designed game flow and developed the game within 1 week. ' +
        'Cheffin — Project Manager/Developer (1 month): Managed project to meet deadline, developed Recipe Feature. ' +
        'Fooney — Project Manager/Developer (10 days): Trained ML model to recognize user emotion, developed iOS app in 3 days. ' +
        'Swee — Developer (2 weeks): Developed backend, designed Technology Architecture and Data Flow. ' +
        'iBLE — Developer (1 month): Researched design implementation, contributed to ideation and product development.',
      technology: ['SwiftUI', 'UIKit', 'CoreML', 'ARKit', 'SpriteKit', 'CloudKit', 'CoreData', 'Combine'],
      startDate: '2023-02-01',
      endDate: '2023-12-31',
      sortOrder: 3,
    },
    {
      type: 'experience' as const,
      title: 'Android Engineer, Full-Time',
      organization: 'Sprint Asia Technology',
      organizationUrl: 'https://sprintasia.co.id/',
      location: 'Indonesia',
      description:
        'Indonesian technology company specializing in digital solutions and technology consulting. ' +
        'Released Staycation feature in Gaidz Android App. ' +
        'Rebuilt Gaidz Mobile App with Flutter for multi-platform support. ' +
        'Contributed to the design of new Gaidz API using Microservice Architecture. ' +
        'Helped rewrite the nearby shop feature of Bayarind Apps into Flutter.',
      technology: ['Android', 'Flutter', 'Go'],
      startDate: '2021-08-01',
      endDate: '2022-04-30',
      sortOrder: 4,
    },
    {
      type: 'experience' as const,
      title: 'Software Engineer, Project-based',
      organization: 'TopApp ID',
      organizationUrl: 'https://topapp.id/',
      location: 'Riau, Indonesia',
      description:
        'Product incubator program affiliated with Informatics Engineering Department at UIN Suska Riau. ' +
        'Designed and programmed accreditation Information System for 9 Criteria of BAN-PT. ' +
        'Developed Software and Application Marketplace. ' +
        'Built Arabic E-Learning Android Application. ' +
        'Maintained and operated TopApp ID\'s Hosting. ' +
        'Planned, designed, and managed Wisata Pulau Setan Application Development.',
      technology: ['PHP', 'Yii2', 'MySQL', 'JavaScript', 'CPanel', 'Linux'],
      startDate: '2018-06-01',
      endDate: '2022-12-31',
      sortOrder: 5,
    },
    {
      type: 'experience' as const,
      title: 'Mentor, Part-Time',
      organization: 'Flashsoft Indonesia',
      organizationUrl: 'https://www.flashsoftindonesia.com/',
      location: 'Indonesia',
      description:
        'Tech mentoring startup helping university students acquire programming skills through intensive crash courses. ' +
        'Guided 4 students to solve their research problems.',
      technology: ['PHP', 'Yii2', 'MySQL', 'JavaScript', 'Python'],
      startDate: '2019-02-01',
      endDate: '2019-08-31',
      sortOrder: 6,
    },
    {
      type: 'experience' as const,
      title: 'Software Engineer, Freelance',
      organization: 'Freelance',
      organizationUrl: null,
      location: 'Indonesia',
      description:
        'Programmed Village Assessment Information System. ' +
        'Developed English E-Learning Android Application. ' +
        'Released KPPN Pekanbaru Android App.',
      technology: ['PHP', 'Yii2', 'MySQL', 'JavaScript', 'Android', 'Kotlin'],
      startDate: null,
      endDate: null,
      sortOrder: 7,
    },

    // ── Education ─────────────────────────────────────────────
    {
      type: 'education' as const,
      title: 'Bachelor of Engineering',
      organization: 'State Islamic University of SUSKA Riau',
      organizationUrl: 'https://www.uin-suska.ac.id/',
      location: 'Riau, Indonesia',
      description:
        'Cumulative GPA: 3.82 / 4.00. ' +
        'Electoral courses: Machine Learning, Genetic Algorithm, Natural Language Processing, Digital Image Processing, Mobile Application Development.',
      technology: null,
      startDate: null,
      endDate: null,
      sortOrder: 0,
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
      title: 'Languages',
      description: 'Go, Dart, SQL, Kotlin, Bash, Java, JavaScript, TypeScript, Swift, Python',
      technology: ['Go', 'Dart', 'SQL', 'Kotlin', 'Bash', 'Java', 'JavaScript', 'TypeScript', 'Swift', 'Python'],
      sortOrder: 0,
    },
    {
      type: 'skill' as const,
      title: 'Frameworks',
      description: 'Yii2, Laravel, Flutter, Android, iOS, React, Django',
      technology: ['Yii2', 'Laravel', 'Flutter', 'Android', 'iOS', 'React', 'Django'],
      sortOrder: 1,
    },
    {
      type: 'skill' as const,
      title: 'Tools',
      description: 'Android Studio, Xcode, Linux, Git, Docker, RabbitMQ',
      technology: ['Android Studio', 'Xcode', 'Linux', 'Git', 'Docker', 'RabbitMQ'],
      sortOrder: 2,
    },
    {
      type: 'skill' as const,
      title: 'Patterns',
      description: 'Clean Architecture, MVVM, MVI, MVC, Design Patterns, SOLID Principle',
      technology: ['Clean Architecture', 'MVVM', 'MVI', 'MVC', 'Design Patterns', 'SOLID'],
      sortOrder: 3,
    },
  ]

  await db.insert(resumeEntries).values(entries)

  console.log(`Resume entries seeded: ${entries.length} entries`)
  console.log('  - Experience: 8')
  console.log('  - Education: 1')
  console.log('  - Certifications: 3')
  console.log('  - Skills: 4')

  await pool.end()
  console.log('Resume seeding complete!')
}

seedResume().catch((err) => {
  console.error('Resume seed failed:', err)
  process.exit(1)
})
