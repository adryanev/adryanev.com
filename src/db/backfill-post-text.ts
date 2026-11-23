import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { extractText, type OutputData } from '../lib/editorjs-renderer'

// `pnpm db:backfill-post-text` runs against local D1.
// `pnpm db:backfill-post-text --remote` runs against production D1.
const target = process.argv.includes('--remote') ? '--remote' : '--local'

type PostRow = { id: number; content: string; content_text: string }

function wrangler(args: string[]): string {
  return execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', target, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

function toPlainText(content: string): string {
  try {
    const data = JSON.parse(content) as OutputData
    return Array.isArray(data.blocks) ? extractText(data) : ''
  } catch {
    return ''
  }
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

const REBUILD_SEARCH_INDEX = [
  'delete from posts_fts;',
  `insert into posts_fts (rowid, title, excerpt, body, tags)
select p.id, p.title, coalesce(p.excerpt, ''), p.content_text,
  coalesce((select group_concat(t.name, ' ') from posts_to_tags pt join tags t on t.id = pt.tag_id where pt.post_id = p.id), '')
from posts p;`,
]

// Fills posts.content_text and rebuilds posts_fts. Safe to run again: the
// outcome depends only on the posts and tags currently stored.
function backfillPostText() {
  const output = wrangler(['--json', '--command', 'select id, content, content_text from posts'])
  const rows = (JSON.parse(output) as { results: PostRow[] }[])[0].results

  const updates = rows
    .map((row) => ({ id: row.id, text: toPlainText(row.content), stored: row.content_text }))
    .filter((row) => row.text !== row.stored)
    .map((row) => `update posts set content_text = ${sqlString(row.text)} where id = ${row.id};`)

  const directory = mkdtempSync(join(tmpdir(), 'backfill-post-text-'))
  const file = join(directory, 'backfill.sql')
  try {
    writeFileSync(file, [...updates, ...REBUILD_SEARCH_INDEX].join('\n'))
    wrangler(['--file', file])
  } finally {
    rmSync(directory, { recursive: true })
  }

  console.log(`Post text backfilled (${target.slice(2)}): ${updates.length} of ${rows.length} posts updated, search index rebuilt`)
}

try {
  backfillPostText()
} catch (err) {
  console.error('Post text backfill failed:', err)
  process.exit(1)
}
