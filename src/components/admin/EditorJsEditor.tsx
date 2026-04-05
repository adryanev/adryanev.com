import { useEffect, useRef, useCallback, useState } from 'react'
import type { OutputData, EditorConfig, ToolConstructable } from '@editorjs/editorjs'
import { useServerFn } from '@tanstack/react-start'
import { upload } from '@/server/functions/upload.functions'
import { FileText } from 'lucide-react'
import { markdownToEditorJs } from '@/lib/markdown-to-editorjs'

interface EditorJsEditorProps {
  value: OutputData | null
  onChange: (data: OutputData) => void
}

export function EditorJsEditor({ value, onChange }: EditorJsEditorProps) {
  const editorRef = useRef<InstanceType<typeof import('@editorjs/editorjs').default> | null>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  const initializedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [markdownInput, setMarkdownInput] = useState('')
  onChangeRef.current = onChange

  const uploadFn = useServerFn(upload)

  const createUploader = useCallback(() => ({
    async uploadByFile(file: File) {
      try {
        const buffer = await file.arrayBuffer()
        const result = await uploadFn({
          data: {
            contentType: file.type,
            fileSize: file.size,
            bytes: Array.from(new Uint8Array(buffer)),
          },
        })
        return {
          success: 1,
          file: { url: result.publicUrl },
        }
      } catch {
        return { success: 0, file: { url: '' } }
      }
    },
  }), [uploadFn])

  useEffect(() => {
    if (initializedRef.current || !holderRef.current) return
    initializedRef.current = true

    let editor: InstanceType<typeof import('@editorjs/editorjs').default> | null = null

    async function init() {
      const [
        { default: EditorJS },
        { default: Header },
        { default: NestedList },
        { default: Quote },
        { default: CodeTool },
        { default: Delimiter },
        { default: ImageTool },
        { default: InlineCode },
        { default: MermaidTool },
        { default: Table },
        { default: Embed },
        { default: Warning },
        { default: Marker },
        { default: Underline },
        { default: Raw },
      ] = await Promise.all([
        import('@editorjs/editorjs'),
        import('@editorjs/header'),
        import('@editorjs/nested-list'),
        import('@editorjs/quote'),
        import('./editorjs-code-tool'),
        import('@editorjs/delimiter'),
        import('@editorjs/image'),
        import('@editorjs/inline-code'),
        import('./editorjs-mermaid-tool'),
        import('@editorjs/table'),
        import('@editorjs/embed'),
        import('@editorjs/warning'),
        import('@editorjs/marker'),
        import('@editorjs/underline'),
        import('@editorjs/raw'),
      ])

      const config: EditorConfig = {
        holder: holderRef.current!,
        data: value ?? undefined,
        placeholder: 'Start writing...',
        tools: {
          header: {
            class: Header as unknown as ToolConstructable,
            config: { levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2 },
          },
          list: {
            class: NestedList as unknown as ToolConstructable,
            inlineToolbar: true,
          },
          quote: {
            class: Quote as unknown as ToolConstructable,
            inlineToolbar: true,
          },
          code: CodeTool as unknown as ToolConstructable,
          delimiter: Delimiter as unknown as ToolConstructable,
          image: {
            class: ImageTool as unknown as ToolConstructable,
            config: {
              uploader: createUploader(),
            },
          },
          inlineCode: {
            class: InlineCode as unknown as ToolConstructable,
          },
          mermaid: {
            class: MermaidTool as unknown as ToolConstructable,
          },
          table: {
            class: Table as unknown as ToolConstructable,
            inlineToolbar: true,
            config: { rows: 2, cols: 3 },
          },
          embed: {
            class: Embed as unknown as ToolConstructable,
            config: {
              services: {
                youtube: true,
                vimeo: true,
                codepen: true,
                github: true,
              },
            },
          },
          warning: {
            class: Warning as unknown as ToolConstructable,
            inlineToolbar: true,
            config: { titlePlaceholder: 'Title', messagePlaceholder: 'Message' },
          },
          marker: {
            class: Marker as unknown as ToolConstructable,
          },
          underline: {
            class: Underline as unknown as ToolConstructable,
          },
          raw: {
            class: Raw as unknown as ToolConstructable,
            config: { placeholder: 'Enter raw HTML...' },
          },
        },
        onChange: async (api) => {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(async () => {
            const data = await api.saver.save()
            onChangeRef.current(data)
          }, 300)
        },
      }

      editor = new EditorJS(config)
      await editor.isReady
      editorRef.current = editor
    }

    init().catch(() => {
      initializedRef.current = false
    })

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (editor) {
        editor.destroy()
        editorRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImportMarkdown = useCallback(() => {
    if (!markdownInput.trim() || !editorRef.current) return
    const data = markdownToEditorJs(markdownInput)
    editorRef.current.render(data).then(() => {
      onChangeRef.current(data)
      setMarkdownInput('')
      setShowImport(false)
    })
  }, [markdownInput])

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <button
          type="button"
          onClick={() => setShowImport(!showImport)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] border border-[var(--border-color)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          Import Markdown
        </button>
      </div>

      {showImport && (
        <div className="mb-3 border border-[var(--border-color)] rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Paste Markdown
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowImport(false); setMarkdownInput('') }}
                className="px-3 py-1 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportMarkdown}
                disabled={!markdownInput.trim()}
                className="px-3 py-1 text-xs font-bold bg-[var(--accent)] text-[var(--accent-fg)] rounded hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Import
              </button>
            </div>
          </div>
          <textarea
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            placeholder={'# Heading\n\nParagraph text with **bold** and *italic*.\n\n```typescript\nconst x = 1\n```'}
            className="w-full min-h-[200px] p-3 font-mono text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] border-none outline-none resize-y"
          />
        </div>
      )}

      <div
        ref={holderRef}
        className="editorjs-container min-h-[300px] border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-md p-4"
      />
    </div>
  )
}
