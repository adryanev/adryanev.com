import type { BlockTool, BlockToolConstructorOptions, BlockToolData } from '@editorjs/editorjs'

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

export default class CodeTool implements BlockTool {
  private data: CodeData
  private wrapper: HTMLDivElement | null = null
  private textarea: HTMLTextAreaElement | null = null

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
    })

    toolbar.appendChild(label)
    toolbar.appendChild(select)

    this.textarea = document.createElement('textarea')
    this.textarea.value = this.data.code
    this.textarea.placeholder = 'Enter code...'
    this.textarea.style.cssText = 'width: 100%; min-height: 120px; padding: 12px; font-family: var(--font-mono, monospace); font-size: 14px; border: none; outline: none; resize: vertical; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box; tab-size: 2;'
    this.textarea.addEventListener('input', () => {
      this.data.code = this.textarea!.value
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

    this.wrapper.appendChild(toolbar)
    this.wrapper.appendChild(this.textarea)

    return this.wrapper
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
