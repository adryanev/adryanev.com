import type { ProjectMetricsInput } from '../lib/project-metrics'

// Measured outcomes per project slug. Every figure restates one already in that
// project's description in seed-portfolio.ts; add a figure there first.
export const PORTFOLIO_METRICS: Record<string, ProjectMetricsInput> = {
  agenpro: {
    metrics: [
      { value: '30×', label: 'monthly sales value while I owned cart-to-order' },
      { value: '6×', label: 'store-visit-to-purchase conversion' },
    ],
    metricsNote: 'Active user base stayed flat over the same period.',
  },
  petanipro: {
    metrics: [
      { value: '99.9%', label: 'crash-free sessions across the SawitPRO apps' },
    ],
    metricsNote: null,
  },
  majoo: {
    metrics: [
      { value: '35,000+', label: 'merchants across 600 Indonesian cities on the rebuilt point-of-sale app' },
    ],
    metricsNote: null,
  },
  cinemata: {
    metrics: [
      { value: '87%', label: 'cut in page load times' },
      { value: '14 s → 2.6 s', label: 'build time after the move to Vite and React 19' },
    ],
    metricsNote: null,
  },
  'lexicon-beneficial-ownership': {
    metrics: [
      { value: '239k', label: 'entities resolved from 8.9M actor events' },
      { value: '93.5%', label: 'court-judgment extraction precision on core fields' },
    ],
    metricsNote: 'Precision measured on a pre-registered held-out set.',
  },
}
