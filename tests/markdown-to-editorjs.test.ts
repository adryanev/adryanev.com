import assert from 'node:assert/strict'
import { test } from 'node:test'
import { markdownToEditorJs } from '../src/lib/markdown-to-editorjs'
import { renderPostBody } from '../src/lib/editorjs-renderer'

function renderMarkdown(md: string): string {
  return renderPostBody(markdownToEditorJs(md)).html
}

test('inline code keeps comparison operators as text', () => {
  const html = renderMarkdown('Use `(a>b) || (a<c)` to combine checks')
  assert.match(html, /<code>\(a&gt;b\) \|\| \(a&lt;c\)<\/code> to combine checks/)
})

test('inline code inside a table cell keeps its operator', () => {
  const html = renderMarkdown('| Op | Meaning |\n|---|---|\n|`<`| less than |\n|`a || b`| either |')
  assert.match(html, /<td><code>&lt;<\/code><\/td><td>less than<\/td>/)
  assert.match(html, /<td><code>a \|\| b<\/code><\/td><td>either<\/td>/)
})

test('a fence indented under a list item becomes a code block', () => {
  const blocks = markdownToEditorJs('1. Install it\n\n   ```bash\n   sudo pacman -S git\n   ```\n2. Done').blocks
  assert.deepEqual(blocks.map((block) => block.type), ['list', 'code', 'list'])
  assert.equal(blocks[1].data.code, 'sudo pacman -S git')
  assert.equal(blocks[1].data.language, 'bash')
})
