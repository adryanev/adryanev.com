const MAX_TERMS = 8
const MAX_TERM_LENGTH = 64

// Every term is a quoted FTS5 string, so operators and syntax characters in
// user input are matched as text. The last term also matches as a prefix, to
// suit search-as-you-type. Returns null when nothing searchable remains.
export function toFtsMatchQuery(input: string): string | null {
  const terms = input
    .split(/\s+/)
    .map((term) => term.replace(/"/g, '').slice(0, MAX_TERM_LENGTH))
    .filter((term) => /[\p{L}\p{N}]/u.test(term))
    .slice(0, MAX_TERMS)

  if (terms.length === 0) return null

  const quoted = terms.map((term) => `"${term}"`)
  quoted[quoted.length - 1] += '*'
  return quoted.join(' ')
}
