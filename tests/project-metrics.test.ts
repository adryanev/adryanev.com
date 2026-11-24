import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MAX_PROJECT_METRICS, METRIC_VALUE_MAX_LENGTH, parseProjectMetrics } from '../src/lib/project-metrics.ts'

test('metrics are trimmed and an empty note is stored as null', () => {
  assert.deepEqual(parseProjectMetrics({ metrics: [{ value: ' 30× ', label: ' monthly sales value ' }], metricsNote: '   ' }), {
    metrics: [{ value: '30×', label: 'monthly sales value' }],
    metricsNote: null,
  })
  assert.deepEqual(parseProjectMetrics({ metrics: [] }), { metrics: [], metricsNote: null })
  assert.equal(parseProjectMetrics({ metrics: [], metricsNote: ' Flat user base. ' }).metricsNote, 'Flat user base.')
})

test('incomplete, oversized or malformed metrics are rejected', () => {
  assert.throws(() => parseProjectMetrics({ metrics: [{ value: '30×', label: ' ' }] }), /needs a label/)
  assert.throws(() => parseProjectMetrics({ metrics: [{ value: '', label: 'sales' }] }), /needs a value/)
  assert.throws(() => parseProjectMetrics({ metrics: [{ value: 'x'.repeat(METRIC_VALUE_MAX_LENGTH + 1), label: 'sales' }] }), /at most/)
  const tooMany = Array.from({ length: MAX_PROJECT_METRICS + 1 }, () => ({ value: '1', label: 'a' }))
  assert.throws(() => parseProjectMetrics({ metrics: tooMany }), /at most/)
  assert.throws(() => parseProjectMetrics({ metrics: 'many' }))
  assert.throws(() => parseProjectMetrics({}))
  assert.throws(() => parseProjectMetrics(null))
})
