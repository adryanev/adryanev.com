import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { routeTree } from './routeTree.gen'

export function createAppRouter() {
  const queryClient = new QueryClient()
  return routerWithQueryClient(createRouter({ routeTree }), queryClient)
}

export const router = createAppRouter()

export function getRouter() {
  return createAppRouter()
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
