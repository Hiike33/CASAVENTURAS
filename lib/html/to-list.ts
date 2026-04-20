// Parse Bokun legacy HTML strings (included/excluded/attention/requirements)
// into a safe list of plain-text items. Tags are stripped, common entities
// decoded, and breaks (<br>, </li>) split items. Output is text-only — the
// UI renders it via {text} interpolation, never via raw HTML insertion.

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
  '&rsquo;': '\u2019',
  '&lsquo;': '\u2018',
  '&rdquo;': '\u201D',
  '&ldquo;': '\u201C',
  '&eacute;': '\u00E9',
  '&egrave;': '\u00E8',
  '&agrave;': '\u00E0',
  '&acirc;': '\u00E2',
  '&ccedil;': '\u00E7',
}

function decodeEntities(s: string): string {
  return s.replace(/&[#a-zA-Z0-9]+;/g, m => ENTITIES[m] ?? m)
}

export function htmlToList(html: string | undefined | null): string[] {
  if (!html) return []
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '')
  const textOnly = withBreaks.replace(/<[^>]+>/g, '')
  const decoded = decodeEntities(textOnly)
  return decoded
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}
