// Languages the site highlights; kept free of Shiki so the server can import it
export const CODE_LANGUAGES = [
  'typescript', 'javascript', 'tsx', 'jsx', 'json', 'bash', 'css', 'html',
  'yaml', 'sql', 'dockerfile', 'go', 'rust', 'python', 'ruby', 'dart',
  'kotlin', 'swift', 'markdown',
] as const

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]

export function isCodeLanguage(value: string): value is CodeLanguage {
  return (CODE_LANGUAGES as readonly string[]).includes(value)
}
