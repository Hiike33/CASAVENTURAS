import type { ReactNode } from 'react'

/**
 * Tiny static inline-markup parser used by legal / policy pages.
 *
 * Content source is author-controlled TypeScript in lib/cms/data/legal.*.ts,
 * never user input. We accept a small, closed safelist of tags:
 *
 *   <strong>…</strong>   → <strong>
 *   <em>…</em>           → <em>
 *   <code>…</code>       → <code class="...">
 *   <a href="…">…</a>    → <a> (absolute URLs open in a new tab, internal stay in-tab)
 *   <br /> / <br>        → <br />
 *
 * Unknown tags are preserved as plain text so a typo is visible, not dangerous.
 * No attributes other than `href` and our fixed code/anchor classes are parsed.
 */

type Node = { type: 'text'; value: string } | { type: 'tag'; name: string; attrs: Record<string, string>; children: Node[] }

const VOID_TAGS = new Set(['br'])
const ALLOWED_TAGS = new Set(['strong', 'em', 'code', 'a', 'br'])

export function renderInline(html: string): ReactNode[] {
  const nodes = parse(html)
  return nodes.map((n, i) => renderNode(n, i))
}

function renderNode(node: Node, key: number): ReactNode {
  if (node.type === 'text') return node.value
  const children = node.children.map((c, i) => renderNode(c, i))
  switch (node.name) {
    case 'strong':
      return <strong key={key}>{children}</strong>
    case 'em':
      return <em key={key}>{children}</em>
    case 'code':
      return (
        <code key={key} className="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">
          {children}
        </code>
      )
    case 'br':
      return <br key={key} />
    case 'a': {
      const href = node.attrs.href ?? '#'
      const external = /^https?:\/\//i.test(href)
      return (
        <a
          key={key}
          href={href}
          className="text-[#248D6C] hover:underline"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    }
    default:
      return <span key={key}>{children}</span>
  }
}

// Minimal recursive-descent parser. Tight because the grammar is tiny.
function parse(input: string): Node[] {
  const out: Node[] = []
  let i = 0
  while (i < input.length) {
    if (input[i] === '<') {
      const close = input.indexOf('>', i)
      if (close === -1) {
        out.push({ type: 'text', value: input.slice(i) })
        break
      }
      const raw = input.slice(i + 1, close).trim()
      const selfClose = raw.endsWith('/')
      const body = (selfClose ? raw.slice(0, -1) : raw).trim()
      const [nameRaw, ...attrParts] = body.split(/\s+/)
      const name = nameRaw.toLowerCase()
      if (!ALLOWED_TAGS.has(name)) {
        out.push({ type: 'text', value: input.slice(i, close + 1) })
        i = close + 1
        continue
      }
      const attrs = parseAttrs(attrParts.join(' '))
      if (selfClose || VOID_TAGS.has(name)) {
        out.push({ type: 'tag', name, attrs, children: [] })
        i = close + 1
        continue
      }
      const closeToken = `</${name}>`
      const closeIdx = findMatchingClose(input, close + 1, name)
      if (closeIdx === -1) {
        out.push({ type: 'text', value: input.slice(i, close + 1) })
        i = close + 1
        continue
      }
      const inner = input.slice(close + 1, closeIdx)
      out.push({ type: 'tag', name, attrs, children: parse(inner) })
      i = closeIdx + closeToken.length
    } else {
      const next = input.indexOf('<', i)
      if (next === -1) {
        out.push({ type: 'text', value: input.slice(i) })
        break
      }
      out.push({ type: 'text', value: input.slice(i, next) })
      i = next
    }
  }
  return out
}

function parseAttrs(input: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const matches = input.matchAll(/(\w+)\s*=\s*"([^"]*)"/g)
  for (const m of matches) {
    attrs[m[1].toLowerCase()] = m[2]
  }
  return attrs
}

// Walk character-by-character counting open/close tags of `name` so a nested
// <a> inside another <a> (shouldn't happen in legal, but defensive) does not
// close the outer early. Uses String#matchAll rather than regex.exec to keep
// the scan purely declarative.
function findMatchingClose(input: string, start: number, name: string): number {
  const slice = input.slice(start)
  const opens = [...slice.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))]
  const closes = [...slice.matchAll(new RegExp(`</${name}>`, 'gi'))]
  let depth = 1
  const events: Array<{ at: number; kind: 'open' | 'close'; len: number }> = []
  for (const o of opens) events.push({ at: o.index ?? 0, kind: 'open', len: o[0].length })
  for (const c of closes) events.push({ at: c.index ?? 0, kind: 'close', len: c[0].length })
  events.sort((a, b) => a.at - b.at)
  for (const ev of events) {
    if (ev.kind === 'open') depth += 1
    else {
      depth -= 1
      if (depth === 0) return start + ev.at
    }
  }
  return -1
}
