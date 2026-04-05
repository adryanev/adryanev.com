import type { BlockTool, BlockToolConstructorOptions, BlockToolData } from '@editorjs/editorjs'
import type { Highlighter } from 'shiki'

interface CodeData extends BlockToolData {
  code: string
  language: string
}

const LANGUAGES = [
  'text',
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'json',
  'bash',
  'css',
  'html',
  'yaml',
  'sql',
  'dockerfile',
  'go',
  'rust',
  'python',
  'ruby',
  'dart',
  'kotlin',
  'swift',
  'markdown',
] as const

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: [...LANGUAGES].filter((l) => l !== 'text'),
      }),
    )
  }
  return highlighterPromise
}

export default class CodeTool implements BlockTool {
  private data: CodeData
  private wrapper: HTMLDivElement | null = null
  private textarea: HTMLTextAreaElement | null = null
  private preview: HTMLDivElement | null = null
  private highlightTimer: ReturnType<typeof setTimeout> | null = null

  static get toolbox() {
    return {
      title: 'Code',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    }
  }

  static get isReadOnlySupported() {
    return true
  }

  static get enableLineBreaks() {
    return true
  }

  constructor({ data }: BlockToolConstructorOptions<CodeData>) {
    this.data = {
      code: data?.code ?? '',
      language: data?.language ?? 'text',
    }
  }

  render(): HTMLDivElement {
    this.wrapper = document.createElement('div')
    this.wrapper.style.cssText = 'border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;'

    const toolbar = document.createElement('div')
    toolbar.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);'

    const label = document.createElement('span')
    label.textContent = 'Code'
    label.style.cssText = 'font-size: 12px; font-weight: 600; color: var(--text-secondary);'

    const select = document.createElement('select')
    select.style.cssText = 'font-size: 12px; padding: 2px 6px; border: 1px solid var(--border-color); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary); cursor: pointer;'
    for (const lang of LANGUAGES) {
      const option = document.createElement('option')
      option.value = lang
      option.textContent = lang
      if (lang === this.data.language) option.selected = true
      select.appendChild(option)
    }
    select.addEventListener('change', () => {
      this.data.language = select.value
      this.scheduleHighlight()
    })

    toolbar.appendChild(label)
    toolbar.appendChild(select)

    // Editing textarea (hidden when preview is shown)
    this.textarea = document.createElement('textarea')
    this.textarea.value = this.data.code
    this.textarea.placeholder = 'Enter code...'
    this.textarea.style.cssText = 'width: 100%; min-height: 120px; padding: 12px; font-family: var(--font-mono, monospace); font-size: 14px; line-height: 1.5; border: none; outline: none; resize: vertical; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box; tab-size: 2;'
    this.textarea.addEventListener('input', () => {
      this.data.code = this.textarea!.value
      this.scheduleHighlight()
    })
    this.textarea.addEventListener('focus', () => {
      this.textarea!.style.display = 'block'
      if (this.preview) this.preview.style.display = 'none'
    })
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = this.textarea!.selectionStart
        const end = this.textarea!.selectionEnd
        if (start === end) {
          this.textarea!.value = this.textarea!.value.substring(0, start) + '  ' + this.textarea!.value.substring(end)
          this.textarea!.selectionStart = this.textarea!.selectionEnd = start + 2
        } else {
          const value = this.textarea!.value
          const lineStart = value.lastIndexOf('\n', start - 1) + 1
          const selected = value.substring(lineStart, end)
          const indented = selected.replace(/^/gm, '  ')
          this.textarea!.value = value.substring(0, lineStart) + indented + value.substring(end)
          this.textarea!.selectionStart = start + 2
          this.textarea!.selectionEnd = end + (indented.length - selected.length)
        }
        this.data.code = this.textarea!.value
        this.textarea!.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    // Highlighted preview (click to edit)
    this.preview = document.createElement('div')
    this.preview.style.cssText = 'display: none; cursor: text; min-height: 120px;'
    this.preview.addEventListener('click', () => {
      if (this.preview) this.preview.style.display = 'none'
      this.textarea!.style.display = 'block'
      this.textarea!.focus()
    })

    this.wrapper.appendChild(toolbar)
    this.wrapper.appendChild(this.textarea)
    this.wrapper.appendChild(this.preview)

    // Show highlighted preview for existing code
    if (this.data.code) {
      this.renderHighlight()
    }

    return this.wrapper
  }

  private scheduleHighlight() {
    if (this.highlightTimer) clearTimeout(this.highlightTimer)
    this.highlightTimer = setTimeout(() => this.renderHighlight(), 500)
  }

  private async renderHighlight() {
    if (!this.preview || !this.data.code.trim() || this.data.language === 'text') {
      return
    }

    try {
      const highlighter = await getHighlighter()
      const supported = highlighter.getLoadedLanguages().includes(this.data.language)
      if (!supported) return

      const html = highlighter.codeToHtml(this.data.code, {
        themes: { dark: 'github-dark', light: 'github-light' },
        lang: this.data.language,
        defaultColor: false,
      })
      this.preview.innerHTML = html

      // Style the generated <pre> to match the textarea
      const pre = this.preview.querySelector('pre')
      if (pre) {
        pre.style.cssText = 'margin: 0; padding: 12px; font-family: var(--font-mono, monospace); font-size: 14px; line-height: 1.5; overflow-x: auto; tab-size: 2;'
      }

      // Show preview, hide textarea (only if not focused)
      if (document.activeElement !== this.textarea) {
        this.preview.style.display = 'block'
        this.textarea!.style.display = 'none'
      }
    } catch {
      // Highlight failed, keep textarea visible
    }
  }

  save(): CodeData {
    return {
      code: this.data.code,
      language: this.data.language,
    }
  }

  validate(data: CodeData): boolean {
    return !!data.code?.trim()
  }
}
