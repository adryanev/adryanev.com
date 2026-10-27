import { sql } from 'drizzle-orm'
import { insertEach, openSeedDb } from './seed-db'
import { portfolioCategories, portfolioProjects, projectImages } from './schema/portfolio'

async function seedPortfolio() {
  const { db, close } = await openSeedDb()

  console.log('Truncating portfolio tables...')
  await db.batch([
    db.delete(projectImages),
    db.delete(portfolioProjects),
    db.delete(portfolioCategories),
    db.run(sql`DELETE FROM sqlite_sequence WHERE name IN ('project_images', 'portfolio_projects', 'portfolio_categories')`),
  ])

  console.log('Seeding portfolio categories...')
  const categories = [
    { name: 'Work', slug: 'work', description: 'Professional work projects', sortOrder: 0 },
    { name: 'Lexicon', slug: 'lexicon', description: 'Projects at Lexicon', sortOrder: 1 },
    { name: 'TopApp.id', slug: 'topapp-id', description: 'Projects at TopApp.id', sortOrder: 2 },
    { name: 'Apple Developer Academy', slug: 'apple-developer-academy', description: 'Projects from Apple Developer Academy @BINUS', sortOrder: 3 },
    { name: 'Freelance', slug: 'freelance', description: 'Freelance and contract work', sortOrder: 4 },
    { name: 'College', slug: 'college', description: 'University projects at UIN Suska Riau', sortOrder: 5 },
    { name: 'Open Source', slug: 'open-source', description: 'Open source projects', sortOrder: 6 },
  ]

  const insertedCategories = await db
    .insert(portfolioCategories)
    .values(categories)
    .returning()

  const catMap = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]))

  console.log('Seeding portfolio projects...')

  const projects = [
    // ── Work ──────────────────────────────────────────────
    {
      categoryId: catMap['work'],
      title: 'AgenPRO',
      slug: 'agenpro',
      description:
        'AgenPRO is the SawitPRO app for palm oil agents who run their fresh fruit bunch business digitally, including buying supplies through the Toko Sawit marketplace. ' +
        'I build fresh fruit bunch supply workflows for field agents, covering commodity pricing, mill locations, clustered maps, and cached master data. ' +
        'While I owned the cart-to-order flows, monthly sales value grew 30x and store-visit-to-purchase conversion increased 6x with a flat active user base. ' +
        'I integrated QR payments, e-wallets, vouchers, and account balance into checkout; these methods now carry most of the marketplace transaction value.',
      year: 2025,
      role: 'Software Engineer, Mobile',
      workplace: 'PT Digital Sawit Pro',
      technology: ['SwiftUI', 'Swift Concurrency', 'Jetpack Compose', 'Firebase', 'OpenAPI'],
      externalUrl: 'https://apps.apple.com/id/app/agenpro/id6504548403',
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catMap['work'],
      title: 'TimPRO',
      slug: 'timpro',
      description:
        'TimPRO is the SawitPRO app for delivery-order agent owners and administrators to track daily fresh fruit bunch deliveries to mills and claim loyalty rewards. ' +
        'I launched the iOS app from scratch and built its loyalty campaigns, streak milestones, reward claiming, and leaderboards.',
      year: 2026,
      role: 'Software Engineer, Mobile',
      workplace: 'PT Digital Sawit Pro',
      technology: ['SwiftUI', 'Swift Concurrency', 'Fastlane', 'Firebase', 'OpenAPI'],
      externalUrl: 'https://apps.apple.com/id/app/timpro/id6759028450',
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catMap['work'],
      title: 'PetaniPRO',
      slug: 'petanipro',
      description:
        'PetaniPRO is the SawitPRO assistant for palm oil farmers to record harvest and plantation work, analyse production, yield, and finances, and buy fertiliser and seedlings through Toko Sawit. ' +
        'I launched the iOS app from scratch on the shared runtime feature-gating platform and crash reporting that keep the SawitPRO apps at 99.9% crash-free sessions.',
      year: 2026,
      role: 'Software Engineer, Mobile',
      workplace: 'PT Digital Sawit Pro',
      technology: ['SwiftUI', 'Swift Concurrency', 'Fastlane', 'Firebase', 'OpenAPI'],
      externalUrl: 'https://apps.apple.com/id/app/petanipro/id6786538018',
      status: 'published' as const,
      sortOrder: 2,
    },
    {
      categoryId: catMap['work'],
      title: 'majoo',
      slug: 'majoo',
      description:
        'Majoo is a comprehensive business platform that provides a wide range of solutions for various business needs, including F&B, franchises, retail, and more. ' +
        'As a key member of the development team, I played a crucial role in maintaining the stability and performance of the Majoo application. ' +
        'My contributions encompassed addressing critical bugs, leading architectural improvements through code refactoring and implementing Clean Architecture, and driving feature development through design, analysis, and review. ' +
        'Furthermore, I focused on optimizing application performance by conducting thorough benchmarking and root cause analysis, identifying and resolving performance bottlenecks. ' +
        'I also actively contributed to improving code quality by establishing technical documentation and coding standards, ensuring maintainability and long-term sustainability of the Majoo platform. ' +
        'As technical lead for the mobile team, I led a six-person task force that redesigned and replaced the legacy point-of-sale codebase, serving 35,000+ merchants across 600 Indonesian cities.',
      year: 2025,
      role: 'Mobile Engineer, Acting Supervisor',
      workplace: 'PT Majoo Teknologi Indonesia',
      technology: ['Android', 'SQLite', 'REST API', 'Flutter'],
      externalUrl: 'https://apps.apple.com/id/app/aplikasi-kasir-wirausaha-majoo/id1642259472',
      status: 'published' as const,
      sortOrder: 4,
    },
    {
      categoryId: catMap['work'],
      title: 'Gaidz',
      slug: 'gaidz',
      description:
        'GAIDZ is a travel companion mobile application that assists travelers in planning, identifying, and organizing tourist attractions across various locations. ' +
        'Users can select points of interest, including places, streets, restaurants, cafes, local shops, and more, allowing GAIDZ to generate personalized itineraries. ' +
        'As a developer, I contributed significantly to the project by developing the Itinerary feature, rewriting the application using Flutter for multi-platform support, ' +
        'and redesigning the backend architecture with a microservices approach. ' +
        'My technical expertise includes Android development, Retrofit, MVP and MVVM patterns, Clean Architecture, SOLID principles, SQLite, Shared Preferences, and Flutter.',
      year: 2022,
      role: 'Android Engineer',
      workplace: 'PT Sprint Asia Technology',
      technology: ['Android', 'SQLite', 'REST API', 'Flutter'],
      externalUrl: 'https://play.google.com/store/apps/details?id=com.gaidz.bayarind',
      status: 'published' as const,
      sortOrder: 5,
    },
    {
      categoryId: catMap['work'],
      title: 'Bayarind',
      slug: 'bayarind',
      description:
        'Bayarind is a digital wallet application that empowers users to conveniently pay bills, order food, and securely store their identity cards and installment card information. ' +
        'As a developer, I played a crucial role in developing the "Near Me" Bayarind Shop feature using Flutter. ' +
        'My technical expertise includes Flutter development, Clean Architecture, SOLID principles, GetX, SQLite, and Shared Preferences.',
      year: 2022,
      role: 'Android Engineer',
      workplace: 'PT Sprint Asia Technology',
      technology: ['Android', 'SQLite', 'REST API', 'Flutter'],
      status: 'published' as const,
      sortOrder: 6,
    },
    {
      categoryId: catMap['work'],
      title: 'Cinemata',
      slug: 'cinemata',
      description:
        'Cinemata is the video platform of EngageMedia, a non-profit for digital rights across Asia-Pacific, serving millions of requests a month to viewers in the US, Southeast Asia, and Europe from a multi-terabyte video library. ' +
        'I was promoted from contributor to DevOps lead and direct three developers and the technical working group. ' +
        'I cut page load times by 87% using a CDN, query caching, and content-hashed static assets, and hardened password-protected video by replacing plaintext verification with tokens, hashing credentials at rest, and closing an exposure path in the admin interface. ' +
        'I also added metrics and distributed tracing, capped encoder CPU per process to stabilise the transcoding pipeline, and migrated the frontend from Webpack to Vite and React 19.',
      year: 2025,
      role: 'Platform Maintainer / DevOps Lead',
      workplace: 'EngageMedia',
      technology: ['Django', 'React', 'Vite', 'Celery', 'Redis', 'FFmpeg', 'Nginx', 'OpenTelemetry'],
      externalUrl: 'https://cinemata.org/blog-cinematacms-experience',
      githubUrl: 'https://github.com/EngageMedia-video/cinematacms',
      status: 'published' as const,
      sortOrder: 3,
    },

    // ── Lexicon ──────────────────────────────────────────
    {
      categoryId: catMap['lexicon'],
      title: 'Lexicon Beneficial Ownership',
      slug: 'lexicon-beneficial-ownership',
      description:
        'A web platform aggregating fraudulent entity data from multiple countries, utilizing web crawlers and LLM technology to compile and summarize information from official sources like court judgments, blacklists, and international sanctions across Indonesia, Singapore, Malaysia, and global databases. ' +
        'I built the multi-jurisdiction ingestion platform and the Airflow entity-resolution pipeline behind it, which resolves 8.9M actor events into 239k entities in a 64M-row warehouse. ' +
        'Its anti-money-laundering screening covers 161k sanctioned entities and 470k name variants, and is used by a national digital identity provider and government agencies.',
      year: 2024,
      role: 'Technical Co-founder',
      workplace: 'Lexicon',
      technology: ['Go', 'PostgreSQL', 'NextJS', 'NATS', 'Jetstream', 'LLM'],
      githubUrl: 'https://github.com/Lexicon-Open-Source/lexicon-beneficial-ownership',
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catMap['lexicon'],
      title: 'Indonesia TB Policy Tracker',
      slug: 'stop-tb-policy-tracker',
      description:
        'A comprehensive digital platform extracting and mapping Tuberculosis regulations across Indonesian governmental levels, from central to regional government, analyzing metadata, hierarchical connections, and inter-regulatory relationships.',
      year: 2024,
      role: 'Technical Co-founder',
      workplace: 'Lexicon',
      technology: ['Go', 'MariaDB', 'MongoDB', 'Javascript', 'Angular'],
      externalUrl: 'https://stoptbindonesia.org/en/we-do/tb-policy-advocacy',
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catMap['lexicon'],
      title: 'Specus',
      slug: 'specus',
      description:
        'Specus is a compliance intelligence platform for anti-corruption and safer procurement, covering four countries and funded by the US State Department. ' +
        'I built the web app, the sanctions and anti-money-laundering screening module, and the Indonesian procurement mapping.',
      year: 2025,
      role: 'Technical Co-founder',
      workplace: 'Lexicon',
      technology: ['Go', 'PostgreSQL', 'TypeScript'],
      externalUrl: 'https://specus.biz',
      status: 'published' as const,
      sortOrder: 2,
    },
    {
      categoryId: catMap['lexicon'],
      title: 'Legal Council',
      slug: 'legal-council',
      description:
        'Legal Council is a multi-agent AI council of judges that deliberates Indonesian criminal cases, searches jurisprudence, and drafts a legal opinion. ' +
        'A Next.js frontend talks to a Go API that adds Turnstile, rate limiting, and bot detection in front of a Python LLM service, which runs retrieval-augmented search over court decisions stored in PostgreSQL with pgvector.',
      year: 2026,
      role: 'Technical Co-founder',
      workplace: 'Lexicon',
      technology: ['Go', 'Python', 'Next.js', 'PostgreSQL', 'pgvector', 'Redis', 'LLM/RAG'],
      externalUrl: 'https://counsel.lexicon.id',
      githubUrl: 'https://github.com/Lexicon-Open-Source/legal-council',
      status: 'published' as const,
      sortOrder: 3,
    },
    {
      categoryId: catMap['lexicon'],
      title: 'Indonesia Supreme Court AI Extraction',
      slug: 'indonesia-supreme-court-ai-extraction',
      description:
        'A backend service that extracts structured data from Indonesian Supreme Court decision documents with an LLM. ' +
        'It extracts PDF text with an OCR fallback, processes large documents in chunks, pulls out 50+ structured fields, and writes bilingual summaries in Indonesian and English, with work queued through NATS.',
      year: 2024,
      role: 'Technical Co-founder',
      workplace: 'Lexicon',
      technology: ['Python', 'FastAPI', 'NATS', 'LLM', 'OCR'],
      githubUrl: 'https://github.com/Lexicon-Open-Source/indonesia-supreme-court-ai-summarization',
      status: 'published' as const,
      sortOrder: 4,
    },

    // ── TopApp.id ────────────────────────────────────────
    {
      categoryId: catMap['topapp-id'],
      title: 'Wisata Pulau Setan',
      slug: 'wisata-pulau-setan',
      description:
        'The Wisata Pulau Setan Mobile app is a comprehensive platform designed to enhance the tourism experience of Pulau Setan, West Sumatera. ' +
        'This innovative app offers a range of features for both travelers and administrators, including destination browsing, package management, event listings, souvenir sales, order tracking, and a web-only admin console. ' +
        'The app aims to attract more visitors, improve their experience, boost the local economy, and promote sustainable tourism practices by providing a user-friendly and informative platform for travelers and a powerful management system for administrators.',
      year: 2021,
      role: 'Fullstack Developer',
      workplace: 'TopApp.id',
      technology: ['PHP', 'Laravel', 'MySQL', 'REST API', 'Javascript', 'Flutter'],
      githubUrl: 'https://github.com/adryanev/wisata-bumnag',
      externalUrl: 'https://sepetan.bpm.unand.ac.id/',
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catMap['topapp-id'],
      title: 'Mutu Dashboard',
      slug: 'mutu-dashboard',
      description:
        'An extension of Quality Assurance Information System based on 9 Criteria Accreditation of BAN-PT for Catholic Community Guidance to see the progress of their higher education institute in filling the accreditation criteria. Each university had their own system that integrated Catholic Community Guidance of the Ministry of Religion.',
      year: 2022,
      role: 'Fullstack Developer',
      workplace: 'TopApp.id',
      technology: ['PHP', 'Yii2', 'MySQL', 'Javascript', 'REST API'],
      githubUrl: 'https://github.com/adryanev/mutu-bimas',
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catMap['topapp-id'],
      title: 'SIMBA',
      slug: 'simba',
      description:
        'SIMBA (Sistem Informasi Mutu Berbasis Akreditasi) is a web platform to assess accreditation of study program according to 7 standards of BAN-PT for IAIN Padang Sidempuan.',
      year: 2019,
      role: 'Fullstack Developer',
      workplace: 'TopApp.id',
      technology: ['PHP', 'Yii2', 'MySQL', 'Javascript'],
      githubUrl: 'https://github.com/adryanev/mutu',
      status: 'published' as const,
      sortOrder: 2,
    },
    {
      categoryId: catMap['topapp-id'],
      title: 'TopApp.id Website',
      slug: 'topapp-id-website',
      description:
        'TopApp.id Website is the frontend of topapp.id, contains of landing page, e-commerce for buying products and training, and news. The website also uses custom CMS for the admin dashboard.',
      year: 2020,
      role: 'Fullstack Developer',
      workplace: 'TopApp.id',
      technology: ['PHP', 'Yii2', 'MySQL', 'Javascript'],
      githubUrl: 'https://github.com/adryanev/topapp.id/',
      externalUrl: 'https://topapp.id',
      status: 'published' as const,
      sortOrder: 3,
    },

    // ── Apple Developer Academy ──────────────────────────
    {
      categoryId: catMap['apple-developer-academy'],
      title: 'Lexicon',
      slug: 'lexicon-ios',
      description:
        'Lexicon: A cutting-edge iOS regulatory search engine for Indonesian legal professionals, enabling 50% faster legal research. ' +
        'Developed a comprehensive app with a Golang-powered backend, showcased at Tech in Asia Conference StartUp Factory and successfully launched on the App Store within one month.',
      year: 2023,
      role: 'Project Manager / Developer',
      workplace: 'Apple Developer Academy',
      technology: ['CloudKit', 'CoreData', 'Go', 'MariaDB', 'MongoDB', 'Javascript'],
      externalUrl: 'https://apple.co/47viIS9',
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catMap['apple-developer-academy'],
      title: 'Cheffin',
      slug: 'cheffin',
      description:
        'Cheffin is an app to improve the User Experience while they\'re cooking by providing the simple recipe and step-by-step mode that can be used with voice recognition. Why tap, when you can simply command? Cooking made easy, with Cheffin!',
      year: 2023,
      role: 'Project Manager / Developer',
      workplace: 'Apple Developer Academy',
      technology: ['AVFoundation', 'Xcode', 'Speech Framework', 'Combine'],
      externalUrl: 'https://apple.co/4t5untl',
      githubUrl: 'https://github.com/adryanev/Cheffin',
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catMap['apple-developer-academy'],
      title: 'Dodge Virus',
      slug: 'dodge-virus',
      description:
        'Dodge Virus is a 1-week development, 2D iOS game where players use gyroscope-based head navigation to dodge falling viruses, maximizing their score through intuitive controls and immersive haptic feedback on collisions.',
      year: 2023,
      role: 'Developer',
      workplace: 'Apple Developer Academy',
      technology: ['SpriteKit', 'AVFoundation', 'CoreHaptic', 'CoreMotion'],
      externalUrl: 'https://apple.co/3aaLwmG',
      githubUrl: 'https://github.com/adryanev/DodgeVirus',
      status: 'published' as const,
      sortOrder: 2,
    },
    {
      categoryId: catMap['apple-developer-academy'],
      title: 'Memoria',
      slug: 'memoria',
      description:
        'Memoria is an innovative trip planning scrapbook app that enables users to integrate photos into destination images, featuring an integrated photo editor with Apple Pencil support for writing, sticker placement, image filtering, and shape addition. ' +
        'In the Memoria project, I implemented advanced photo manipulation features including person detection, intelligent cropping, and image integration, while also practicing Clean Architecture principles with team members.',
      year: 2023,
      role: 'Project Manager / Developer',
      workplace: 'Apple Developer Academy',
      technology: ['CoreML', 'PhotoKit', 'PencilKit', 'MapKit', 'Combine'],
      externalUrl: 'https://apple.co/49735et',
      githubUrl: 'https://github.com/adryanev/Memoria',
      status: 'published' as const,
      sortOrder: 3,
    },
    {
      categoryId: catMap['apple-developer-academy'],
      title: 'Fooney',
      slug: 'fooney',
      description:
        'Fooney is an iOS augmented reality software that displays relevant quotes based on the user\'s expressions using facial emotion detection. ' +
        'The software analyzes facial expressions in real-time and presents relevant quotes in augmented space. ' +
        'It was developed with CoreML for emotion recognition, ARKit for implementing augmented reality, and AVFoundation for camera management. ' +
        'In this project I trained the Machine Learning Model to recognize user emotion, and also developed the iOS App within 3 days.',
      year: 2023,
      role: 'Project Manager / Developer',
      workplace: 'Apple Developer Academy',
      technology: ['CoreML', 'ARKit', 'AVFoundation', 'SwiftUI'],
      externalUrl: 'https://apple.co/3TfN_ZS',
      githubUrl: 'https://github.com/adryanev/Fooney',
      status: 'published' as const,
      sortOrder: 4,
    },
    {
      categoryId: catMap['apple-developer-academy'],
      title: 'Swee',
      slug: 'swee',
      description:
        'BLE-Based Payment and Ticketing System for MRT Jakarta. Using CoreBluetooth to reduce the ticketing queue by detecting the nearest user and payment status with Beacon.',
      year: 2023,
      role: 'Developer',
      workplace: 'Apple Developer Academy',
      technology: ['CoreLocation', 'CoreBluetooth', 'AVFoundation', 'AppIntent'],
      externalUrl: 'https://bit.ly/SweePrototype',
      status: 'published' as const,
      sortOrder: 5,
    },
    {
      categoryId: catMap['apple-developer-academy'],
      title: 'iBLE',
      slug: 'ible',
      description:
        'A gamification learning app that provides practice learning courses about daily recognition activities for children with autism. ' +
        'Activities include constructing sentences, reading, and understanding the content with several answering techniques such as drag & drop, mix-matching, and clickable picture.',
      year: 2023,
      role: 'Developer',
      workplace: 'Apple Developer Academy',
      technology: ['Product Development', 'User Testing', 'Prototyping'],
      externalUrl: 'https://bit.ly/iBLE-Prototype',
      status: 'published' as const,
      sortOrder: 6,
    },

    // ── Freelance ────────────────────────────────────────
    {
      categoryId: catMap['freelance'],
      title: 'DevMall',
      slug: 'devmall',
      description:
        'DevMall is a dynamic marketplace application designed to connect developers with clients seamlessly. ' +
        'This innovative platform offers a comprehensive suite of features, including a robust integrated payment gateway to facilitate secure and efficient transactions. ' +
        'The application also streamlines the development process through an intuitive application request system, allowing clients to easily post their project needs and developers to conveniently apply for projects that align with their expertise. ' +
        'Furthermore, DevMall incorporates an integrated achievement system to ensure timely and hassle-free payouts to developers, fostering a transparent and rewarding experience for all stakeholders within the development ecosystem.',
      year: 2021,
      role: 'Developer',
      workplace: 'Freelance',
      technology: ['PHP', 'Yii2', 'MySQL', 'Payment Gateway'],
      githubUrl: 'https://github.com/adryanev/devmall',
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catMap['freelance'],
      title: 'TopAplikasi',
      slug: 'topaplikasi',
      description:
        'TopAplikasi is an e-commerce and content management system (CMS) platform that provides businesses with full source code ownership and a robust admin dashboard for managing all aspects of their online store. ' +
        'Key features are integrated payment gateways, and seamless purchasing. It empowers businesses to streamline operations, enhance customer experience, and achieve their e-commerce goals with a scalable and customizable solution. ' +
        'TopAplikasi is ideal for small and medium-sized enterprises, startups, and entrepreneurs seeking to establish and grow their online presence.',
      year: 2018,
      role: 'Developer',
      workplace: 'Freelance',
      technology: ['PHP', 'Yii2', 'MySQL', 'Payment Gateway'],
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catMap['freelance'],
      title: 'SIPEDES',
      slug: 'sipedes',
      description:
        'SIPEDES (Sistem Informasi Penilaian Desa dan Kelurahan) is a Village Assessment Information System that helps Riau Province Community and Village Empowerment Service to assess whether a village is developed, fast developed, or underdeveloped.',
      year: 2018,
      role: 'Developer',
      workplace: 'Freelance',
      technology: ['PHP', 'Yii2', 'MySQL'],
      githubUrl: 'https://github.com/adryanev/sipedes/',
      status: 'published' as const,
      sortOrder: 2,
    },
    {
      categoryId: catMap['freelance'],
      title: 'SIKAPUS KPPN',
      slug: 'sikapus-kppn',
      description:
        'SIKAPUS KPPN Pekanbaru is a mobile application designed for the State Treasury Office of Pekanbaru. It provides users with access to the latest news articles and delivers timely notifications to both users and stakeholders within the office.',
      year: 2018,
      role: 'Developer',
      workplace: 'Freelance',
      technology: ['Android', 'REST API', 'Firebase'],
      githubUrl: 'https://github.com/adryanev/KPPN',
      status: 'published' as const,
      sortOrder: 3,
    },
    {
      categoryId: catMap['freelance'],
      title: 'EL-Learning',
      slug: 'el-learning',
      description:
        'EL-Learning is an English learning application for middle school students. The application provides an interactive module for the English textbook.',
      year: 2018,
      role: 'Developer',
      workplace: 'Freelance',
      technology: ['Android', 'SQLite', 'PDF'],
      githubUrl: 'https://github.com/adryanev/ElLearning',
      status: 'published' as const,
      sortOrder: 4,
    },

    // ── College ──────────────────────────────────────────
    {
      categoryId: catMap['college'],
      title: 'SIMUTU',
      slug: 'simutu',
      description:
        'SIMUTU is a Quality Assurance Information System based on 9 Criteria Accreditation of BAN-PT. ' +
        'The application helps universities to manage their accreditation documents, requirement, content, also monitoring and internal audit trail. ' +
        'It also had export document feature to comply with BAN-PT accreditation submission format.',
      year: 2017,
      role: 'Student',
      workplace: 'UIN Suska Riau',
      technology: ['PHP', 'Yii2', 'MySQL', 'REST API'],
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catMap['college'],
      title: 'Learn Arabic',
      slug: 'learn-arabic',
      description:
        'Learn Arabic is a learning platform consists of Dashboard and a Mobile application. The web dashboard is for managing content and the mobile app is for the student use. ' +
        'Learned Web Development, REST API, MySQL, Android.',
      year: 2017,
      role: 'Student',
      workplace: 'UIN Suska Riau',
      technology: ['PHP', 'Yii2', 'MySQL', 'REST API', 'Android'],
      githubUrl: 'https://github.com/adryanev/learn-arabic',
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catMap['college'],
      title: 'Simpopel',
      slug: 'simpopel',
      description:
        'Simpopel (Sistem Informasi Poin Pelanggaran Siswa) is a web application for managing student violation points and punishment. ' +
        'The application is made for Software Engineering lecture, case study in MA Hasanah Pekanbaru. ' +
        'Learned Software Development Lifecycle, Product Requirement, Software Engineering Diagrams, Software Testing, PHP, SQL.',
      year: 2017,
      role: 'Student',
      workplace: 'UIN Suska Riau',
      technology: ['Apache', 'PHP', 'MySQL'],
      githubUrl: 'https://github.com/adryanev/simpopel',
      status: 'published' as const,
      sortOrder: 2,
    },
    {
      categoryId: catMap['college'],
      title: 'Dasar Islam',
      slug: 'dasar-islam',
      description:
        'Dasar Islam is an education App to teach children about basic Islamic Teaching such as Islamic Beliefs, Islamic Five Pillars, Name of Angels, and Name of Prophets. ' +
        'Learned Fragment, RecyclerView, SQLite, and SharedPreference.',
      year: 2016,
      role: 'Student',
      workplace: 'UIN Suska Riau',
      technology: ['Android', 'SQLite'],
      githubUrl: 'https://github.com/adryanev/Dasar-Islam',
      status: 'published' as const,
      sortOrder: 3,
    },
    {
      categoryId: catMap['college'],
      title: 'Tinker Browser',
      slug: 'tinker-browser',
      description:
        'Tinker Browser is a simple mobile browser created on top of Android WebView. It collected user\'s visited website and filter if blocked website was opened, then it will send an email to registered contact that someone has visited blocked website. ' +
        'Learned Android Intent, WebView, SQLite, and SharedPreference.',
      year: 2016,
      role: 'Student',
      workplace: 'UIN Suska Riau',
      technology: ['Android', 'SQLite', 'WebView'],
      githubUrl: 'https://github.com/adryanev/Tinker-Browser',
      status: 'published' as const,
      sortOrder: 4,
    },

    // ── Open Source ──────────────────────────────────────
    {
      categoryId: catMap['open-source'],
      title: 'Flutter Clean Architecture Template',
      slug: 'flutter-clean-architecture-template',
      description:
        'A Flutter mobile app template built on Clean Architecture with test-driven development, starred by 50+ developers on GitHub.',
      year: 2022,
      role: 'Author',
      workplace: 'Open Source',
      technology: ['Flutter', 'Dart', 'Clean Architecture', 'TDD'],
      githubUrl: 'https://github.com/adryanev/flutter-mobile-clean-architecture-template',
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catMap['open-source'],
      title: 'Orkestra',
      slug: 'orkestra',
      description:
        'Orkestra is a CLI for running Claude Code and Codex in isolated git workspaces while keeping enough state to stop, resume, stream, and inspect those agent sessions. ' +
        'It creates git worktrees per workspace, stores agent session IDs for resume, verifies the live process before stopping it, injects per-profile GitHub tokens, and exposes workspace and LSP tools over MCP.',
      year: 2026,
      role: 'Author',
      workplace: 'Open Source',
      technology: ['Go', 'Git', 'MCP', 'Claude Code', 'Codex'],
      githubUrl: 'https://github.com/adryanev/orkestra',
      externalUrl: 'https://github.com/adryanev/orkestra/releases/latest',
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catMap['open-source'],
      title: 'PostKit',
      slug: 'postkit',
      description:
        'PostKit is a native macOS HTTP client for API development and testing, a lightweight alternative to Postman and Insomnia. ' +
        'It supports collections with nested folders, environments and variables, common body and authentication types, and Keychain-backed credential storage in a three-column layout.',
      year: 2026,
      role: 'Author',
      workplace: 'Open Source',
      technology: ['Swift', 'SwiftUI', 'SwiftData', 'macOS'],
      githubUrl: 'https://github.com/adryanev/PostKit',
      status: 'published' as const,
      sortOrder: 2,
    },
    {
      categoryId: catMap['open-source'],
      title: 'Frontend Benchmark',
      slug: 'frontend-benchmark',
      description:
        'A TypeScript CLI that measures website performance and Cloudflare caching effectiveness in a real browser under throttled network conditions. ' +
        'It tests every static resource, tracks Cloudflare and Worker cache hits, simulates first-time visits, and exports results to CSV and charts.',
      year: 2025,
      role: 'Author',
      workplace: 'Open Source',
      technology: ['TypeScript', 'Puppeteer', 'Cloudflare'],
      githubUrl: 'https://github.com/adryanev/frontend-benchmark',
      status: 'published' as const,
      sortOrder: 3,
    },
    {
      categoryId: catMap['open-source'],
      title: 'Go HTTP Service Template',
      slug: 'go-http-service-template',
      description:
        'A production-ready Go HTTP service template with dependency injection, graceful shutdown, structured logging, PostgreSQL connection pooling, request validation, NATS JetStream messaging, and OpenAPI documentation.',
      year: 2025,
      role: 'Author',
      workplace: 'Open Source',
      technology: ['Go', 'Chi', 'PostgreSQL', 'NATS', 'OpenAPI'],
      githubUrl: 'https://github.com/adryanev/go-http-service-template',
      status: 'published' as const,
      sortOrder: 4,
    },
    {
      categoryId: catMap['open-source'],
      title: 'iNewsOS',
      slug: 'inewsos',
      description:
        'A news aggregator iOS app built with SwiftUI on the MVI pattern and Clean Architecture, with home, detail, web view, and blog pages.',
      year: 2023,
      role: 'Author',
      workplace: 'Open Source',
      technology: ['SwiftUI', 'Combine', 'Alamofire', 'Swinject'],
      githubUrl: 'https://github.com/adryanev/iNewsOS',
      status: 'published' as const,
      sortOrder: 5,
    },
  ]

  await insertEach(db, portfolioProjects, projects)

  console.log(`Portfolio seeded: ${categories.length} categories, ${projects.length} projects`)

  await close()
  console.log('Done!')
}

seedPortfolio().catch((err) => {
  console.error('Portfolio seed failed:', err)
  process.exit(1)
})
