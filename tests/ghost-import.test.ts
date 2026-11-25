import assert from 'node:assert/strict'
import { test } from 'node:test'
import { convertGhostPost, coverImageUrl, type ConvertContext } from '../src/db/ghost-import/convert'
import { renderPostBody } from '../src/lib/editorjs-renderer'

type Section = unknown[]

function mobiledoc(sections: Section[], extra: { cards?: unknown[]; markups?: unknown[]; atoms?: unknown[] } = {}): string {
  return JSON.stringify({ version: '0.3.1', atoms: extra.atoms ?? [], cards: extra.cards ?? [], markups: extra.markups ?? [], sections })
}

const context: ConvertContext = {
  importedSlugs: new Set(['belajar-kotlin-2']),
  gists: new Map([['abc123', [{ content: 'fun main() = println("hi")', language: 'Kotlin' }]]]),
}

function render(doc: string): string {
  return renderPostBody({ blocks: convertGhostPost(doc, context).blocks }).html
}

test('paragraph markers keep nested emphasis, links and escaped text', () => {
  const doc = mobiledoc(
    [[1, 'p', [[0, [], 0, 'Use '], [0, [0], 0, 'List<String> '], [0, [1], 2, 'here'], [0, [], 0, ' now']]]],
    { markups: [['b'], ['a', ['href', 'https://kotlinlang.org']]] },
  )
  assert.equal(render(doc), '<p>Use <b>List&lt;String&gt; <a href="https://kotlinlang.org">here</a></b> now</p>')
})

test('old site images move under /media and are reported for upload', () => {
  const doc = mobiledoc([[10, 0]], { cards: [['image', { src: '__GHOST_URL__/content/images/2020/05/shot.png', caption: 'Hasil' }]] })
  const converted = convertGhostPost(doc, context)
  assert.deepEqual(converted.images, ['2020/05/shot.png'])
  assert.match(render(doc), /<img src="\/media\/blog\/belajarinformatika\/2020\/05\/shot\.png" alt="Hasil"/)
})

test('links to imported posts point at /blog, links to other old pages lose the link', () => {
  const doc = mobiledoc(
    [[1, 'p', [[0, [0], 1, 'part 2'], [0, [], 0, ' and '], [0, [1], 1, 'about']]]],
    { markups: [['a', ['href', '__GHOST_URL__/belajar-kotlin-2/']], ['a', ['href', 'https://belajarinformatika.id/about/']]] },
  )
  assert.equal(render(doc), '<p><a href="/blog/belajar-kotlin-2">part 2</a> and about</p>')
})

test('an embedded gist becomes a highlighted code block', () => {
  const doc = mobiledoc([[10, 0]], { cards: [['html', { html: '<script src="https://gist.github.com/someone/abc123.js"></script>' }]] })
  assert.equal(render(doc), '<pre data-code-language="kotlin"><code>fun main() = println(&quot;hi&quot;)</code></pre>')
})

test('a tweet embed becomes a quote that credits the account', () => {
  const html = '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Never set this<br>wallpaper <a href="https://t.co/x">pic</a></p>&mdash; someone</blockquote><script async src="https://platform.twitter.com/widgets.js"></script>'
  const doc = mobiledoc([[10, 0]], { cards: [['embed', { url: 'https://twitter.com/someone/status/123?s=20', html }]] })
  assert.equal(
    render(doc),
    '<blockquote><p>Never set this<br>wallpaper <a href="https://t.co/x">pic</a></p><cite><a href="https://twitter.com/someone/status/123">@someone on X</a></cite></blockquote>',
  )
})

test('markdown cards accept Ghost headings without a space and keep superscripts readable', () => {
  const doc = mobiledoc([[10, 0]], { cards: [['markdown', { markdown: '##Tipe Data\n\nMaksimal 2<sup>31</sup>' }]] })
  assert.match(render(doc), /^<h2 id="tipe-data">Tipe Data<a class="heading-anchor"[^>]*>#<\/a><\/h2>\n<p>Maksimal 2\^31<\/p>$/)
})

test('code languages Ghost used map onto the highlighter, unknown ones stay plain', () => {
  const doc = mobiledoc([[10, 0], [10, 1]], { cards: [['code', { code: 'ls', language: 'sh' }], ['code', { code: 'x', language: 'editorconfig' }]] })
  assert.equal(render(doc), '<pre data-code-language="bash"><code>ls</code></pre>\n<pre><code>x</code></pre>')
})

test('an unknown card fails the import instead of vanishing', () => {
  assert.throws(() => convertGhostPost(mobiledoc([[10, 0]], { cards: [['audio', {}]] }), context), /Unsupported card audio/)
})

test('an old site URL with no new home fails the import', () => {
  const doc = mobiledoc([[1, 'p', [[0, [], 0, 'see https://belajarinformatika.id/tag/linux/']]]])
  assert.throws(() => convertGhostPost(doc, context), /no new home/)
})

test('feature images: uploads move to /media, Unsplash stays hotlinked', () => {
  const images = new Set<string>()
  assert.equal(coverImageUrl('__GHOST_URL__/content/images/2022/03/cover.png', images), '/media/blog/belajarinformatika/2022/03/cover.png')
  assert.deepEqual([...images], ['2022/03/cover.png'])
  const unsplash = 'https://images.unsplash.com/photo-1?w=2000'
  assert.equal(coverImageUrl(unsplash, images), unsplash)
})
