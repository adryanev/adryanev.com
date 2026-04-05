import type { BlockTool, BlockToolConstructorOptions, BlockToolData } from '@editorjs/editorjs'

interface MermaidData extends BlockToolData {
  code: string
}

export default class MermaidTool implements BlockTool {
  private data: MermaidData
  private wrapper: HTMLDivElement | null = null
  private textarea: HTMLTextAreaElement | null = null
  private preview: HTMLDivElement | null = null

  static get toolbox() {
    return {
      title: 'Mermaid Diagram',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-8"/></svg>',
    }
  }

  static get isReadOnlySupported() {
    return true
  }

  constructor({ data }: BlockToolConstructorOptions<MermaidData>) {
    this.data = { code: data?.code ?? '' }
  }

  render(): HTMLDivElement {
    this.wrapper = document.createElement('div')
    this.wrapper.style.cssText = 'border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;'

    const label = document.createElement('div')
    label.textContent = 'Mermaid Diagram'
    label.style.cssText = 'padding: 6px 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary); background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);'

    this.textarea = document.createElement('textarea')
    this.textarea.value = this.data.code
    this.textarea.placeholder = 'graph TD\n  A[Start] --> B[End]'
    this.textarea.style.cssText = 'width: 100%; min-height: 120px; padding: 12px; font-family: var(--font-mono, monospace); font-size: 14px; border: none; outline: none; resize: vertical; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box;'
    this.textarea.addEventListener('input', () => {
      this.data.code = this.textarea!.value
    })
    this.textarea.addEventListener('blur', () => this.renderPreview())

    this.preview = document.createElement('div')
    this.preview.style.cssText = 'padding: 12px; justify-content: center; overflow-x: auto; border-top: 1px solid var(--border-color); display: none;'

    this.wrapper.appendChild(label)
    this.wrapper.appendChild(this.textarea)
    this.wrapper.appendChild(this.preview)

    if (this.data.code) {
      setTimeout(() => this.renderPreview(), 100)
    }

    return this.wrapper
  }

  private async renderPreview() {
    if (!this.preview || !this.data.code.trim()) {
      if (this.preview) this.preview.style.display = 'none'
      return
    }

    try {
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
        fontFamily: 'JetBrains Mono, monospace',
      })
      const id = `mermaid-editor-${Date.now()}`
      const { svg } = await mermaid.render(id, this.data.code)
      this.preview.innerHTML = svg
      this.preview.style.display = 'flex'
    } catch {
      this.preview.innerHTML = '<span style="color: red; font-size: 13px;">Invalid mermaid syntax</span>'
      this.preview.style.display = 'flex'
    }
  }

  save(): MermaidData {
    return { code: this.data.code }
  }

  validate(data: MermaidData): boolean {
    return !!data.code?.trim()
  }
}
