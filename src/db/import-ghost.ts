import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { slugify } from '../lib/slugify'
import { postContentText, resolvePostExcerpt } from '../lib/post-excerpt'
import { convertGhostPost, coverImageUrl, IMPORTED_MEDIA_PREFIX, type GistFile } from './ghost-import/convert'

// Imports the posts of the old Ghost blog (belajarinformatika.id) from a Ghost
// JSON export and the export's content/ folder.
//
//   pnpm db:import-ghost <export.json> <content dir> --gists <dir> [--status draft|published] [--author <name>] [--dry-run] [--remote]
//
// --gists holds <gist id>.json files ([{ content, language }]) for the gists
// the posts embed. --status published keeps each post's Ghost status; draft
// (the default) imports every post as a draft. Publication dates are kept
// either way, so publishing a draft later shows its original date.
// Safe to run again: posts whose slug already exists are left untouched, and
// images are uploaded under fixed keys with the bytes from the export.

const R2_BUCKET = 'adryanev-com-media'
const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

type GhostPost = {
  id: string
  type: 'post' | 'page'
  status: 'published' | 'draft'
  slug: string
  title: string
  mobiledoc: string
  plaintext: string | null
  feature_image: string | null
  custom_excerpt: string | null
  author_id: string
  published_at: string | null
  created_at: string
  updated_at: string
}

type GhostExport = {
  db: [{
    data: {
      posts: GhostPost[]
      tags: { id: string; name: string; visibility: string }[]
      posts_tags: { post_id: string; tag_id: string; sort_order: number }[]
      users: { id: string; name: string }[]
    }
  }]
}

type ImportedPost = {
  title: string
  slug: string
  content: string
  contentText: string
  excerpt: string
  coverImage: string | null
  status: 'published' | 'draft'
  publishedAt: number | null
  createdAt: number
  updatedAt: number
  tags: string[]
  images: string[]
}

const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    gists: { type: 'string' },
    status: { type: 'string', default: 'draft' },
    author: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    remote: { type: 'boolean', default: false },
  },
})

const [exportPath, contentDir] = positionals
if (!exportPath || !contentDir || !options.gists) {
  throw new Error('usage: import-ghost <export.json> <content dir> --gists <dir> [--status draft|published] [--author <name>] [--dry-run] [--remote]')
}
if (options.status !== 'draft' && options.status !== 'published') {
  throw new Error('--status must be draft or published')
}
const target = options.remote ? '--remote' : '--local'

function selectPosts(data: GhostExport['db'][0]['data']): GhostPost[] {
  const authorIds = options.author
    ? new Set(data.users.filter((user) => user.name === options.author).map((user) => user.id))
    : null
  if (authorIds?.size === 0) throw new Error(`No Ghost user named ${options.author}`)
  return data.posts.filter((post) => post.type === 'post' && (!authorIds || authorIds.has(post.author_id)))
}

function loadGists(posts: GhostPost[], directory: string): Map<string, GistFile[]> {
  const ids = new Set(posts.flatMap((post) => [...post.mobiledoc.matchAll(/gist\.github\.com\/[\w-]+\/([0-9a-f]+)\.js/g)].map((match) => match[1])))
  return new Map([...ids].map((id) => {
    const file = join(directory, `${id}.json`)
    if (!existsSync(file)) throw new Error(`Missing gist ${id}: expected ${file}`)
    return [id, JSON.parse(readFileSync(file, 'utf8')) as GistFile[]]
  }))
}

function postTags(post: GhostPost, data: GhostExport['db'][0]['data']): string[] {
  const tagsById = new Map(data.tags.map((tag) => [tag.id, tag]))
  return data.posts_tags
    .filter((link) => link.post_id === post.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => tagsById.get(link.tag_id))
    .filter((tag) => tag && tag.visibility === 'public')
    .map((tag) => tag!.name)
}

function convertPost(post: GhostPost, data: GhostExport['db'][0]['data'], importedSlugs: Set<string>, gists: Map<string, GistFile[]>): ImportedPost {
  const converted = convertGhostPost(post.mobiledoc, { importedSlugs, gists })
  const images = new Set(converted.images)
  const coverImage = post.feature_image ? coverImageUrl(post.feature_image, images) : null
  const content = JSON.stringify({ time: Date.parse(post.updated_at), blocks: converted.blocks, version: '2.31.0' })
  const status = options.status === 'published' ? post.status : 'draft'
  return {
    title: post.title,
    slug: post.slug,
    content,
    contentText: postContentText(content),
    excerpt: resolvePostExcerpt(post.custom_excerpt ?? undefined, content),
    coverImage,
    status,
    publishedAt: post.status === 'published' && post.published_at ? Date.parse(post.published_at) : null,
    createdAt: Date.parse(post.created_at),
    updatedAt: Date.parse(post.updated_at),
    tags: postTags(post, data),
    images: [...images].sort(),
  }
}

function sqlString(value: string | null): string {
  return value === null ? 'NULL' : `'${value.replace(/'/g, "''")}'`
}

function sqlNumber(value: number | null): string {
  return value === null ? 'NULL' : String(value)
}

function importSql(posts: ImportedPost[]): string {
  const tagNames = [...new Set(posts.flatMap((post) => post.tags))]
  const statements = [
    ...tagNames.map((name) => `INSERT OR IGNORE INTO tags (name, slug) VALUES (${sqlString(name)}, ${sqlString(slugify(name))});`),
    ...posts.map((post) => `INSERT INTO posts (title, slug, content, content_text, excerpt, cover_image, status, published_at, created_at, updated_at) VALUES (${[
      sqlString(post.title), sqlString(post.slug), sqlString(post.content), sqlString(post.contentText),
      sqlString(post.excerpt), sqlString(post.coverImage), sqlString(post.status),
      sqlNumber(post.publishedAt), sqlNumber(post.createdAt), sqlNumber(post.updatedAt),
    ].join(', ')}) ON CONFLICT(slug) DO NOTHING;`),
    ...posts.flatMap((post) => post.tags.map((name) =>
      `INSERT OR IGNORE INTO posts_to_tags (post_id, tag_id) SELECT p.id, t.id FROM posts p, tags t WHERE p.slug = ${sqlString(post.slug)} AND t.slug = ${sqlString(slugify(name))} AND p.created_at = ${post.createdAt};`,
    )),
  ]
  return statements.join('\n')
}

function uploadImage(path: string) {
  const file = join(contentDir, 'images', path)
  const contentType = IMAGE_CONTENT_TYPES[extname(path).toLowerCase()]
  if (!contentType) throw new Error(`No content type for ${path}`)
  if (!existsSync(file)) throw new Error(`Image missing from the export: ${file}`)
  const key = `${IMPORTED_MEDIA_PREFIX.replace('/media/', '')}${path}`
  execFileSync('pnpm', ['exec', 'wrangler', 'r2', 'object', 'put', `${R2_BUCKET}/${key}`, '--file', file, '--content-type', contentType, target], { stdio: 'ignore' })
  console.log(`put ${key}`)
}

function runSql(sql: string) {
  const directory = mkdtempSync(join(tmpdir(), 'import-ghost-'))
  const file = join(directory, 'import.sql')
  try {
    writeFileSync(file, sql)
    execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', target, '--file', file], { stdio: 'inherit' })
  } finally {
    rmSync(directory, { recursive: true })
  }
}

function importGhost() {
  const data = (JSON.parse(readFileSync(exportPath, 'utf8')) as GhostExport).db[0].data
  const ghostPosts = selectPosts(data)
  const importedSlugs = new Set(ghostPosts.map((post) => post.slug))
  const gists = loadGists(ghostPosts, options.gists!)
  const posts = ghostPosts.map((post) => convertPost(post, data, importedSlugs, gists))
  const images = [...new Set(posts.flatMap((post) => post.images))].sort()
  const sql = importSql(posts)

  for (const post of posts) {
    console.log(`${post.status.padEnd(9)} ${post.slug} (${post.images.length} images, tags: ${post.tags.join(', ') || 'none'})`)
  }
  console.log(`${posts.length} posts, ${images.length} images, largest statement ${Math.max(...sql.split('\n').map((line) => line.length))} bytes, target ${target}`)
  if (options['dry-run']) return

  images.forEach(uploadImage)
  runSql(sql)
}

importGhost()
