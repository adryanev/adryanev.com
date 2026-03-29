import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react'
import { useMermaidRenderer } from '@/hooks/useMermaidRenderer'
import type { ReactNode } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link2,
  Image,
  List,
  ListOrdered,
  Quote,
  Minus,
  Eye,
  Pencil,
  Columns2,
  GitBranch,
  Upload,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { previewMarkdown } from '@/server/functions/posts.functions'
import { upload } from '@/server/functions/upload.functions'

type EditorMode = 'write' | 'preview' | 'split'

const EDITOR_HEIGHT = '36rem'

// --- Context ---

interface EditorContextValue {
  state: {
    value: string
    mode: EditorMode
    previewHtml: string
    uploadingCount: number
    isRendering: boolean
  }
  actions: {
    onChange: (value: string) => void
    setMode: (mode: EditorMode) => void
    wrap: (before: string, after?: string) => void
    insertLine: (prefix: string) => void
    insert: (text: string) => void
    uploadImage: (file: File) => void
  }
  refs: {
    textareaRef: React.RefObject<HTMLTextAreaElement>
    previewRef: React.RefObject<HTMLDivElement>
    fileInputRef: React.RefObject<HTMLInputElement>
  }
}

const EditorContext = createContext<EditorContextValue | null>(null)

function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('MarkdownEditor sub-components must be used within MarkdownEditor')
  return ctx
}

// --- Sub-components ---

function ModeToggle() {
  const { state: { mode }, actions: { setMode } } = useEditor()

  const modes = [
    { key: 'write' as const, icon: Pencil, label: 'Write' },
    { key: 'split' as const, icon: Columns2, label: 'Split' },
    { key: 'preview' as const, icon: Eye, label: 'Preview' },
  ]

  return (
    <div className="flex items-center gap-0.5 border border-[var(--border-color)] shrink-0">
      {modes.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => setMode(m.key)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors',
            mode === m.key
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
        >
          <m.icon className="h-3 w-3" /> {m.label}
        </button>
      ))}
    </div>
  )
}

function Toolbar() {
  const { state: { uploadingCount }, actions: { wrap, insertLine, insert }, refs: { fileInputRef } } = useEditor()

  const tools: { icon: React.ComponentType<{ className?: string }>; label: string; action: () => void; separator?: boolean }[] = [
    { icon: Bold, label: 'Bold', action: () => wrap('**') },
    { icon: Italic, label: 'Italic', action: () => wrap('_') },
    { icon: Code, label: 'Inline code', action: () => wrap('`') },
    { icon: Link2, label: 'Link', action: () => wrap('[', '](url)') },
    { icon: Upload, label: 'Upload image', action: () => fileInputRef.current?.click() },
    { icon: Image, label: 'Image URL', action: () => insert('![alt](url)') },
    { icon: Heading1, label: 'H1', action: () => insertLine('# '), separator: true },
    { icon: Heading2, label: 'H2', action: () => insertLine('## ') },
    { icon: Heading3, label: 'H3', action: () => insertLine('### ') },
    { icon: List, label: 'Bullet list', action: () => insertLine('- '), separator: true },
    { icon: ListOrdered, label: 'Numbered list', action: () => insertLine('1. ') },
    { icon: Quote, label: 'Blockquote', action: () => insertLine('> ') },
    { icon: Minus, label: 'Divider', action: () => insert('\n---\n') },
    { icon: GitBranch, label: 'Mermaid diagram', action: () => insert('\n```mermaid\ngraph TD\n  A-->B\n```\n'), separator: true },
  ]

  return (
    <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-2 py-1.5 gap-2 overflow-x-auto">
      <div className="flex items-center gap-0.5">
        {tools.map((tool, i) => (
          <div key={tool.label} className="flex items-center">
            {tool.separator && i > 0 && (
              <div className="mx-1 h-5 w-px bg-[var(--border-color)]" />
            )}
            <button
              type="button"
              onClick={tool.action}
              title={tool.label}
              className="flex h-7 w-7 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <tool.icon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {uploadingCount > 0 && (
          <>
            <div className="mx-1 h-5 w-px bg-[var(--border-color)]" />
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-mono text-[var(--accent)]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading\u2026
            </div>
          </>
        )}
      </div>
      <ModeToggle />
    </div>
  )
}

function WritePane() {
  const {
    state: { value, mode },
    actions: { onChange, wrap, insert, uploadImage },
    refs: { textareaRef },
  } = useEditor()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      insert('  ')
    }
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b') { e.preventDefault(); wrap('**') }
      if (e.key === 'i') { e.preventDefault(); wrap('_') }
      if (e.key === 'k') { e.preventDefault(); wrap('[', '](url)') }
    }
  }

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) uploadImage(file)
        return
      }
    }
  }, [uploadImage])

  const handleDrop = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer.files
    if (files.length === 0) return
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return
    e.preventDefault()
    imageFiles.forEach(uploadImage)
  }, [uploadImage])

  if (mode === 'preview') return null

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ height: EDITOR_HEIGHT }}
      className={cn(
        'w-full bg-[var(--bg-primary)] px-4 py-3 font-mono text-sm leading-relaxed outline-none resize-y overflow-y-auto',
        mode === 'split' && 'border-r border-[var(--border-color)]',
      )}
      placeholder="Write your markdown here… (paste or drop images to upload)"
    />
  )
}

function PreviewPane() {
  const { state: { mode, previewHtml, isRendering }, refs: { previewRef } } = useEditor()

  // Render mermaid diagrams
  useMermaidRenderer(previewRef, previewHtml, mode !== 'write')

  if (mode === 'write') return null

  return (
    <div
      ref={previewRef}
      className="relative overflow-y-auto"
      style={{ height: EDITOR_HEIGHT }}
    >
      {isRendering && (
        <div className="absolute top-2 right-2 text-[10px] font-mono uppercase text-[var(--text-secondary)] animate-pulse z-10">
          Rendering{'\u2026'}
        </div>
      )}
      <div
        className={cn(
          'prose dark:prose-invert max-w-none px-6 py-4',
          'prose-headings:font-serif prose-headings:font-bold prose-headings:text-[var(--text-primary)]',
          'prose-p:font-sans prose-p:text-[var(--text-secondary)]',
          'prose-a:text-[var(--accent)]',
          'prose-strong:text-[var(--text-primary)]',
          'prose-code:text-[var(--accent)] prose-code:bg-[var(--bg-secondary)] prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:border prose-pre:border-[var(--border-color)] prose-pre:rounded-none prose-pre:overflow-x-auto',
          'prose-blockquote:border-[var(--accent)] prose-blockquote:text-[var(--text-secondary)]',
          'prose-img:border prose-img:border-[var(--border-color)]',
        )}
        dangerouslySetInnerHTML={{
          __html: previewHtml || '<p style="color:var(--text-secondary);font-style:italic">Preview will appear here...</p>',
        }}
      />
    </div>
  )
}

function Footer() {
  const { state: { value } } = useEditor()
  const wordCount = value.split(/\s+/).filter(Boolean).length

  return (
    <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1.5 text-[10px] font-mono text-[var(--text-secondary)]">
      <span>{value.length} chars · {wordCount} words</span>
      <span>Markdown · Drop/paste images · Tab · Ctrl+B/I/K</span>
    </div>
  )
}

// --- Provider (Root) ---

function EditorProvider({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  const [mode, setMode] = useState<EditorMode>('write')
  const [previewHtml, setPreviewHtml] = useState('')
  const [uploadingCount, setUploadingCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  const previewFn = useServerFn(previewMarkdown)
  const uploadFn = useServerFn(upload)

  const renderMut = useMutation({
    mutationFn: (content: string) => previewFn({ data: { content } }),
    onSuccess: (html) => setPreviewHtml(html),
  })

  // Render preview when switching to preview/split mode
  useEffect(() => {
    if (mode !== 'write' && value.trim()) {
      renderMut.mutate(value)
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced re-render in split mode
  useEffect(() => {
    if (mode !== 'split' || !value.trim()) return
    const timer = setTimeout(() => renderMut.mutate(value), 800)
    return () => clearTimeout(timer)
  }, [value, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronized scrolling
  useEffect(() => {
    const ta = textareaRef.current
    const pv = previewRef.current
    if (mode !== 'split' || !ta || !pv) return

    let scrolling = false

    const syncFromEditor = () => {
      if (scrolling) return
      scrolling = true
      const scrollable = ta.scrollHeight - ta.clientHeight
      const ratio = scrollable > 0 ? ta.scrollTop / scrollable : 0
      pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight)
      requestAnimationFrame(() => { scrolling = false })
    }

    const syncFromPreview = () => {
      if (scrolling) return
      scrolling = true
      const scrollable = pv.scrollHeight - pv.clientHeight
      const ratio = scrollable > 0 ? pv.scrollTop / scrollable : 0
      ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight)
      requestAnimationFrame(() => { scrolling = false })
    }

    ta.addEventListener('scroll', syncFromEditor)
    pv.addEventListener('scroll', syncFromPreview)
    return () => {
      ta.removeEventListener('scroll', syncFromEditor)
      pv.removeEventListener('scroll', syncFromPreview)
    }
  }, [mode])

  const wrap = useCallback(
    (before: string, after: string = before) => {
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const selected = value.slice(start, end)
      const replacement = `${before}${selected || 'text'}${after}`
      const next = value.slice(0, start) + replacement + value.slice(end)
      onChange(next)
      requestAnimationFrame(() => {
        ta.focus()
        const newStart = start + before.length
        const newEnd = newStart + (selected || 'text').length
        ta.setSelectionRange(newStart, newEnd)
      })
    },
    [value, onChange],
  )

  const insertLine = useCallback(
    (prefix: string) => {
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
      onChange(next)
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(start + prefix.length, start + prefix.length)
      })
    },
    [value, onChange],
  )

  const insert = useCallback(
    (text: string) => {
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const next = value.slice(0, start) + text + value.slice(start)
      onChange(next)
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(start + text.length, start + text.length)
      })
    },
    [value, onChange],
  )

  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return

    const placeholder = `![Uploading ${file.name}...]()`
    const ta = textareaRef.current
    const insertPos = ta ? ta.selectionStart : value.length
    const before = value.slice(0, insertPos)
    const after = value.slice(insertPos)
    onChange(before + placeholder + after)
    setUploadingCount((c) => c + 1)

    try {
      const buffer = await file.arrayBuffer()
      const result = await uploadFn({
        data: {
          contentType: file.type,
          fileSize: file.size,
          bytes: Array.from(new Uint8Array(buffer)),
        },
      })
      const markdown = `![${file.name}](${result.publicUrl})`
      onChange(valueRef.current.replace(placeholder, markdown))
    } catch {
      onChange(valueRef.current.replace(placeholder, ''))
    } finally {
      setUploadingCount((c) => c - 1)
    }
  }, [value, onChange, uploadFn])

  const ctx: EditorContextValue = {
    state: {
      value,
      mode,
      previewHtml,
      uploadingCount,
      isRendering: renderMut.isPending,
    },
    actions: { onChange, setMode, wrap, insertLine, insert, uploadImage },
    refs: { textareaRef, previewRef, fileInputRef },
  }

  return (
    <EditorContext.Provider value={ctx}>
      {children}
    </EditorContext.Provider>
  )
}

function EditorFrame({ children }: { children: ReactNode }) {
  const { refs: { fileInputRef }, actions: { uploadImage } } = useEditor()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
    e.target.value = ''
  }

  return (
    <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)]">
      {children}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

// --- Composed default export ---

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <EditorProvider value={value} onChange={onChange}>
      <EditorFrame>
        <Toolbar />
        <div className={cn('grid')}>
          <EditorBody />
        </div>
        <Footer />
      </EditorFrame>
    </EditorProvider>
  )
}

function EditorBody() {
  const { state: { mode } } = useEditor()

  return (
    <div className={cn('grid', mode === 'split' ? 'grid-cols-2' : 'grid-cols-1')}>
      <WritePane />
      <PreviewPane />
    </div>
  )
}
