/// <reference types="vite/client" />

declare module '@editorjs/embed' {
  import type { ToolConstructable } from '@editorjs/editorjs'
  const Embed: ToolConstructable
  export default Embed
}

declare module '@editorjs/marker' {
  import type { ToolConstructable } from '@editorjs/editorjs'
  const Marker: ToolConstructable
  export default Marker
}

declare module '@editorjs/raw' {
  import type { ToolConstructable } from '@editorjs/editorjs'
  const Raw: ToolConstructable
  export default Raw
}
