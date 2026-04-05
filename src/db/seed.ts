import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq } from 'drizzle-orm'
import { portfolioCategories, portfolioProjects } from './schema/portfolio'
import { siteSettings } from './schema/settings'
import { posts, tags, postsToTags } from './schema/posts'
import { resumeEntries } from './schema/resume'
import { saasListings } from './schema/saas'
import { contacts } from './schema/contacts'

function editorjs(blocks: Array<Record<string, unknown>>): string {
  return JSON.stringify({
    time: 1714000000000,
    blocks,
    version: '2.31.5',
  })
}

function header(text: string, level: number) {
  return { type: 'header', data: { text, level } }
}

function paragraph(text: string) {
  return { type: 'paragraph', data: { text } }
}

function code(code: string, language?: string) {
  return { type: 'code', data: { code, language } }
}

function unorderedList(items: string[]) {
  return {
    type: 'list',
    data: {
      style: 'unordered',
      items: items.map((content) => ({ content, items: [] })),
    },
  }
}

function orderedList(items: string[]) {
  return {
    type: 'list',
    data: {
      style: 'ordered',
      items: items.map((content) => ({ content, items: [] })),
    },
  }
}

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const db = drizzle(pool)

  console.log('Seeding database...')

  // ── Portfolio categories ────────────────────────────────────
  const categories = [
    { name: 'College', slug: 'college', description: 'University projects and coursework', sortOrder: 0 },
    { name: 'Freelance', slug: 'freelance', description: 'Freelance and contract work', sortOrder: 1 },
    { name: 'TopApp.id', slug: 'topapp-id', description: 'Projects at TopApp.id', sortOrder: 2 },
    { name: 'Work', slug: 'work', description: 'Professional work projects', sortOrder: 3 },
    { name: 'Apple Developer Academy', slug: 'apple-developer-academy', description: 'Projects from Apple Developer Academy', sortOrder: 4 },
    { name: 'Lexicon', slug: 'lexicon', description: 'Projects at Lexicon', sortOrder: 5 },
  ]

  for (const category of categories) {
    await db
      .insert(portfolioCategories)
      .values(category)
      .onConflictDoNothing({ target: portfolioCategories.slug })
  }

  console.log(`Portfolio categories seeded: ${categories.length} categories`)

  // ── Site settings ───────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'Adryan Eka Vandra' },
    { key: 'site_title', value: 'adryanev.com' },
    { key: 'site_description', value: 'Software Engineer & Developer' },
    { key: 'contact_email', value: 'me@adryanev.com' },
    { key: 'github_url', value: 'https://github.com/adryanev' },
    { key: 'linkedin_url', value: 'https://linkedin.com/in/adryanev' },
  ]

  for (const setting of settings) {
    await db
      .insert(siteSettings)
      .values(setting)
      .onConflictDoNothing({ target: siteSettings.key })
  }

  console.log(`Site settings seeded: ${settings.length} settings`)

  // ── Tags ────────────────────────────────────────────────────
  const tagData = [
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'React', slug: 'react' },
    { name: 'Flutter', slug: 'flutter' },
    { name: 'Swift', slug: 'swift' },
    { name: 'Go', slug: 'go' },
    { name: 'Rust', slug: 'rust' },
    { name: 'DevOps', slug: 'devops' },
    { name: 'Architecture', slug: 'architecture' },
    { name: 'Tutorial', slug: 'tutorial' },
    { name: 'Career', slug: 'career' },
  ]

  for (const tag of tagData) {
    await db.insert(tags).values(tag).onConflictDoNothing({ target: tags.slug })
  }

  // Fetch tag IDs for linking
  const allTags = await db.select().from(tags)
  const tagBySlug = Object.fromEntries(allTags.map((t) => [t.slug, t.id]))

  console.log(`Tags seeded: ${tagData.length} tags`)

  // ── Blog posts ──────────────────────────────────────────────
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)

  const postData = [
    {
      title: 'Building a Personal Website with TanStack Start',
      slug: 'building-personal-website-tanstack-start',
      excerpt: 'A deep dive into building a modern personal website using TanStack Start with SSR, file-based routing, and Drizzle ORM.',
      content: editorjs([
        header('Building a Personal Website with TanStack Start', 1),
        paragraph('After years of using various frameworks, I decided to rebuild my personal site using <b>TanStack Start</b>, a full-stack React framework that feels like the future.'),
        header('Why TanStack Start?', 2),
        paragraph('TanStack Start gives you:'),
        unorderedList([
          '<b>File-based routing</b> with type-safe params',
          '<b>SSR out of the box</b> with streaming support',
          '<b>Server functions</b> that feel like RPC calls',
          'Built-in <b>head management</b> for SEO',
        ]),
        header('The Stack', 2),
        code(`// app.config.ts
import { defineConfig } from '@tanstack/react-start/config'

export default defineConfig({
  server: {
    preset: 'node-server',
  },
})`, 'typescript'),
        paragraph('The full stack includes:'),
        unorderedList([
          '<b>Framework:</b> TanStack Start',
          '<b>Database:</b> PostgreSQL + Drizzle',
          '<b>Styling:</b> Tailwind CSS v4',
          '<b>Auth:</b> Cookie sessions + argon2',
        ]),
        header('Server Functions', 2),
        paragraph('The killer feature is <code class="inline-code">createServerFn</code>:'),
        code(`import { createServerFn } from '@tanstack/react-start'

const getPosts = createServerFn({ method: 'GET' })
  .handler(async () => {
    return db.query.posts.findMany({
      where: eq(posts.status, 'published'),
      orderBy: [desc(posts.publishedAt)],
    })
  })`, 'typescript'),
        header('Conclusion', 2),
        paragraph('TanStack Start combines the best parts of modern React with server-side rendering. Give it a try!'),
      ]),
      status: 'published' as const,
      publishedAt: daysAgo(2),
      tagSlugs: ['typescript', 'react', 'tutorial'],
    },
    {
      title: 'Clean Architecture in Flutter: A Practical Guide',
      slug: 'clean-architecture-flutter-practical-guide',
      excerpt: 'How to structure Flutter apps using clean architecture principles with BLoC pattern and dependency injection.',
      content: editorjs([
        header('Clean Architecture in Flutter: A Practical Guide', 1),
        paragraph('When Flutter apps grow beyond a few screens, you need a solid architecture. Here\'s how I structure my projects.'),
        header('The Layers', 2),
        paragraph('Clean architecture divides your app into three layers:'),
        orderedList([
          '<b>Domain</b>, business logic, entities, use cases',
          '<b>Data</b>, repositories, data sources, models',
          '<b>Presentation</b>, UI, state management (BLoC)',
        ]),
        header('Project Structure', 2),
        code(`lib/
├── core/
│   ├── error/
│   ├── network/
│   └── usecases/
├── features/
│   └── auth/
│       ├── data/
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── bloc/
│           ├── pages/
│           └── widgets/
└── injection_container.dart`),
        header('Use Cases', 2),
        paragraph('Each use case does one thing:'),
        code(`class GetUser implements UseCase<User, GetUserParams> {
  final UserRepository repository;

  GetUser(this.repository);

  @override
  Future<Either<Failure, User>> call(GetUserParams params) {
    return repository.getUser(params.id);
  }
}`, 'dart'),
        header('BLoC Pattern', 2),
        code(`class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUser loginUser;

  AuthBloc({required this.loginUser}) : super(AuthInitial()) {
    on<LoginRequested>((event, emit) async {
      emit(AuthLoading());
      final result = await loginUser(
        LoginParams(email: event.email, password: event.password),
      );
      result.fold(
        (failure) => emit(AuthError(failure.message)),
        (user) => emit(AuthAuthenticated(user)),
      );
    });
  }
}`, 'dart'),
        header('Key Takeaways', 2),
        unorderedList([
          'Keep layers independent, domain never imports data or presentation',
          'Use <b>Either</b> type for error handling (dartz package)',
          'Dependency injection with <b>get_it</b> makes testing easy',
          'Each feature is self-contained, easy to delete or refactor',
        ]),
      ]),
      status: 'published' as const,
      publishedAt: daysAgo(10),
      tagSlugs: ['flutter', 'architecture'],
    },
    {
      title: 'Getting Started with SwiftUI and The Composable Architecture',
      slug: 'swiftui-composable-architecture',
      excerpt: 'Learn how to build robust iOS apps using SwiftUI and TCA for predictable state management.',
      content: editorjs([
        header('Getting Started with SwiftUI and The Composable Architecture', 1),
        paragraph('SwiftUI revolutionized iOS development, but state management can get messy. Enter <b>The Composable Architecture (TCA)</b>.'),
        header('What is TCA?', 2),
        paragraph('TCA is a library from Point-Free that provides:'),
        unorderedList([
          '<b>Unidirectional data flow</b>',
          '<b>Composable reducers</b>',
          '<b>Built-in testing</b> support',
          '<b>Side effect management</b>',
        ]),
        header('A Simple Counter', 2),
        code(`@Reducer
struct CounterFeature {
  @ObservableState
  struct State: Equatable {
    var count = 0
  }

  enum Action {
    case incrementButtonTapped
    case decrementButtonTapped
  }

  var body: some ReducerOf<Self> {
    Reduce { state, action in
      switch action {
      case .incrementButtonTapped:
        state.count += 1
        return .none
      case .decrementButtonTapped:
        state.count -= 1
        return .none
      }
    }
  }
}`, 'swift'),
        header('The View', 2),
        code(`struct CounterView: View {
  let store: StoreOf<CounterFeature>

  var body: some View {
    HStack {
      Button("-") { store.send(.decrementButtonTapped) }
      Text("\\(store.count)")
      Button("+") { store.send(.incrementButtonTapped) }
    }
  }
}`, 'swift'),
        header('Testing', 2),
        code(`@Test
func increment() async {
  let store = TestStore(initialState: CounterFeature.State()) {
    CounterFeature()
  }
  await store.send(.incrementButtonTapped) {
    $0.count = 1
  }
}`, 'swift'),
        paragraph('TCA makes your SwiftUI apps testable and predictable. Worth the learning curve!'),
      ]),
      status: 'published' as const,
      publishedAt: daysAgo(20),
      tagSlugs: ['swift', 'architecture'],
    },
    {
      title: 'Docker Compose for Local Development: A Complete Setup',
      slug: 'docker-compose-local-development',
      excerpt: 'Setting up a productive local development environment with Docker Compose, PostgreSQL, MinIO, and hot reload.',
      content: editorjs([
        header('Docker Compose for Local Development', 1),
        paragraph('Every project needs a reproducible dev environment. Here\'s my go-to Docker Compose setup.'),
        header('The Stack', 2),
        code(`services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pg_data:
  minio_data:`, 'yaml'),
        header('Key Principles', 2),
        orderedList([
          '<b>Named volumes</b> for persistence across restarts',
          '<b>Health checks</b> so dependent services wait',
          '<b>Environment files</b> keep secrets out of compose',
          '<b>Port mapping</b> matches production conventions',
        ]),
        header('Tips', 2),
        unorderedList([
          'Use <code class="inline-code">docker compose up -d</code> for background mode',
          '<code class="inline-code">docker compose logs -f postgres</code> to tail specific service logs',
          '<code class="inline-code">docker compose down -v</code> to reset all data (nuclear option)',
        ]),
        paragraph('Simple, reproducible, works everywhere.'),
      ]),
      status: 'published' as const,
      publishedAt: daysAgo(35),
      tagSlugs: ['devops', 'tutorial'],
    },
    {
      title: 'Why I Switched from REST to tRPC (and Back Again)',
      slug: 'rest-vs-trpc-experience',
      excerpt: 'My journey with tRPC: the good, the bad, and why I ultimately came back to REST-like server functions.',
      content: editorjs([
        header('Why I Switched from REST to tRPC (and Back Again)', 1),
        paragraph('tRPC promised end-to-end type safety without code generation. After a year, here\'s my honest take.'),
        header('The Good', 2),
        unorderedList([
          '<b>Instant type safety</b>, change a return type, see errors everywhere',
          '<b>No API spec to maintain</b>, types ARE the contract',
          '<b>Excellent DX</b>, autocomplete on API calls is addictive',
        ]),
        header('The Bad', 2),
        unorderedList([
          '<b>Tight coupling</b>, client and server must deploy together',
          '<b>Debugging is harder</b>, network tab shows opaque POST requests',
          '<b>Limited ecosystem</b>, no Postman, no OpenAPI, no API gateway support',
        ]),
        header('Server Functions: The Middle Ground', 2),
        paragraph('TanStack Start\'s <code class="inline-code">createServerFn</code> gives you:'),
        code(`// Type-safe, but it's just a POST request under the hood
const getPost = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    return db.query.posts.findFirst({
      where: eq(posts.slug, data.slug),
    })
  })

// Client usage — fully typed
const post = await getPost({ data: { slug: 'hello-world' } })`, 'typescript'),
        header('My Take', 2),
        paragraph('For <b>monorepo full-stack apps</b>, tRPC is great. For <b>anything else</b>, stick with REST or server functions. The simplicity wins long-term.'),
      ]),
      status: 'published' as const,
      publishedAt: daysAgo(45),
      tagSlugs: ['typescript', 'architecture'],
    },
    {
      title: 'Building a CLI Tool in Go: Lessons Learned',
      slug: 'building-cli-tool-go',
      excerpt: 'Practical tips from building production CLI tools in Go using cobra, viper, and bubbletea.',
      content: editorjs([
        header('Building a CLI Tool in Go: Lessons Learned', 1),
        paragraph('Go is excellent for CLI tools. Fast compilation, single binary output, great stdlib. Here\'s what I learned building several.'),
        header('The Toolkit', 2),
        unorderedList([
          '<b>cobra</b>, command structure and flag parsing',
          '<b>viper</b>, configuration management',
          '<b>bubbletea</b>, terminal UI (TUI) framework',
          '<b>lipgloss</b>, styling for terminal output',
        ]),
        header('Project Layout', 2),
        code(`cmd/
├── root.go
├── init.go
├── serve.go
└── deploy.go
internal/
├── config/
├── runner/
└── ui/
main.go`),
        header('Key Lessons', 2),
        header('1. Use cobra\'s PersistentPreRun for setup', 3),
        code(`var rootCmd = &cobra.Command{
  Use:   "mytool",
  PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
    return initConfig()
  },
}`, 'go'),
        header('2. Stream output, don\'t buffer', 3),
        code(`scanner := bufio.NewScanner(stdout)
for scanner.Scan() {
  fmt.Println(scanner.Text())
}`, 'go'),
        header('3. Always support JSON output', 3),
        code(`if outputJSON {
  json.NewEncoder(os.Stdout).Encode(result)
} else {
  printHumanReadable(result)
}`, 'go'),
        paragraph('Go CLIs are a joy to build and distribute. Cross-compile with <code class="inline-code">GOOS</code> and <code class="inline-code">GOARCH</code>, ship a single binary.'),
      ]),
      status: 'published' as const,
      publishedAt: daysAgo(60),
      tagSlugs: ['go', 'tutorial'],
    },
    {
      title: 'Exploring Rust for Web Backends: Axum in Practice',
      slug: 'rust-web-backends-axum',
      excerpt: 'First impressions of building a web API with Rust and Axum, performance, DX, and the learning curve.',
      content: editorjs([
        header('Exploring Rust for Web Backends: Axum in Practice', 1),
        paragraph('I\'ve been curious about Rust for web development. After building a small API with Axum, here are my thoughts.'),
        header('Why Axum?', 2),
        paragraph('Axum is built on top of <b>tokio</b> and <b>tower</b>, giving you:'),
        unorderedList([
          'Async/await runtime',
          'Middleware ecosystem (tower)',
          'Type-safe extractors',
          'WebSocket support',
        ]),
        header('A Basic Handler', 2),
        code(`use axum::{extract::Path, Json};
use serde::Serialize;

#[derive(Serialize)]
struct Post {
    id: i32,
    title: String,
    slug: String,
}

async fn get_post(Path(slug): Path<String>) -> Json<Post> {
    // In reality, query the database
    Json(Post {
        id: 1,
        title: "Hello World".into(),
        slug,
    })
}`, 'rust'),
        header('The Learning Curve', 2),
        paragraph('Rust\'s ownership model takes getting used to, especially with async code. But once it clicks:'),
        unorderedList([
          '<b>No null pointer exceptions</b>, ever',
          '<b>No data races</b>, the compiler prevents them',
          '<b>Memory safety</b>, without a GC',
        ]),
        header('Performance', 2),
        paragraph('In my benchmarks (wrk, 10 concurrent connections):'),
        unorderedList([
          '<b>Axum (Rust):</b> 48,000 req/sec, P99 latency 1.2ms',
          '<b>Express (Node):</b> 12,000 req/sec, P99 latency 4.8ms',
          '<b>Gin (Go):</b> 35,000 req/sec, P99 latency 1.8ms',
        ]),
        header('Verdict', 2),
        paragraph('Rust is overkill for most web apps, but if you need raw performance or are building infrastructure, it\'s hard to beat. I\'ll keep using TypeScript for most projects, but Axum is in my toolbox now.'),
      ]),
      status: 'published' as const,
      publishedAt: daysAgo(75),
      tagSlugs: ['rust', 'architecture'],
    },
    {
      title: 'My Developer Workflow in 2025',
      slug: 'developer-workflow-2025',
      excerpt: 'Tools, habits, and processes that make me productive as a software engineer.',
      content: editorjs([
        header('My Developer Workflow in 2025', 1),
        paragraph('Every year I refine my workflow. Here\'s what stuck in 2025.'),
        header('Editor: VS Code + Vim Motions', 2),
        paragraph('I use VS Code with the Vim extension. Best of both worlds, Vim\'s editing speed with VS Code\'s ecosystem.'),
        paragraph('Key extensions:'),
        unorderedList([
          '<b>GitHub Copilot</b>, AI pair programmer',
          '<b>Error Lens</b>, inline error display',
          '<b>GitLens</b>, Git blame and history',
          '<b>Tailwind Intellisense</b>, CSS class autocomplete',
        ]),
        header('Terminal: Ghostty + tmux', 2),
        paragraph('Ghostty is blazing fast and GPU-accelerated. Combined with tmux, I get:'),
        unorderedList([
          'Split panes for server, tests, and shell',
          'Session persistence across restarts',
          'Quick project switching with tmux-sessionizer',
        ]),
        header('Git Workflow', 2),
        code(`# Feature branch from main
git checkout -b feat/new-feature

# Small, focused commits
git add -p  # Stage hunks interactively
git commit -m "feat: add user authentication"

# Rebase before PR
git rebase -i origin/main`, 'bash'),
        header('Key Habits', 2),
        orderedList([
          '<b>Ship daily</b>, small PRs, merged quickly',
          '<b>Write tests first</b> for complex logic',
          '<b>Document decisions</b>, ADRs in the repo',
          '<b>Automate repetitive tasks</b>, scripts over manual steps',
        ]),
        paragraph('The best workflow is one you actually follow. Keep iterating.'),
      ]),
      status: 'published' as const,
      publishedAt: daysAgo(90),
      tagSlugs: ['career', 'devops'],
    },
    {
      title: 'Draft: Implementing Real-time Features with WebSockets',
      slug: 'draft-real-time-websockets',
      excerpt: 'Work in progress, exploring WebSocket implementations across different frameworks.',
      content: editorjs([
        header('Implementing Real-time Features with WebSockets', 1),
        paragraph('<i>This post is still a work in progress.</i>'),
        header('Overview', 2),
        paragraph('Real-time features are increasingly expected in modern web apps. Let\'s explore WebSocket implementations.'),
        header('TODO', 2),
        unorderedList([
          'Compare Socket.IO vs native WebSockets',
          'Add benchmarks',
          'Write the conclusion',
        ]),
      ]),
      status: 'draft' as const,
      publishedAt: null,
      tagSlugs: ['typescript', 'react'],
    },
  ]

  for (const post of postData) {
    const { tagSlugs, ...postValues } = post
    const [inserted] = await db
      .insert(posts)
      .values(postValues)
      .onConflictDoNothing({ target: posts.slug })
      .returning({ id: posts.id })

    if (inserted && tagSlugs.length > 0) {
      const tagLinks = tagSlugs
        .filter((slug) => tagBySlug[slug])
        .map((slug) => ({ postId: inserted.id, tagId: tagBySlug[slug] }))
      if (tagLinks.length > 0) {
        await db.insert(postsToTags).values(tagLinks).onConflictDoNothing()
      }
    }
  }

  console.log(`Blog posts seeded: ${postData.length} posts`)

  // ── Portfolio projects ──────────────────────────────────────
  // Fetch category IDs
  const allCategories = await db.select().from(portfolioCategories)
  const catBySlug = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]))

  const projectData = [
    {
      categoryId: catBySlug['college'],
      title: 'Smart Campus IoT Dashboard',
      slug: 'smart-campus-iot',
      description: editorjs([
        paragraph('Real-time monitoring dashboard for campus IoT sensors, covering temperature, humidity, and occupancy tracking across 12 buildings. Built as a capstone project.'),
      ]),
      year: 2020,
      role: 'Full Stack Developer',
      workplace: 'Institut Teknologi Sepuluh Nopember',
      technology: ['Flutter', 'Firebase', 'Node.js', 'MQTT', 'InfluxDB'],
      githubUrl: 'https://github.com/adryanev/smart-campus-iot',
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catBySlug['college'],
      title: 'Petani Kode Learning Platform',
      slug: 'petani-kode',
      description: editorjs([
        paragraph('Mobile learning platform for programming education in Bahasa Indonesia. Features code playground, quizzes, and progress tracking.'),
      ]),
      year: 2019,
      role: 'Mobile Developer',
      workplace: 'Institut Teknologi Sepuluh Nopember',
      technology: ['Flutter', 'Dart', 'REST API', 'SQLite'],
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catBySlug['freelance'],
      title: 'Klinik Sehat Patient Management',
      slug: 'klinik-sehat',
      description: editorjs([
        paragraph('Patient management system for a chain of clinics. Appointment booking, medical records, and billing integrated into a single mobile app.'),
      ]),
      year: 2021,
      role: 'Lead Mobile Developer',
      workplace: 'Freelance',
      technology: ['Flutter', 'BLoC', 'PostgreSQL', 'Express.js', 'Docker'],
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catBySlug['topapp-id'],
      title: 'TopApp Business Suite',
      slug: 'topapp-business-suite',
      description: editorjs([
        paragraph('All-in-one business management app for Indonesian SMEs. Inventory, invoicing, POS, and financial reporting with offline-first architecture.'),
      ]),
      year: 2022,
      role: 'Senior Flutter Developer',
      workplace: 'TopApp.id',
      technology: ['Flutter', 'Riverpod', 'Hive', 'Go', 'gRPC', 'PostgreSQL'],
      externalUrl: 'https://topapp.id',
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catBySlug['apple-developer-academy'],
      title: 'Healio — Mental Health Companion',
      slug: 'healio-mental-health',
      description: editorjs([
        paragraph('iOS app for mental health self-tracking with mood journaling, CBT exercises, and Apple Health integration. Won Best Design award at Academy showcase.'),
      ]),
      year: 2023,
      role: 'iOS Developer',
      workplace: 'Apple Developer Academy @ BINUS',
      technology: ['Swift', 'SwiftUI', 'Core Data', 'HealthKit', 'CloudKit'],
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catBySlug['apple-developer-academy'],
      title: 'FocusFlow — Pomodoro with Spatial Audio',
      slug: 'focusflow-pomodoro',
      description: editorjs([
        paragraph('Productivity app combining Pomodoro technique with spatial audio environments. Uses ARKit for immersive focus sessions.'),
      ]),
      year: 2023,
      role: 'iOS Developer',
      workplace: 'Apple Developer Academy @ BINUS',
      technology: ['Swift', 'SwiftUI', 'ARKit', 'AVFoundation', 'StoreKit 2'],
      status: 'published' as const,
      sortOrder: 1,
    },
    {
      categoryId: catBySlug['lexicon'],
      title: 'Lexicon Platform API',
      slug: 'lexicon-platform-api',
      description: editorjs([
        paragraph('High-performance REST API powering the Lexicon language learning platform. Handles 50k+ daily active users with sub-100ms response times.'),
      ]),
      year: 2024,
      role: 'Backend Engineer',
      workplace: 'Lexicon',
      technology: ['Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'OpenAPI'],
      status: 'published' as const,
      sortOrder: 0,
    },
    {
      categoryId: catBySlug['work'],
      title: 'Enterprise Document Management System',
      slug: 'enterprise-dms',
      description: editorjs([
        paragraph('Document management and workflow automation system for a government agency. Role-based access, digital signatures, and audit logging.'),
      ]),
      year: 2022,
      role: 'Full Stack Developer',
      workplace: 'PT Telkom Indonesia',
      technology: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'MinIO', 'Docker'],
      status: 'published' as const,
      sortOrder: 0,
    },
  ]

  for (const project of projectData) {
    await db
      .insert(portfolioProjects)
      .values(project)
      .onConflictDoNothing({ target: portfolioProjects.slug })
  }

  console.log(`Portfolio projects seeded: ${projectData.length} projects`)

  // ── Resume entries ──────────────────────────────────────────
  const resumeData = [
    // Experience
    {
      type: 'experience' as const,
      title: 'Backend Engineer',
      organization: 'Lexicon',
      location: 'Remote',
      description: 'Building high-performance Go APIs for a language learning platform serving 50k+ DAU. Designing microservices architecture, implementing caching strategies, and optimizing database queries.',
      startDate: '2024-01-01',
      endDate: null,
      sortOrder: 0,
    },
    {
      type: 'experience' as const,
      title: 'Senior Flutter Developer',
      organization: 'TopApp.id',
      location: 'Jakarta, Indonesia',
      description: 'Led mobile development for an all-in-one business management app. Implemented offline-first architecture with background sync, managed a team of 3 developers.',
      startDate: '2022-03-01',
      endDate: '2023-12-31',
      sortOrder: 1,
    },
    {
      type: 'experience' as const,
      title: 'Full Stack Developer',
      organization: 'PT Telkom Indonesia',
      location: 'Bandung, Indonesia',
      description: 'Developed internal enterprise tools and document management systems. Built React frontends and Node.js backends with PostgreSQL.',
      startDate: '2021-01-01',
      endDate: '2022-02-28',
      sortOrder: 2,
    },
    {
      type: 'experience' as const,
      title: 'Freelance Mobile Developer',
      organization: 'Self-employed',
      location: 'Surabaya, Indonesia',
      description: 'Built custom mobile applications for local businesses including clinic management, POS systems, and delivery tracking apps.',
      startDate: '2020-06-01',
      endDate: '2020-12-31',
      sortOrder: 3,
    },
    // Education
    {
      type: 'education' as const,
      title: 'Apple Developer Academy',
      organization: 'Apple Developer Academy @ BINUS',
      location: 'Jakarta, Indonesia',
      description: 'Intensive iOS development program. Built 4 apps using Swift, SwiftUI, and Apple frameworks. Won Best Design award for Healio project.',
      startDate: '2023-03-01',
      endDate: '2023-12-31',
      sortOrder: 0,
    },
    {
      type: 'education' as const,
      title: 'Bachelor of Informatics',
      organization: 'Institut Teknologi Sepuluh Nopember (ITS)',
      location: 'Surabaya, Indonesia',
      description: 'Computer Science degree with focus on software engineering and distributed systems. GPA: 3.78/4.00.',
      startDate: '2016-08-01',
      endDate: '2020-07-31',
      sortOrder: 1,
    },
    // Certifications
    {
      type: 'certification' as const,
      title: 'AWS Solutions Architect Associate',
      organization: 'Amazon Web Services',
      description: 'Cloud architecture design, deployment, and operations on AWS.',
      startDate: '2024-06-01',
      sortOrder: 0,
    },
    {
      type: 'certification' as const,
      title: 'Google Associate Cloud Engineer',
      organization: 'Google Cloud',
      description: 'Deploying and managing applications on Google Cloud Platform.',
      startDate: '2023-09-01',
      sortOrder: 1,
    },
    // Skills
    {
      type: 'skill' as const,
      title: 'Languages',
      description: 'TypeScript, Go, Dart, Swift, Rust, Python, SQL',
      sortOrder: 0,
    },
    {
      type: 'skill' as const,
      title: 'Frontend',
      description: 'React, TanStack Start, SwiftUI, Flutter, Tailwind CSS',
      sortOrder: 1,
    },
    {
      type: 'skill' as const,
      title: 'Backend',
      description: 'Node.js, Go (Gin/Echo), PostgreSQL, Redis, gRPC, REST',
      sortOrder: 2,
    },
    {
      type: 'skill' as const,
      title: 'DevOps & Tools',
      description: 'Docker, Kubernetes, GitHub Actions, Terraform, AWS, GCP',
      sortOrder: 3,
    },
  ]

  for (const entry of resumeData) {
    // Check if entry with same title + organization already exists
    const existing = await db
      .select({ id: resumeEntries.id })
      .from(resumeEntries)
      .where(eq(resumeEntries.title, entry.title))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(resumeEntries).values(entry)
    }
  }

  console.log(`Resume entries seeded: ${resumeData.length} entries`)

  // ── SaaS listings ───────────────────────────────────────────
  const saasData = [
    {
      name: 'Asuncion',
      slug: 'asuncion',
      description: 'A modern personal website and blog platform built with TanStack Start. Features admin dashboard, markdown blog with syntax highlighting, portfolio showcase, and contact form.',
      url: 'https://adryanev.com',
      githubUrl: 'https://github.com/adryanev/asuncion',
      technology: ['TypeScript', 'TanStack Start', 'React', 'PostgreSQL', 'Drizzle', 'Tailwind CSS'],
      status: 'active' as const,
      sortOrder: 0,
    },
    {
      name: 'Keuangan.app',
      slug: 'keuangan-app',
      description: 'Personal finance tracker for Indonesian users. Supports multi-currency, bank sync via OY! API, budget planning, and spending analytics with beautiful charts.',
      url: 'https://keuangan.app',
      technology: ['Flutter', 'Go', 'PostgreSQL', 'Redis', 'Docker'],
      status: 'active' as const,
      sortOrder: 1,
    },
    {
      name: 'DevPulse',
      slug: 'devpulse',
      description: 'Developer activity dashboard that aggregates GitHub, GitLab, and Jira data into a unified view. Team leads get insights into shipping velocity and code review bottlenecks.',
      technology: ['TypeScript', 'Next.js', 'PostgreSQL', 'Temporal', 'React'],
      status: 'beta' as const,
      sortOrder: 2,
    },
    {
      name: 'Noteku',
      slug: 'noteku',
      description: 'Minimalist note-taking app with offline-first sync. Markdown support, backlinks, and daily notes. Built as an Obsidian alternative for mobile-first users.',
      technology: ['Flutter', 'Dart', 'SQLite', 'CRDTs', 'WebSocket'],
      status: 'retired' as const,
      sortOrder: 3,
    },
  ]

  for (const listing of saasData) {
    await db
      .insert(saasListings)
      .values(listing)
      .onConflictDoNothing({ target: saasListings.slug })
  }

  console.log(`SaaS listings seeded: ${saasData.length} listings`)

  // ── Sample contact submissions ──────────────────────────────
  const contactData = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Freelance inquiry',
      message: 'Hi Adryan, I came across your portfolio and I\'m impressed with your Flutter work. We have a mobile app project that needs a senior developer. Would you be available for a 3-month contract starting next month? Budget is flexible.',
      isRead: true,
    },
    {
      name: 'Sarah Chen',
      email: 'sarah.chen@techcorp.com',
      subject: 'Speaking opportunity',
      message: 'Hello! I\'m organizing a tech meetup in Jakarta about mobile architecture patterns. Your blog post on Clean Architecture in Flutter was excellent. Would you be interested in giving a 30-minute talk? We\'d cover travel expenses.',
      isRead: true,
    },
    {
      name: 'Ahmad Rizki',
      email: 'ahmad@startup.co.id',
      subject: 'Collaboration on open source',
      message: 'Mas Adryan, saya tertarik dengan project Keuangan.app. Apakah ada rencana untuk open-source beberapa komponen? Saya ingin berkontribusi, terutama di bagian bank sync API. Terima kasih!',
      isRead: false,
    },
    {
      name: 'Lisa Park',
      email: 'lisa@university.edu',
      subject: 'Student question about your blog',
      message: 'Hi, I\'m a CS student and I\'ve been following your blog posts about architecture patterns. Could you recommend some resources for learning clean architecture beyond what you\'ve covered? Also, do you have any tips for someone starting their career in software engineering?',
      isRead: false,
    },
  ]

  for (const contact of contactData) {
    // Only insert if no contact with same email + subject exists
    const existing = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, contact.email))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(contacts).values(contact)
    }
  }

  console.log(`Contact submissions seeded: ${contactData.length} contacts`)

  // ── Done ────────────────────────────────────────────────────
  await pool.end()
  console.log('Seeding complete!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
