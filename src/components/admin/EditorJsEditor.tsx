import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type {
  OutputData,
  EditorConfig,
  ToolConstructable,
} from '@editorjs/editorjs'
import { createClientOnlyFn, useServerFn } from '@tanstack/react-start'
import { upload } from '@/server/functions/upload.functions'
import { FileText } from 'lucide-react'
import { markdownToEditorJs } from '@/lib/markdown-to-editorjs'
import { cn } from '@/lib/utils'

import { Feedback, Button, Textarea } from '@/components/ui'

// EditorJS, its tools, mermaid and the editor's Shiki stay out of the Worker bundle
const loadEditorModules = createClientOnlyFn(() =>
  Promise.all([
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
  ]),
)

const SAVE_DEBOUNCE_MS = 300

type EditorInstance = InstanceType<typeof import('@editorjs/editorjs').default>

interface EditorJsEditorProps {
  value: OutputData | null
  onChange: (data: OutputData) => void
  className?: string
}

export type EditorJsEditorHandle = {
  // Reports the editor's content now instead of after the debounce, and
  // resolves with it; null while the editor is still loading
  flush: () => Promise<OutputData | null>
}

export const EditorJsEditor = forwardRef<
  EditorJsEditorHandle,
  EditorJsEditorProps
>(function EditorJsEditor({ value, onChange, className }, ref) {
  const editorRef = useRef<EditorInstance | null>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveSequenceRef = useRef(0)
  const [showImport, setShowImport] = useState(false)
  const [markdownInput, setMarkdownInput] = useState('')
  const [editorError, setEditorError] = useState('')
  const [editorReady, setEditorReady] = useState(false)
  onChangeRef.current = onChange

  const uploadFn = useServerFn(upload)

  const createUploader = useCallback(
    () => ({
      async uploadByFile(file: File) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          const result = await uploadFn({ data: formData })
          return {
            success: 1,
            file: { url: result.publicUrl },
          }
        } catch {
          return { success: 0, file: { url: '' } }
        }
      },
    }),
    [uploadFn],
  )

  // save() is async, so a slow earlier save must not overwrite a later one
  const reportContent = useCallback(async (editor: EditorInstance) => {
    const sequence = ++saveSequenceRef.current
    const data = await editor.save()
    if (sequence === saveSequenceRef.current) onChangeRef.current(data)
    return data
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      async flush() {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = null
        const editor = editorRef.current
        return editor ? reportContent(editor) : null
      },
    }),
    [reportContent],
  )

  useEffect(() => {
    let cancelled = false
    let editor: EditorInstance | null = null

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
      ] = await loadEditorModules()
      if (cancelled || !holderRef.current) return

      const config: EditorConfig = {
        holder: holderRef.current,
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
            config: {
              titlePlaceholder: 'Title',
              messagePlaceholder: 'Message',
            },
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
        onChange: () => {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => {
            debounceRef.current = null
            if (editor) void reportContent(editor)
          }, SAVE_DEBOUNCE_MS)
        },
      }

      const created = new EditorJS(config)
      editor = created
      await created.isReady
      if (cancelled) return
      editorRef.current = created
      setEditorReady(true)
    }

    init().catch(() => {
      if (cancelled) return
      setEditorError(
        'The editor could not load. Reload this page before editing or saving content.',
      )
    })

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = null
      editorRef.current = null
      const created = editor
      if (created) created.isReady.then(() => created.destroy()).catch(() => {})
    }
    // The editor reads its first value once; a later value is rendered by
    // remounting it with a new key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImportMarkdown = useCallback(() => {
    if (!markdownInput.trim() || !editorRef.current) return
    if (
      value?.blocks.length &&
      !window.confirm('Replace the current editor content with this Markdown?')
    )
      return
    const data = markdownToEditorJs(markdownInput)
    editorRef.current
      .render(data)
      .then(() => {
        saveSequenceRef.current++
        onChangeRef.current(data)
        setMarkdownInput('')
        setShowImport(false)
      })
      .catch(() =>
        setEditorError('Markdown could not be imported. Please try again.'),
      )
  }, [markdownInput, value])

  return (
    <div>
      {!editorReady && !editorError && (
        <Feedback tone="info" role="status">
          Loading editor…
        </Feedback>
      )}
      {editorError && (
        <Feedback tone="danger" role="alert">
          {editorError}
        </Feedback>
      )}
      <div className="flex items-center justify-end mb-2">
        <Button
          variant="secondary"
          type="button"
          disabled={!editorReady}
          aria-expanded={showImport}
          onClick={() => setShowImport(!showImport)}
        >
          <FileText className="h-3.5 w-3.5" />
          Import Markdown
        </Button>
      </div>

      {showImport && (
        <div className="mb-3 border border-[var(--border-color)] rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Paste Markdown
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowImport(false)
                  setMarkdownInput('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleImportMarkdown}
                disabled={!markdownInput.trim()}
              >
                Import
              </Button>
            </div>
          </div>
          <Textarea
            appearance="plain"
            aria-label="Markdown to import"
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            placeholder={
              '# Heading\n\nParagraph text with **bold** and *italic*.\n\n```typescript\nconst x = 1\n```'
            }
            className="w-full min-h-[200px] p-3 font-mono text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] border-none outline-none resize-y"
          />
        </div>
      )}

      <div
        ref={holderRef}
        className={cn(
          'editorjs-container',
          className ??
            'min-h-[300px] border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-md p-4',
        )}
      />
    </div>
  )
})
