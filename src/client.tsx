import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

// Suppress dev-mode hydration errors caused by TanStack Start placing
// dev assets (React Refresh script) in <body> while HeadContent expects
// them in <head>. These are cosmetic errors - React recovers via client
// rendering. See: https://github.com/TanStack/router/issues/6556
if (import.meta.env.DEV) {
  const origConsoleError = console.error
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : ''
    if (
      msg.includes('Hydration failed') ||
      msg.includes('hydrating') ||
      msg.includes('server HTML')
    ) {
      return
    }
    origConsoleError.apply(console, args)
  }
}

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
  {
    onRecoverableError(error) {
      if (
        import.meta.env.DEV &&
        error instanceof Error &&
        error.message.includes('Hydration')
      ) {
        return
      }
      console.error(error)
    },
  },
)
