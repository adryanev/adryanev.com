import { useEffect, useRef, useCallback } from 'react'
import type { OutputData, EditorConfig, ToolConstructable } from '@editorjs/editorjs'
import { useServerFn } from '@tanstack/react-start'
import { upload } from '@/server/functions/upload.functions'

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
      ])

      const config: EditorConfig = {
        holder: holderRef.current!,
        data: value ?? undefined,
        placeholder: 'Start writing...',
        tools: {
          header: {
            class: Header as unknown as ToolConstructable,
            config: { levels: [1, 2, 3], defaultLevel: 2 },
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

  return (
    <div
      ref={holderRef}
      className="editorjs-container min-h-[300px] border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-md p-4"
    />
  )
}
